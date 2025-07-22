import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertFitnessDataSchema,
  insertDeviceSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Fitness data routes
  app.get("/api/users/:id/fitness", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      
      const fitnessData = await storage.getFitnessData(userId, date);
      
      if (!fitnessData) {
        return res.status(404).json({ message: "Fitness data not found" });
      }
      
      return res.status(200).json(fitnessData);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/fitness/range", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const startDate = req.query.start ? new Date(req.query.start as string) : new Date();
      const endDate = req.query.end ? new Date(req.query.end as string) : new Date();
      
      // Default to last 7 days if no dates provided
      if (!req.query.start && !req.query.end) {
        startDate.setDate(startDate.getDate() - 7);
      }
      
      const fitnessData = await storage.getFitnessDataByDateRange(userId, startDate, endDate);
      
      return res.status(200).json(fitnessData);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:id/fitness", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const validatedData = insertFitnessDataSchema.parse({
        ...req.body,
        userId
      });
      
      const fitnessData = await storage.createFitnessData(validatedData);
      
      return res.status(201).json(fitnessData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:userId/fitness/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const fitnessDataId = parseInt(req.params.id);
      
      const fitnessData = await storage.updateFitnessData(fitnessDataId, req.body);
      
      if (!fitnessData) {
        return res.status(404).json({ message: "Fitness data not found" });
      }
      
      if (fitnessData.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.status(200).json(fitnessData);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Achievement routes
  app.get("/api/achievements", async (_req: Request, res: Response) => {
    try {
      const achievements = await storage.getAchievements();
      return res.status(200).json(achievements);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/achievements", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const achievements = await storage.getUserAchievements(userId);
      return res.status(200).json(achievements);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/achievements/:achievementId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievementId = parseInt(req.params.achievementId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userAchievement = await storage.unlockAchievement(userId, achievementId);
      return res.status(201).json(userAchievement);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Quest routes
  app.get("/api/quests", async (_req: Request, res: Response) => {
    try {
      const quests = await storage.getQuests();
      return res.status(200).json(quests);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/quests", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const quests = await storage.getUserQuests(userId);
      return res.status(200).json(quests);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/quests/:questId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const questId = parseInt(req.params.questId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const quest = await storage.getQuests().then(quests => 
        quests.find(q => q.id === questId)
      );
      
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      
      // Calculate expiry time based on quest duration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + quest.duration);
      
      const userQuest = await storage.assignQuestToUser({
        userId,
        questId,
        startedAt: new Date(),
        expiresAt
      });
      
      return res.status(201).json(userQuest);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:userId/quests/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const questId = parseInt(req.params.id);
      
      const userQuest = await storage.updateUserQuest(questId, req.body);
      
      if (!userQuest) {
        return res.status(404).json({ message: "User quest not found" });
      }
      
      if (userQuest.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.status(200).json(userQuest);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Device routes
  app.get("/api/users/:id/devices", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const devices = await storage.getUserDevices(userId);
      return res.status(200).json(devices);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:id/devices", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      const validatedData = insertDeviceSchema.parse({
        ...req.body,
        userId,
        isConnected: true,
        lastSynced: new Date()
      });
      
      const device = await storage.addDevice(validatedData);
      return res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/users/:userId/devices/:id", async (req: Request, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);
      const device = await storage.updateDevice(deviceId, req.body);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      return res.status(200).json(device);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/fitbit/sync", async (req: Request, res: Response) => {
    try {
      const { userId, deviceId } = req.body;
      
      if (!userId || !deviceId) {
        return res.status(400).json({ message: "User ID and Device ID are required" });
      }
      
      // First sync the device to update its lastSynced timestamp
      const device = await storage.syncDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      // Create mock fitness data for the sync
      const fitnessData = await storage.createFitnessData({
        userId,
        date: new Date(),
        steps: Math.floor(Math.random() * 5000) + 2000,
        calories: Math.floor(Math.random() * 500) + 200,
        activeMins: Math.floor(Math.random() * 60) + 10,
        workoutMins: Math.floor(Math.random() * 30) + 5,
        distance: Math.floor(Math.random() * 5) + 1,
        avgHeartRate: Math.floor(Math.random() * 40) + 60
      });
      
      return res.status(200).json({
        message: "Sync successful",
        device,
        fitnessData
      });
    } catch (error) {
      console.error("Sync error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/users/:userId/devices/:id", async (req: Request, res: Response) => {
    try {
      const deviceId = parseInt(req.params.id);
      await storage.removeDevice(deviceId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Reward routes
  app.get("/api/rewards", async (_req: Request, res: Response) => {
    try {
      const rewards = await storage.getRewards();
      return res.status(200).json(rewards);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/rewards", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const rewards = await storage.getUserRewards(userId);
      return res.status(200).json(rewards);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/rewards/:rewardId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const rewardId = parseInt(req.params.rewardId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const reward = await storage.getRewards().then(rewards => 
        rewards.find(r => r.id === rewardId)
      );
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Check if user has enough points and meets rank requirement
      if (user.points < reward.pointsCost) {
        return res.status(400).json({ message: "Not enough points" });
      }
      
      if (reward.requiredRank && user.rank < reward.requiredRank) {
        return res.status(400).json({ message: "Rank requirement not met" });
      }
      
      const userReward = await storage.redeemReward(userId, rewardId);
      return res.status(201).json(userReward);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Leaderboard route
  app.get("/api/leaderboard", async (_req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Dungeon API Routes
  app.get("/api/dungeons", async (_req: Request, res: Response) => {
    try {
      const dungeons = await storage.getDungeons();
      return res.status(200).json(dungeons);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/dungeons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dungeon ID" });
      }
      
      const dungeon = await storage.getDungeonById(id);
      if (!dungeon) {
        return res.status(404).json({ message: "Dungeon not found" });
      }
      
      return res.status(200).json(dungeon);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/dungeons/rank/:rank", async (req: Request, res: Response) => {
    try {
      const rank = req.params.rank.toUpperCase();
      const dungeons = await storage.getDungeonsByRank(rank);
      return res.status(200).json(dungeons);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/dungeons", async (req: Request, res: Response) => {
    try {
      const dungeon = req.body;
      const newDungeon = await storage.createDungeon(dungeon);
      return res.status(201).json(newDungeon);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/dungeons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dungeon ID" });
      }
      
      const updates = req.body;
      const updatedDungeon = await storage.updateDungeon(id, updates);
      
      if (!updatedDungeon) {
        return res.status(404).json({ message: "Dungeon not found" });
      }
      
      return res.status(200).json(updatedDungeon);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:userId/dungeons", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const userDungeons = await storage.getUserDungeons(userId);
      return res.status(200).json(userDungeons);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/dungeons/:dungeonId/start", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const dungeonId = parseInt(req.params.dungeonId);
      
      if (isNaN(userId) || isNaN(dungeonId)) {
        return res.status(400).json({ message: "Invalid user ID or dungeon ID" });
      }
      
      const userDungeon = await storage.startDungeon(userId, dungeonId);
      return res.status(201).json(userDungeon);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:userId/dungeons/:dungeonId/update", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const dungeonId = parseInt(req.params.dungeonId);
      
      if (isNaN(userId) || isNaN(dungeonId)) {
        return res.status(400).json({ message: "Invalid user ID or dungeon ID" });
      }
      
      // Find the user dungeon
      const userDungeons = await storage.getUserDungeons(userId);
      const userDungeon = userDungeons.find(ud => ud.dungeonId === dungeonId && ud.status === "in_progress");
      
      if (!userDungeon) {
        return res.status(404).json({ message: "Active user dungeon not found" });
      }
      
      // Update progress
      const updates = req.body;
      const updatedUserDungeon = await storage.updateUserDungeon(userDungeon.id, updates);
      
      return res.status(200).json(updatedUserDungeon);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/dungeons/:dungeonId/complete", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const dungeonId = parseInt(req.params.dungeonId);
      
      if (isNaN(userId) || isNaN(dungeonId)) {
        return res.status(400).json({ message: "Invalid user ID or dungeon ID" });
      }
      
      const rewards = req.body.rewards;
      const completedDungeon = await storage.completeDungeon(userId, dungeonId, rewards);
      
      if (!completedDungeon) {
        return res.status(404).json({ message: "Active user dungeon not found" });
      }
      
      return res.status(200).json(completedDungeon);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
