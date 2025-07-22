// In-memory storage implementation
class MemStorage {
  constructor() {
    this.users = new Map();
    this.fitnessData = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.quests = new Map();
    this.userQuests = new Map();
    this.devices = new Map();
    this.rewards = new Map();
    this.userRewards = new Map();
    this.dungeons = new Map();
    this.userDungeons = new Map();
    
    this.currentIds = {
      users: 1,
      fitnessData: 1,
      achievements: 1,
      userAchievements: 1,
      quests: 1,
      userQuests: 1,
      devices: 1,
      rewards: 1,
      userRewards: 1,
      dungeons: 1,
      userDungeons: 1
    };
    
    // Initialize with sample data
    this.initializeData();
  }

  initializeData() {
    // Initialize with test user
    const user = { 
      id: 1, 
      username: 'testuser',
      password: 'password',
      displayName: 'Test User',
      email: 'test@example.com',
      xp: 850,
      level: 7,
      points: 320,
      stamina: 100,
      rank: 'E',
      avatar: null,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    
    // Sample rewards
    const rewards = [
      {
        name: "Premium Protein Shake",
        description: "Unlock access to special recovery drink",
        image: "protein_shake.jpg",
        pointsCost: 150,
        isAvailable: true,
        requiredRank: null
      },
      {
        name: "Fitness Apparel Discount",
        description: "20% off at partnered fitness store",
        image: "fitness_apparel.jpg",
        pointsCost: 300,
        isAvailable: true,
        requiredRank: null
      },
      {
        name: "Premium Water Bottle",
        description: "Special holographic Hunter design",
        image: "water_bottle.jpg",
        pointsCost: 200,
        isAvailable: true,
        requiredRank: null
      },
      {
        name: "Resistance Bands Set",
        description: "Professional training equipment",
        image: "resistance_bands.jpg",
        pointsCost: 400,
        isAvailable: true,
        requiredRank: "D"
      },
      {
        name: "Premium Creatine Supply",
        description: "One month supply of highest quality creatine",
        image: "creatine.jpg",
        pointsCost: 350,
        isAvailable: true,
        requiredRank: "D"
      },
      {
        name: "Hunter-Grade Shoes",
        description: "Limited edition training shoes",
        image: "training_shoes.jpg",
        pointsCost: 800,
        isAvailable: true,
        requiredRank: "C"
      },
      {
        name: "Mystery S-Rank Reward",
        description: "Unlocks at S-Rank Hunter level",
        image: "mystery_reward.jpg",
        pointsCost: 1500,
        isAvailable: true,
        requiredRank: "S"
      }
    ];
    
    // Insert rewards
    rewards.forEach(reward => {
      const id = this.currentIds.rewards++;
      this.rewards.set(id, {
        ...reward,
        id
      });
    });
    
    // Sample achievements
    const achievements = [
      {
        name: "Fire Starter",
        description: "Burn 1,000 calories in a day",
        icon: "flame-outline",
        xpReward: 100,
        pointsReward: 50,
        requirement: { calories: 1000 },
        isUnlocked: false
      },
      {
        name: "Step Master",
        description: "10,000 steps for 5 days straight",
        icon: "footsteps-outline",
        xpReward: 200,
        pointsReward: 100,
        requirement: { steps: 10000, days: 5 },
        isUnlocked: false
      },
      {
        name: "Early Bird",
        description: "Work out before 7 AM",
        icon: "time-outline",
        xpReward: 75,
        pointsReward: 30,
        requirement: { timeOfDay: "7:00", workout: true },
        isUnlocked: false
      },
      {
        name: "Marathon Runner",
        description: "Run 26.2 miles in a month",
        icon: "walk-outline",
        xpReward: 300,
        pointsReward: 150,
        requirement: { distance: 42195, period: "month" },
        isUnlocked: false
      },
      {
        name: "Strength Lord",
        description: "Log 50 strength workouts",
        icon: "barbell-outline",
        xpReward: 250,
        pointsReward: 125,
        requirement: { workoutType: "strength", count: 50 },
        isUnlocked: false
      },
      {
        name: "Sleep Master",
        description: "8+ hours sleep for 7 days",
        icon: "bed-outline",
        xpReward: 150,
        pointsReward: 75,
        requirement: { sleep: 8, days: 7 },
        isUnlocked: false
      }
    ];
    
    // Insert achievements
    achievements.forEach(achievement => {
      const id = this.currentIds.achievements++;
      this.achievements.set(id, {
        ...achievement,
        id
      });
    });
    
    // Sample quests
    const quests = [
      {
        name: "Morning Movement",
        description: "Take 2,000 steps before 9 AM",
        icon: "walk-outline",
        xpReward: 150,
        pointsReward: 75,
        requirement: { steps: 2000, timeOfDay: "before 9:00" },
        duration: 180, // 3 hours
        questType: "daily"
      },
      {
        name: "Cardio Challenge",
        description: "20 minutes at elevated heart rate",
        icon: "heart-outline",
        xpReward: 200,
        pointsReward: 100,
        requirement: { heartRate: "elevated", duration: 20 },
        duration: 600, // 10 hours
        questType: "daily"
      },
      {
        name: "Weekly Boss",
        description: "Complete 5 workouts this week",
        icon: "trophy-outline",
        xpReward: 500,
        pointsReward: 250,
        requirement: { workouts: 5 },
        duration: 10080, // 7 days in minutes
        questType: "weekly"
      },
      {
        name: "Daily Steps Challenge",
        description: "Complete 8,000 steps today",
        icon: "footsteps-outline",
        xpReward: 180,
        pointsReward: 90,
        requirement: { steps: 8000 },
        duration: 1440, // 24 hours in minutes
        questType: "daily"
      },
      {
        name: "Push-Up Master",
        description: "Complete 20 push-ups",
        icon: "fitness-outline",
        xpReward: 120,
        pointsReward: 60,
        requirement: { exercise: "pushups", count: 20 },
        duration: 720, // 12 hours in minutes
        questType: "daily"
      },
      {
        name: "Squat Challenge",
        description: "Do 20 squats",
        icon: "barbell-outline",
        xpReward: 100,
        pointsReward: 50,
        requirement: { exercise: "squats", count: 20 },
        duration: 720, // 12 hours in minutes
        questType: "daily"
      },
      {
        name: "Lunges Circuit",
        description: "Complete 15 lunges on each leg",
        icon: "body-outline",
        xpReward: 110,
        pointsReward: 55,
        requirement: { exercise: "lunges", count: 15 },
        duration: 720, // 12 hours in minutes
        questType: "daily"
      },
      {
        name: "Cycling Explorer",
        description: "Complete a 5km cycling session",
        icon: "bicycle-outline",
        xpReward: 200,
        pointsReward: 100,
        requirement: { exercise: "cycling", distance: 5 },
        duration: 1440, // 24 hours in minutes
        questType: "daily"
      }
    ];
    
    // Insert quests
    quests.forEach(quest => {
      const id = this.currentIds.quests++;
      this.quests.set(id, {
        ...quest,
        id
      });
    });
    
    // Sample dungeons
    const dungeons = [
      {
        name: "Forest Gate",
        rank: "E",
        description: "A basic dungeon gate that appeared in the nearby forest. Perfect for new hunters.",
        minLevel: 1,
        requiredStamina: 20,
        timeLimit: 60, // 60 minutes
        rewards: { xp: 300, points: 100 },
        type: "standard",
        stepsRequired: 2000,
        activeMinutesRequired: 15,
        status: "available"
      },
      {
        name: "Underground Passage",
        rank: "E",
        description: "A slightly more challenging dungeon located beneath the city. Watch out for traps.",
        minLevel: 5,
        requiredStamina: 35,
        timeLimit: 90, // 90 minutes
        rewards: { xp: 500, points: 150 },
        type: "standard",
        stepsRequired: 3500,
        activeMinutesRequired: 25,
        status: "available"
      },
      {
        name: "Red Gate: Burning Fortress",
        rank: "D",
        description: "A dangerous red gate emitting intense heat. High risk, high reward.",
        minLevel: 15,
        requiredStamina: 60,
        timeLimit: 120, // 120 minutes
        rewards: { xp: 1200, points: 400, items: ["Fire Essence", "Hunter's Charm"] },
        boss: { name: "Flame Sentinel", difficulty: 5 },
        type: "red_gate",
        stepsRequired: 8000,
        activeMinutesRequired: 45,
        status: "available"
      },
      {
        name: "Frozen Cavern",
        rank: "C",
        description: "A vast ice dungeon with powerful monsters. Only for experienced hunters.",
        minLevel: 35,
        requiredStamina: 85,
        timeLimit: 180, // 180 minutes
        rewards: { xp: 2400, points: 800 },
        type: "standard",
        stepsRequired: 12000,
        activeMinutesRequired: 60,
        status: "available"
      }
    ];
    
    // Insert dungeons
    dungeons.forEach(dungeon => {
      const id = this.currentIds.dungeons++;
      this.dungeons.set(id, {
        ...dungeon,
        id,
        createdAt: new Date(),
        expiresAt: null
      });
    });
  }
  
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser) {
    const id = this.currentIds.users++;
    const now = new Date();
    const user = { 
      ...insertUser, 
      id, 
      level: 1,
      xp: 0,
      rank: "E",
      points: 0,
      createdAt: now
    };
    this.users.set(id, user);
    
    // Create initial fitness data for the user
    await this.createFitnessData({
      userId: id,
      date: now,
      steps: 0,
      calories: 0,
      activeMins: 0,
      workoutMins: 0,
      distance: 0
    });
    
    return user;
  }
  
