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

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
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

// Middleware to authenticate Google ID token via Google Tokeninfo API
async function authenticateGoogleToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split(' ')[1];
    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!googleRes.ok) {
        return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
      }
      const payload = await googleRes.json();
      
      // Validate audience matches process.env.GOOGLE_CLIENT_ID
      const allowedClientIds = [process.env.GOOGLE_CLIENT_ID, process.env.VITE_GOOGLE_CLIENT_ID];
      if (!allowedClientIds.includes(payload.aud)) {
        return res.status(401).json({ success: false, message: 'Audience mismatch' });
      }

      req.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture
      };
    } catch (e) {
      console.error('Error validating Google token:', e);
      return res.status(401).json({ success: false, message: 'Authentication failed: ' + e.message });
    }
  } else {
    req.user = null;
  }
  next();
}

app.use(authenticateGoogleToken);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date() });
});

// Get User Profile & Progress
app.get('/api/status', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.headers['x-user-id'] || 'local_user');
    const email = req.user ? req.user.email : null;
    const displayName = req.user ? req.user.name : null;
    const avatarUrl = req.user ? req.user.avatarUrl : null;

    const data = await getUserData(userId, email, displayName, avatarUrl);
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
  const userId = req.user ? req.user.id : (req.headers['x-user-id'] || 'local_user');
  const email = req.user ? req.user.email : null;
  const displayName = req.user ? req.user.name : null;
  const avatarUrl = req.user ? req.user.avatarUrl : null;

  const { validatorKey, difficulty, isSimulated, stepIndex } = req.body;
  
  if (!validatorKey) {
    return res.status(400).json({ success: false, message: "Missing validatorKey parameter." });
  }

  // Handle single sub-step verification
  if (stepIndex !== undefined) {
    try {
      const data = await getUserData(userId, email, displayName, avatarUrl);
      const stepKey = `${validatorKey}:${stepIndex}`;
      if (!data.completedSteps) data.completedSteps = [];
      
      if (!data.completedSteps.includes(stepKey)) {
        data.completedSteps.push(stepKey);
        // Award 20 XP for completing a sub-step
        data.experiencePoints += 20;
        
        // Update active date
        const todayStr = new Date().toISOString().split('T')[0];
        data.lastActiveDate = todayStr;
        
        await saveUserData(userId, data);
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
      const data = await getUserData(userId, email, displayName, avatarUrl);
      
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
        
        await saveUserData(userId, data);
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

// Merge Progress
app.post('/api/merge-progress', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Google Authentication required to merge progress.' });
    }
    const targetUserId = req.user.id;
    const email = req.user.email;
    const displayName = req.user.name;
    const avatarUrl = req.user.avatarUrl;

    let localData = await getUserData('local_user');
    const targetData = await getUserData(targetUserId, email, displayName, avatarUrl);

    // Also merge from the local JSON file on disk (userdata_local_user.json) to cover mode switches
    const localUserFilePath = path.join(process.cwd(), 'userdata_local_user.json');
    if (fs.existsSync(localUserFilePath)) {
      try {
        const fileContent = fs.readFileSync(localUserFilePath, 'utf8');
        const fileData = JSON.parse(fileContent);
        if (fileData) {
          localData = {
            completedQuests: Array.from(new Set([...(localData.completedQuests || []), ...(fileData.completedQuests || [])])),
            completedSteps: Array.from(new Set([...(localData.completedSteps || []), ...(fileData.completedSteps || [])])),
            experiencePoints: Math.max(localData.experiencePoints || 0, fileData.experiencePoints || 0),
            streak: Math.max(localData.streak || 0, fileData.streak || 0),
            lastActiveDate: localData.lastActiveDate || fileData.lastActiveDate || null
          };
        }
      } catch (err) {
        console.error('Failed to read or parse local backup userdata_local_user.json during merge:', err);
      }
    }

    // Merge completed quests
    const mergedQuests = Array.from(new Set([...targetData.completedQuests, ...localData.completedQuests]));
    
    // Merge completed steps
    const mergedSteps = Array.from(new Set([...(targetData.completedSteps || []), ...(localData.completedSteps || [])]));

    // Take max of XP and streak
    const mergedXP = Math.max(targetData.experiencePoints || 0, localData.experiencePoints || 0);
    const mergedStreak = Math.max(targetData.streak || 0, localData.streak || 0);
    
    const mergedActiveDate = targetData.lastActiveDate || localData.lastActiveDate;

    const mergedData = {
      completedQuests: mergedQuests,
      completedSteps: mergedSteps,
      experiencePoints: mergedXP,
      streak: mergedStreak,
      lastActiveDate: mergedActiveDate,
      email: email,
      displayName: displayName,
      avatarUrl: avatarUrl
    };

    await saveUserData(targetUserId, mergedData);

    const levelInfo = calculateLevel(mergedXP);

    res.json({
      success: true,
      message: 'Progress successfully merged from guest account!',
      data: {
        ...mergedData,
        levelInfo,
        hostOS: process.platform,
        storageMode: getStorageMode()
      }
    });
  } catch (error) {
    console.error('Error merging progress:', error);
    res.status(500).json({ success: false, message: 'Failed to merge progress.' });
  }
});

// Reset progress
app.post('/api/reset', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.headers['x-user-id'] || 'local_user');
    await resetUserData(userId);
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
