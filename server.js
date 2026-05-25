import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validators } from './server/validators.js';
import {
  initDatabase,
  getUserData,
  saveUserData,
  resetUserData,
  getStorageMode
} from './server/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup to allow request from frontend dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

const SANDBOX_DIR = path.join(process.cwd(), 'devops-sandbox');

// Ensure Sandbox directory exists
if (!fs.existsSync(SANDBOX_DIR)) {
  fs.mkdirSync(SANDBOX_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(SANDBOX_DIR, 'README.md'), 
    '# DevOps Sandbox\nUse this directory to perform your quest tasks, run commands, and practice configurations.\n'
  );
  console.log('Created devops-sandbox workspace directory.');
}

// XP Mapping by Difficulty
const XP_VALUES = {
  Beginner: 100,
  Intermediate: 200,
  Advanced: 300
};

// XP to Level Mapper
function calculateLevel(xp) {
  if (xp < 200) return { level: 1, title: 'DevOps Novice', nextLevelXp: 200 };
  if (xp < 500) return { level: 2, title: 'Linux Apprentice', nextLevelXp: 500 };
  if (xp < 1000) return { level: 3, title: 'Docker Operator', nextLevelXp: 1000 };
  if (xp < 1800) return { level: 4, title: 'Kubernetes Engineer', nextLevelXp: 1800 };
  return { level: 5, title: 'Cloud Architect', nextLevelXp: 3000 };
}

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date() });
});

// Get User Profile & Progress
app.get('/api/status', async (req, res) => {
  try {
    const data = await getUserData();
    const levelInfo = calculateLevel(data.experiencePoints);
    res.json({
      ...data,
      levelInfo,
      hostOS: process.platform,
      storageMode: getStorageMode()
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ success: false, message: 'Failed to read status data.' });
  }
});

// Verify a Quest
app.post('/api/verify', async (req, res) => {
  const { validatorKey, difficulty, isSimulated, stepIndex } = req.body;
  
  if (!validatorKey) {
    return res.status(400).json({ success: false, message: "Missing validatorKey parameter." });
  }

  // Handle single sub-step verification
  if (stepIndex !== undefined) {
    try {
      const data = await getUserData();
      const stepKey = `${validatorKey}:${stepIndex}`;
      if (!data.completedSteps) data.completedSteps = [];
      
      if (!data.completedSteps.includes(stepKey)) {
        data.completedSteps.push(stepKey);
        // Award 20 XP for completing a sub-step
        data.experiencePoints += 20;
        
        // Update active date
        const todayStr = new Date().toISOString().split('T')[0];
        data.lastActiveDate = todayStr;
        
        await saveUserData(data);
      }
      
      const levelInfo = calculateLevel(data.experiencePoints);
      return res.json({
        success: true,
        message: `Step ${stepIndex + 1} verified and saved.`,
        data: {
          ...data,
          levelInfo,
          hostOS: process.platform,
          storageMode: getStorageMode()
        }
      });
    } catch (error) {
      console.error('Error saving sub-step:', error);
      return res.status(500).json({ success: false, message: "Error saving sub-step: " + error.message });
    }
  }

  let result = { success: false, message: "" };
  if (isSimulated) {
    result = { success: true, message: `[Simulated] Quest '${validatorKey}' completed successfully in the browser simulator!` };
  } else {
    const validator = validators[validatorKey];
    if (!validator) {
      return res.status(404).json({ success: false, message: `Validator for '${validatorKey}' not found.` });
    }

    console.log(`Running validator for quest: ${validatorKey}...`);
    try {
      result = await validator();
    } catch (error) {
      console.error(`Error during validation of ${validatorKey}:`, error);
      return res.status(500).json({ success: false, message: "Internal validation server error: " + error.message });
    }
  }

  try {
    if (result.success) {
      const data = await getUserData();
      
      // Update data if not already completed
      if (!data.completedQuests.includes(validatorKey)) {
        data.completedQuests.push(validatorKey);
        
        // Add XP
        const xpToAdd = XP_VALUES[difficulty] || 100;
        data.experiencePoints += xpToAdd;

        // Update streak
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.lastActiveDate) {
          const lastActive = new Date(data.lastActiveDate);
          const today = new Date(todayStr);
          const diffTime = Math.abs(today - lastActive);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            data.streak += 1;
          } else if (diffDays > 1) {
            data.streak = 1; // Reset streak
          }
        } else {
          data.streak = 1;
        }
        data.lastActiveDate = todayStr;
        
        await saveUserData(data);
      }

      const levelInfo = calculateLevel(data.experiencePoints);
      return res.json({
        success: true,
        message: result.message,
        data: {
          ...data,
          levelInfo,
          hostOS: process.platform,
          storageMode: getStorageMode()
        }
      });
    } else {
      return res.json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error(`Error during validation of ${validatorKey}:`, error);
    return res.status(500).json({ success: false, message: "Internal validation server error: " + error.message });
  }
});

// Reset progress
app.post('/api/reset', async (req, res) => {
  try {
    await resetUserData();
    const defaultData = { completedQuests: [], completedSteps: [], experiencePoints: 0, streak: 0, lastActiveDate: null };
    res.json({
      success: true,
      message: "User progress reset successfully.",
      data: {
        ...defaultData,
        levelInfo: calculateLevel(0),
        hostOS: process.platform,
        storageMode: getStorageMode()
      }
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ success: false, message: 'Failed to reset progress.' });
  }
});

// Initialize database connection, then start web server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`DevOps Simulation Server running on http://localhost:${PORT}`);
  });
}

startServer();
