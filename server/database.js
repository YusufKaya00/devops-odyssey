import fs from 'fs';
import path from 'path';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const USERDATA_PATH = path.join(process.cwd(), 'userdata.json');
const USER_ID = 'local_user';

let dbPool = null;
let isPostgres = false;

// Initialize PostgreSQL if connection string exists
if (process.env.DATABASE_URL) {
  try {
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Neon / Supabase in some environments
      }
    });
    isPostgres = true;
    console.log('Database Engine: PostgreSQL configured.');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL pool:', error.message);
    console.log('Database Engine: Falling back to local file storage.');
    isPostgres = false;
  }
} else {
  console.log('Database Engine: Local file storage configured. Define DATABASE_URL in .env to sync with cloud.');
}

// Ensure database tables exist in PostgreSQL
async function ensureTables() {
  if (!isPostgres) return;
  const client = await dbPool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        experience_points INT DEFAULT 0,
        streak INT DEFAULT 0,
        last_active_date VARCHAR(10)
      );
    `);
    
    // Completed quests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS completed_quests (
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        quest_key VARCHAR(100) NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, quest_key)
      );
    `);

    // Completed steps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS completed_steps (
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        quest_key VARCHAR(100) NOT NULL,
        step_index INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, quest_key, step_index)
      );
    `);

    // Insert default user if not exists
    await client.query(`
      INSERT INTO users (id, experience_points, streak, last_active_date)
      VALUES ($1, 0, 0, NULL)
      ON CONFLICT (id) DO NOTHING;
    `, [USER_ID]);

  } catch (e) {
    console.error('Error creating database tables:', e.message);
    isPostgres = false; // Fall back to local JSON if tables fail
  } finally {
    client.release();
  }
}

// Initialize Database connection and tables
export async function initDatabase() {
  if (isPostgres) {
    await ensureTables();
  }
}

// Local File Read fallback helper
function readLocalFile() {
  try {
    if (!fs.existsSync(USERDATA_PATH)) {
      const defaultData = { completedQuests: [], completedSteps: [], experiencePoints: 0, streak: 0, lastActiveDate: null };
      fs.writeFileSync(USERDATA_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(USERDATA_PATH, 'utf8');
    const parsed = JSON.parse(data);
    return {
      completedQuests: parsed.completedQuests || [],
      completedSteps: parsed.completedSteps || [],
      experiencePoints: parsed.experiencePoints || 0,
      streak: parsed.streak || 0,
      lastActiveDate: parsed.lastActiveDate || null
    };
  } catch (e) {
    console.error('Error reading local userdata:', e);
    return { completedQuests: [], completedSteps: [], experiencePoints: 0, streak: 0, lastActiveDate: null };
  }
}

// Local File Write fallback helper
function writeLocalFile(data) {
  try {
    fs.writeFileSync(USERDATA_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing local userdata:', e);
  }
}

// Get User Data (Dual Mode)
export async function getUserData() {
  if (isPostgres) {
    try {
      const userRes = await dbPool.query('SELECT * FROM users WHERE id = $1', [USER_ID]);
      const questsRes = await dbPool.query('SELECT quest_key FROM completed_quests WHERE user_id = $1', [USER_ID]);
      const stepsRes = await dbPool.query('SELECT quest_key, step_index FROM completed_steps WHERE user_id = $1', [USER_ID]);
      
      const user = userRes.rows[0];
      const completedQuests = questsRes.rows.map(r => r.quest_key);
      const completedSteps = stepsRes.rows.map(r => `${r.quest_key}:${r.step_index}`);

      return {
        completedQuests,
        completedSteps,
        experiencePoints: user ? user.experience_points : 0,
        streak: user ? user.streak : 0,
        lastActiveDate: user ? user.last_active_date : null,
        storageMode: 'PostgreSQL Cloud Database'
      };
    } catch (e) {
      console.error('PostgreSQL error reading user data, falling back to local storage:', e.message);
    }
  }
  
  // Local File mode
  const localData = readLocalFile();
  return {
    ...localData,
    storageMode: 'Local File Storage (userdata.json)'
  };
}

// Save User Data (Dual Mode)
export async function saveUserData(data) {
  if (isPostgres) {
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // Update users table
      await client.query(`
        UPDATE users 
        SET experience_points = $1, streak = $2, last_active_date = $3
        WHERE id = $4
      `, [data.experiencePoints, data.streak, data.lastActiveDate, USER_ID]);

      // Sync completed quests
      for (const questKey of data.completedQuests) {
        await client.query(`
          INSERT INTO completed_quests (user_id, quest_key)
          VALUES ($1, $2)
          ON CONFLICT (user_id, quest_key) DO NOTHING
        `, [USER_ID, questKey]);
      }

      // Sync completed steps
      if (data.completedSteps) {
        for (const stepStr of data.completedSteps) {
          const [questKey, stepIdxStr] = stepStr.split(':');
          const stepIndex = parseInt(stepIdxStr, 10);
          if (questKey && !isNaN(stepIndex)) {
            await client.query(`
              INSERT INTO completed_steps (user_id, quest_key, step_index)
              VALUES ($1, $2, $3)
              ON CONFLICT (user_id, quest_key, step_index) DO NOTHING
            `, [USER_ID, questKey, stepIndex]);
          }
        }
      }

      await client.query('COMMIT');
      return;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('PostgreSQL error writing user data, saving locally as backup:', e.message);
    } finally {
      client.release();
    }
  }

  // Local File mode
  writeLocalFile({
    completedQuests: data.completedQuests,
    completedSteps: data.completedSteps || [],
    experiencePoints: data.experiencePoints,
    streak: data.streak,
    lastActiveDate: data.lastActiveDate
  });
}

// Reset User Data (Dual Mode)
export async function resetUserData() {
  if (isPostgres) {
    try {
      await dbPool.query('DELETE FROM completed_quests WHERE user_id = $1', [USER_ID]);
      await dbPool.query('DELETE FROM completed_steps WHERE user_id = $1', [USER_ID]);
      await dbPool.query(`
        UPDATE users 
        SET experience_points = 0, streak = 0, last_active_date = NULL
        WHERE id = $1
      `, [USER_ID]);
      return;
    } catch (e) {
      console.error('PostgreSQL error resetting database data, resetting local storage:', e.message);
    }
  }

  const defaultData = { completedQuests: [], completedSteps: [], experiencePoints: 0, streak: 0, lastActiveDate: null };
  writeLocalFile(defaultData);
}

// Get storage type info helper
export function getStorageMode() {
  return isPostgres ? 'PostgreSQL Cloud Database' : 'Local File Storage (userdata.json)';
}
