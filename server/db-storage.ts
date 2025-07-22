import { db } from './db';
import { and, eq, desc, sql, between, gte, lte } from 'drizzle-orm';
import { 
  User, InsertUser,
  FitnessData, InsertFitnessData,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  Quest, InsertQuest,
  UserQuest, InsertUserQuest,
  Device, InsertDevice,
  Reward, InsertReward,
  UserReward, InsertUserReward,
  Dungeon, InsertDungeon,
  UserDungeon, InsertUserDungeon,
  users, fitnessData as fitnessDataTable, 
  achievements as achievementsTable, userAchievements as userAchievementsTable,
  quests as questsTable, userQuests as userQuestsTable,
  devices as devicesTable, rewards as rewardsTable, 
  userRewards as userRewardsTable, dungeons as dungeonsTable,
  userDungeons as userDungeonsTable
} from '../shared/schema';
import { IStorage } from './storage';

/**
 * PostgreSQL implementation of the storage interface
 */
export class DbStorage implements IStorage {
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const now = new Date();
    const result = await db.insert(users).values({
      ...user,
      level: 1,
      xp: 0,
      rank: "E",
      points: 0,
      createdAt: now
    }).returning();
    
    // Create initial fitness data for the user
    await this.createFitnessData({
      userId: result[0].id,
      date: now,
      steps: 0,
      calories: 0,
      activeMins: 0,
      workoutMins: 0,
      distance: 0
    });
    
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
      