  async updateUser(id, updates) {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Fitness data methods
  async getFitnessData(userId, date) {
    const userFitnessData = Array.from(this.fitnessData.values()).filter(
      data => data.userId === userId
    );
    
    if (!date) {
      // Get the most recent fitness data
      return userFitnessData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
    }
    
    const dateString = date.toDateString();
    return userFitnessData.find(data => 
      new Date(data.date).toDateString() === dateString
    );
  }
  
  async getFitnessDataByDateRange(userId, startDate, endDate) {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    return Array.from(this.fitnessData.values())
      .filter(data => 
        data.userId === userId &&
        new Date(data.date).getTime() >= startTime &&
        new Date(data.date).getTime() <= endTime
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async createFitnessData(data) {
    const id = this.currentIds.fitnessData++;
    const fitnessData = { ...data, id };
    this.fitnessData.set(id, fitnessData);
    return fitnessData;
  }
  
  async updateFitnessData(id, updates) {
    const fitnessData = this.fitnessData.get(id);
    if (!fitnessData) return undefined;
    
    const updatedData = { ...fitnessData, ...updates };
    this.fitnessData.set(id, updatedData);
    return updatedData;
  }
  
  // Achievement methods
  async getAchievements() {
    return Array.from(this.achievements.values());
  }
  
  async getUserAchievements(userId) {
    const userAchievements = Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId);
    
    return Array.from(this.achievements.values()).map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      return {
        ...achievement,
        unlockedAt: userAchievement?.unlockedAt
      };
    });
  }
  
