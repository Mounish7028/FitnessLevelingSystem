const { createServer } = require("http");
const { storage } = require("./storage");
const { 
  insertUserSchema,
  insertFitnessDataSchema,
  insertDeviceSchema
} = require("../shared/schema");
const { z } = require("zod");

async function registerRoutes(app) {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
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
  
  app.post("/api/auth/login", async (req, res) => {
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
  app.get("/api/users/:id", async (req, res) => {
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
  app.get("/api/users/:id/fitness", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const date = req.query.date ? new Date(req.query.date) : undefined;
      
      const fitnessData = await storage.getFitnessData(userId, date);
      
      if (!fitnessData) {
        return res.status(404).json({ message: "Fitness data not found" });
      }
      
      return res.status(200).json(fitnessData);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/fitness/range", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const startDate = req.query.start ? new Date(req.query.start) : new Date();
      const endDate = req.query.end ? new Date(req.query.end) : new Date();
      
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
  
  app.post("/api/users/:id/fitness", async (req, res) => {
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
  
  app.put("/api/users/:userId/fitness/:id", async (req, res) => {
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
  app.get("/api/achievements", async (_req, res) => {
    try {
      const achievements = await storage.getAchievements();
      return res.status(200).json(achievements);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const achievements = await storage.getUserAchievements(userId);
      return res.status(200).json(achievements);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/achievements/:achievementId", async (req, res) => {
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
  app.get("/api/quests", async (_req, res) => {
    try {
      const quests = await storage.getQuests();
      return res.status(200).json(quests);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/quests", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      let quests = await storage.getUserQuests(userId);
      
      // If user doesn't have any quests, assign some default ones
      if (quests.length === 0) {
        const allQuests = await storage.getQuests();
        // Take the first 3 quests from the list
        const defaultQuests = allQuests.slice(0, 3);
        
        // Assign these quests to the user
        for (const quest of defaultQuests) {
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + quest.duration);
          
          await storage.assignQuestToUser({
            userId,
            questId: quest.id,
            startedAt: new Date(),
            expiresAt,
            progress: Math.floor(Math.random() * 50) // Random progress 0-50%
          });
        }
        
        // Get the updated user quests
        quests = await storage.getUserQuests(userId);
      }
      
      return res.status(200).json(quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/quests/:questId", async (req, res) => {
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
  
  app.put("/api/users/:userId/quests/:id", async (req, res) => {
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
  app.get("/api/users/:id/devices", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const devices = await storage.getUserDevices(userId);
      return res.status(200).json(devices);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:id/devices", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const validatedData = insertDeviceSchema.parse({
        ...req.body,
        userId
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
  
  app.put("/api/users/:userId/devices/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const deviceId = parseInt(req.params.id);
      
      const device = await storage.updateDevice(deviceId, req.body);
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      if (device.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.status(200).json(device);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/users/:userId/devices/:id", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const success = await storage.deleteDevice(deviceId);
      
      if (!success) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Reward routes
  app.get("/api/rewards", async (_req, res) => {
    try {
      const rewards = await storage.getRewards();
      return res.status(200).json(rewards);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/users/:id/rewards", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const rewards = await storage.getUserRewards(userId);
      return res.status(200).json(rewards);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/users/:userId/rewards/:rewardId", async (req, res) => {
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
  app.get("/api/leaderboard", async (_req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Assign workout quests (pushups, squats, lunges, cycling)
  app.post("/api/users/:userId/workout-quests", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get all available quests
      const allQuests = await storage.getQuests();
      
      // Filter workout specific quests (pushups, squats, lunges, cycling)
      const workoutQuests = allQuests.filter(quest => 
        quest.requirement && 
        quest.requirement.exercise && 
        ["pushups", "squats", "lunges", "cycling"].includes(quest.requirement.exercise)
      );
      
      // Assign these quests to the user
      const assignedQuests = [];
      for (const quest of workoutQuests) {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + quest.duration);
        
        const userQuest = await storage.assignQuestToUser({
          userId,
          questId: quest.id,
          startedAt: new Date(),
          expiresAt,
          progress: Math.floor(Math.random() * 30) // Random progress 0-30%
        });
        
        assignedQuests.push({...userQuest, ...quest});
      }
      
      return res.status(201).json(assignedQuests);
    } catch (error) {
      console.error("Error assigning workout quests:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Fitbit sync route (for demo/mock purposes)
  app.post("/api/fitbit/sync", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Create some mock fitness data
      const fitnessData = await storage.createFitnessData({
        userId,
        date: new Date(),
        steps: Math.floor(Math.random() * 5000) + 2000,
        calories: Math.floor(Math.random() * 500) + 200,
        activeMins: Math.floor(Math.random() * 60) + 10,
        workoutMins: Math.floor(Math.random() * 30) + 5,
        distance: Math.floor(Math.random() * 5) + 1
      });
      
      return res.status(200).json({
        message: "Sync successful",
        data: fitnessData
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Create and return HTTP server
  const server = createServer(app);
  return server;
}

module.exports = { registerRoutes };