    return result[0];
  }

  // Fitness data methods
  async getFitnessData(userId: number, date?: Date): Promise<FitnessData | undefined> {
    if (date) {
      // Convert date to start and end of the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const results = await db.select()
        .from(fitnessDataTable)
        .where(and(
          eq(fitnessDataTable.userId, userId),
          between(fitnessDataTable.date, startOfDay, endOfDay)
        ))
        .limit(1);
        
      return results[0];
    } else {
      // Get the most recent fitness data
      const results = await db.select()
        .from(fitnessDataTable)
        .where(eq(fitnessDataTable.userId, userId))
        .orderBy(desc(fitnessDataTable.date))
        .limit(1);
        
      return results[0];
    }
  }

  async getFitnessDataByDateRange(userId: number, startDate: Date, endDate: Date): Promise<FitnessData[]> {
    return db.select()
      .from(fitnessDataTable)
      .where(and(
        eq(fitnessDataTable.userId, userId),
        gte(fitnessDataTable.date, startDate),
        lte(fitnessDataTable.date, endDate)
      ))
      .orderBy(fitnessDataTable.date);
  }

  async createFitnessData(data: InsertFitnessData): Promise<FitnessData> {
    const result = await db.insert(fitnessDataTable)
      .values(data)
      .returning();
      
    return result[0];
  }

  async updateFitnessData(id: number, updates: Partial<FitnessData>): Promise<FitnessData | undefined> {
    const result = await db.update(fitnessDataTable)
      .set(updates)
      .where(eq(fitnessDataTable.id, id))
      .returning();
      
    return result[0];
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return db.select().from(achievementsTable);
  }

  async getUserAchievements(userId: number): Promise<(Achievement & { unlockedAt?: Date })[]> {
    const achievements = await this.getAchievements();
    const userAchievements = await db.select()
      .from(userAchievementsTable)
      .where(eq(userAchievementsTable.userId, userId));
      
    return achievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievementId === achievement.id
      );
      
      return {
        ...achievement,
        unlockedAt: userAchievement?.unlockedAt
      };
    });
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    // Check if the achievement exists
    const achievement = await db.select()
      .from(achievementsTable)
      .where(eq(achievementsTable.id, achievementId))
      .limit(1);
      
    if (!achievement[0]) {
      throw new Error(`Achievement with id ${achievementId} not found`);
    }
    
    // Create the user achievement
    const result = await db.insert(userAchievementsTable)
      .values({
        userId,
        achievementId,
        unlockedAt: new Date()
      })
      .returning();
      
    // Add XP and points to user
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUser(userId, {
        xp: user.xp + achievement[0].xpReward,
        points: user.points + achievement[0].pointsReward
      });
    }
    
    return result[0];
  }

  // Quest methods
  async getQuests(): Promise<Quest[]> {
    return db.select().from(questsTable);
  }

  async getUserQuests(userId: number): Promise<(UserQuest & Quest)[]> {
    const userQuests = await db.select()
      .from(userQuestsTable)
      .where(eq(userQuestsTable.userId, userId));
      
    const quests = await this.getQuests();
    
    return userQuests.map(userQuest => {
      const quest = quests.find(q => q.id === userQuest.questId);
      if (!quest) throw new Error(`Quest with id ${userQuest.questId} not found`);
      
      return {
        ...userQuest,
        ...quest
      };
    });
  }

  async assignQuestToUser(userQuest: InsertUserQuest): Promise<UserQuest> {
    const result = await db.insert(userQuestsTable)
      .values({
        ...userQuest,
        progress: 0,
        isCompleted: false
      })
      .returning();
      
    return result[0];
  }

  async updateUserQuest(id: number, updates: Partial<UserQuest>): Promise<UserQuest | undefined> {
    const originalUserQuest = await db.select()
      .from(userQuestsTable)
      .where(eq(userQuestsTable.id, id))
      .limit(1);
      
    if (!originalUserQuest[0]) {
      return undefined;
    }
    
    const result = await db.update(userQuestsTable)
      .set(updates)
      .where(eq(userQuestsTable.id, id))
      .returning();
      
    // If quest was completed, add XP and points to user
    if (updates.isCompleted && !originalUserQuest[0].isCompleted) {
      const quest = await db.select()
        .from(questsTable)
        .where(eq(questsTable.id, originalUserQuest[0].questId))
        .limit(1);
        
      if (quest[0]) {
        const user = await this.getUser(originalUserQuest[0].userId);
        if (user) {
          await this.updateUser(user.id, {
            xp: user.xp + quest[0].xpReward,
            points: user.points + quest[0].pointsReward
          });
        }
      }
    }
    
    return result[0];
  }

  // Device methods
  async getUserDevices(userId: number): Promise<Device[]> {
    return db.select()
      .from(devicesTable)
      .where(eq(devicesTable.userId, userId));
  }

  async addDevice(device: InsertDevice): Promise<Device> {
    const lastSynced = device.isConnected ? new Date() : null;
    
    const result = await db.insert(devicesTable)
      .values({
        ...device,
        lastSynced
      })
      .returning();
      
    return result[0];
  }

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device | undefined> {
    const result = await db.update(devicesTable)
      .set(updates)
      .where(eq(devicesTable.id, id))
      .returning();
      
    return result[0];
  }

  async deleteDevice(id: number): Promise<boolean> {
    const result = await db.delete(devicesTable)
      .where(eq(devicesTable.id, id))
      .returning();
      
    return result.length > 0;
  }

  // Reward methods
  async getRewards(): Promise<Reward[]> {
    return db.select().from(rewardsTable);
  }

  async getUserRewards(userId: number): Promise<(Reward & { redeemedAt: Date })[]> {
    const userRewards = await db.select()
      .from(userRewardsTable)
      .where(eq(userRewardsTable.userId, userId));
      
    const rewards = await this.getRewards();
    
    return userRewards.map(userReward => {
      const reward = rewards.find(r => r.id === userReward.rewardId);
      if (!reward) throw new Error(`Reward with id ${userReward.rewardId} not found`);
      
      return {
        ...reward,
        redeemedAt: userReward.redeemedAt
      };
    });
  }

  async redeemReward(userId: number, rewardId: number): Promise<UserReward> {
    // Check if the reward exists
    const reward = await db.select()
      .from(rewardsTable)
      .where(eq(rewardsTable.id, rewardId))
      .limit(1);
      
    if (!reward[0]) {
      throw new Error(`Reward with id ${rewardId} not found`);
    }
    
    // Create the user reward
    const result = await db.insert(userRewardsTable)
      .values({
        userId,
        rewardId,
        redeemedAt: new Date()
      })
      .returning();
      
    // Deduct points from user
    const user = await this.getUser(userId);
    if (user) {
      await this.updateUser(userId, {
        points: user.points - reward[0].pointsCost
      });
    }
    
    return result[0];
  }

  // Dungeon methods
  async getDungeons(): Promise<Dungeon[]> {
    return db.select().from(dungeonsTable);
  }
  
  async getDungeonById(id: number): Promise<Dungeon | undefined> {
    const results = await db.select()
      .from(dungeonsTable)
      .where(eq(dungeonsTable.id, id))
      .limit(1);
      
    return results[0];
  }
  
  async getDungeonsByRank(rank: string): Promise<Dungeon[]> {
    return db.select()
      .from(dungeonsTable)
      .where(eq(dungeonsTable.rank, rank));
  }
  
  async createDungeon(dungeon: InsertDungeon): Promise<Dungeon> {
    const result = await db.insert(dungeonsTable)
      .values({
        ...dungeon,
        createdAt: new Date()
      })
      .returning();
      
    return result[0];
  }
  
  async updateDungeon(id: number, updates: Partial<Dungeon>): Promise<Dungeon | undefined> {
    const result = await db.update(dungeonsTable)
      .set(updates)
      .where(eq(dungeonsTable.id, id))
      .returning();
      
    return result[0];
  }
  
  async getUserDungeons(userId: number): Promise<(UserDungeon & { dungeon: Dungeon })[]> {
    const userDungeons = await db.select()
      .from(userDungeonsTable)
      .where(eq(userDungeonsTable.userId, userId));
      
    const dungeons = await this.getDungeons();
    
    return userDungeons.map(userDungeon => {
      const dungeon = dungeons.find(d => d.id === userDungeon.dungeonId);
      if (!dungeon) throw new Error(`Dungeon with id ${userDungeon.dungeonId} not found`);
      
      return {
        ...userDungeon,
        dungeon
      };
    });
  }
  
  async startDungeon(userId: number, dungeonId: number): Promise<UserDungeon> {
    const result = await db.insert(userDungeonsTable)
      .values({
        userId,
        dungeonId,
        startTime: new Date(),
        status: "in_progress",
        stepsCompleted: 0,
        activeMinutesCompleted: 0
      })
      .returning();
      
    return result[0];
  }
  
  async updateUserDungeon(id: number, updates: Partial<UserDungeon>): Promise<UserDungeon | undefined> {
    const result = await db.update(userDungeonsTable)
      .set(updates)
      .where(eq(userDungeonsTable.id, id))
      .returning();
      
    return result[0];
  }
  
  async completeDungeon(userId: number, dungeonId: number, rewards: any): Promise<UserDungeon | undefined> {
    // Find the active user dungeon
    const userDungeons = await db.select()
      .from(userDungeonsTable)
      .where(and(
        eq(userDungeonsTable.userId, userId),
        eq(userDungeonsTable.dungeonId, dungeonId),
        eq(userDungeonsTable.status, "in_progress")
      ))
      .limit(1);
      
    if (!userDungeons[0]) {
      return undefined;
    }
    
    // Update the user dungeon
    const result = await db.update(userDungeonsTable)
      .set({
        endTime: new Date(),
        status: "completed",
        rewards
      })
      .where(eq(userDungeonsTable.id, userDungeons[0].id))
      .returning();
      
    // Add XP and points to user
    const user = await this.getUser(userId);
    if (user && rewards) {
      await this.updateUser(userId, {
        xp: user.xp + (rewards.xp || 0),
        points: user.points + (rewards.points || 0)
      });
    }
    
    return result[0];
  }

  // Leaderboard methods
  async getLeaderboard(): Promise<(User & { steps: number })[]> {
    // Get all users
    const allUsers = await db.select().from(users);
    const result: (User & { steps: number })[] = [];
    
    // For each user, get their latest fitness data
    for (const user of allUsers) {
      const fitnessData = await this.getFitnessData(user.id);
      const steps = fitnessData?.steps || 0;
      result.push({ ...user, steps });
    }
    
    // Sort by steps in descending order
    return result.sort((a, b) => b.steps - a.steps);
  }
}

// Create and export the database storage instance
export const dbStorage = new DbStorage();