  async unlockAchievement(userId, achievementId) {
    const id = this.currentIds.userAchievements++;
    const now = new Date();
    const userAchievement = {
      id,
      userId,
      achievementId,
      unlockedAt: now
    };
    
    this.userAchievements.set(id, userAchievement);
    
    // Add XP and points to user
    const achievement = this.achievements.get(achievementId);
    if (achievement) {
      const user = this.users.get(userId);
      if (user) {
        const updatedUser = {
          ...user,
          xp: user.xp + achievement.xpReward,
          points: user.points + achievement.pointsReward
        };
        this.users.set(userId, updatedUser);
      }
    }
    
    return userAchievement;
  }
  
  // Quest methods
  async getQuests() {
    return Array.from(this.quests.values());
  }
  
  async getUserQuests(userId) {
    const userQuests = Array.from(this.userQuests.values())
      .filter(uq => uq.userId === userId);
    
    return userQuests.map(userQuest => {
      const quest = this.quests.get(userQuest.questId);
      if (!quest) throw new Error(`Quest with id ${userQuest.questId} not found`);
      return {
        ...userQuest,
        ...quest
      };
    });
  }
  
  async assignQuestToUser(userQuest) {
    const id = this.currentIds.userQuests++;
    const newUserQuest = {
      ...userQuest,
      id,
      isCompleted: false
    };
    
    this.userQuests.set(id, newUserQuest);
    return newUserQuest;
  }
  
  async updateUserQuest(id, updates) {
    const userQuest = this.userQuests.get(id);
    if (!userQuest) return undefined;
    
    const updatedQuest = { ...userQuest, ...updates };
    this.userQuests.set(id, updatedQuest);
    
    // If quest is completed, add rewards to user
    if (updates.isCompleted && !userQuest.isCompleted) {
      const quest = this.quests.get(userQuest.questId);
      if (quest) {
        const user = this.users.get(userQuest.userId);
        if (user) {
          const updatedUser = {
            ...user,
            xp: user.xp + quest.xpReward,
            points: user.points + quest.pointsReward
          };
          this.users.set(user.id, updatedUser);
        }
      }
    }
    
    return updatedQuest;
  }
  
  // Device methods
  async getUserDevices(userId) {
    return Array.from(this.devices.values())
      .filter(device => device.userId === userId);
  }
  
  async addDevice(device) {
    const id = this.currentIds.devices++;
    const newDevice = {
      ...device,
      id
    };
    
    this.devices.set(id, newDevice);
    return newDevice;
  }
  
  async updateDevice(id, updates) {
    const device = this.devices.get(id);
    if (!device) return undefined;
    
    const updatedDevice = { ...device, ...updates };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }
  
  async deleteDevice(id) {
    if (!this.devices.has(id)) return false;
    
    this.devices.delete(id);
    return true;
  }
  
  // Reward methods
  async getRewards() {
    return Array.from(this.rewards.values());
  }
  
  async getUserRewards(userId) {
    const userRewards = Array.from(this.userRewards.values())
      .filter(ur => ur.userId === userId);
    
    return userRewards.map(userReward => {
      const reward = this.rewards.get(userReward.rewardId);
      if (!reward) throw new Error(`Reward with id ${userReward.rewardId} not found`);
      return {
        ...reward,
        redeemedAt: userReward.redeemedAt
      };
    });
  }
  
  async redeemReward(userId, rewardId) {
    const id = this.currentIds.userRewards++;
    const now = new Date();
    const userReward = {
      id,
      userId,
      rewardId,
      redeemedAt: now
    };
    
    this.userRewards.set(id, userReward);
    
    // Deduct points from user
    const reward = this.rewards.get(rewardId);
    if (reward) {
      const user = this.users.get(userId);
      if (user) {
        const updatedUser = {
          ...user,
          points: user.points - reward.pointsCost
        };
        this.users.set(userId, updatedUser);
      }
    }
    
    return userReward;
  }
  
  // Dungeon methods
  async getDungeons() {
    return Array.from(this.dungeons.values());
  }
  
  async getDungeonById(id) {
    return this.dungeons.get(id);
  }
  
  async getDungeonsByRank(rank) {
    return Array.from(this.dungeons.values())
      .filter(dungeon => dungeon.rank === rank);
  }
  
  async createDungeon(dungeon) {
    const id = this.currentIds.dungeons++;
    const now = new Date();
    const newDungeon = {
      ...dungeon,
      id,
      createdAt: now,
      expiresAt: null
    };
    
    this.dungeons.set(id, newDungeon);
    return newDungeon;
  }
  
  async updateDungeon(id, updates) {
    const dungeon = this.dungeons.get(id);
    if (!dungeon) return undefined;
    
    const updatedDungeon = { ...dungeon, ...updates };
    this.dungeons.set(id, updatedDungeon);
    return updatedDungeon;
  }
  
  async getUserDungeons(userId) {
    const userDungeons = Array.from(this.userDungeons.values())
      .filter(ud => ud.userId === userId);
    
    return userDungeons.map(userDungeon => {
      const dungeon = this.dungeons.get(userDungeon.dungeonId);
      if (!dungeon) throw new Error(`Dungeon with id ${userDungeon.dungeonId} not found`);
      return {
        ...userDungeon,
        dungeon
      };
    });
  }
  
  async startDungeon(userId, dungeonId) {
    const id = this.currentIds.userDungeons++;
    const now = new Date();
    
    const dungeon = this.dungeons.get(dungeonId);
    if (!dungeon) throw new Error(`Dungeon with id ${dungeonId} not found`);
    
    // Calculate end time based on dungeon time limit
    const endTime = new Date(now);
    endTime.setMinutes(endTime.getMinutes() + dungeon.timeLimit);
    
    const userDungeon = {
      id,
      userId,
      dungeonId,
      startedAt: now,
      completedAt: null,
      currentSteps: 0,
      currentActiveMinutes: 0,
      status: "in_progress",
      endTime
    };
    
    this.userDungeons.set(id, userDungeon);
    
    // Deduct stamina from user
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        stamina: user.stamina - dungeon.requiredStamina
      };
      this.users.set(userId, updatedUser);
    }
    
    return userDungeon;
  }
  
  async updateUserDungeon(id, updates) {
    const userDungeon = this.userDungeons.get(id);
    if (!userDungeon) return undefined;
    
    const updatedDungeon = { ...userDungeon, ...updates };
    this.userDungeons.set(id, updatedDungeon);
    return updatedDungeon;
  }
  
  async completeDungeon(userId, dungeonId, rewards) {
    const userDungeons = Array.from(this.userDungeons.values()).filter(
      ud => ud.userId === userId && ud.dungeonId === dungeonId && ud.status === "in_progress"
    );
    
    if (userDungeons.length === 0) return undefined;
    
    const userDungeon = userDungeons[0];
    const now = new Date();
    
    const updatedUserDungeon = {
      ...userDungeon,
      completedAt: now,
      status: "completed"
    };
    
    this.userDungeons.set(userDungeon.id, updatedUserDungeon);
    
    // Add rewards to user
    const dungeon = this.dungeons.get(dungeonId);
    if (dungeon && dungeon.rewards) {
      const user = this.users.get(userId);
      if (user) {
        const updatedUser = {
          ...user,
          xp: user.xp + (dungeon.rewards.xp || 0),
          points: user.points + (dungeon.rewards.points || 0)
        };
        this.users.set(userId, updatedUser);
      }
    }
    
    return updatedUserDungeon;
  }
  
  // Leaderboard methods
  async getLeaderboard() {
    // Get total steps for each user from fitness data
    const userSteps = new Map();
    Array.from(this.fitnessData.values()).forEach(data => {
      const userId = data.userId;
      const steps = data.steps || 0;
      
      if (!userSteps.has(userId)) {
        userSteps.set(userId, 0);
      }
      
      userSteps.set(userId, userSteps.get(userId) + steps);
    });
    
    // Combine user data with steps
    const leaderboardData = Array.from(this.users.values()).map(user => ({
      ...user,
      steps: userSteps.get(user.id) || 0
    }));
    
    // Sort by steps (descending)
    return leaderboardData.sort((a, b) => b.steps - a.steps);
  }
}

// Export the storage instance
const storage = new MemStorage();
module.exports = { storage };