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
    let connectionString = process.env.DATABASE_URL;
    try {
      const url = new URL(connectionString);
      if (url.searchParams.has('sslmode')) {
        url.searchParams.delete('sslmode');
        connectionString = url.toString();
      }
    } catch (urlError) {
      // Fallback if not a standard URL format
    }

    dbPool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Neon / Supabase in some environments
      }
    });
    dbPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err.message);
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
  let client;
  try {
    client = await dbPool.connect();
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        experience_points INT DEFAULT 0,
        streak INT DEFAULT 0,
        last_active_date VARCHAR(10)
      );
    `);

    // Alter table to add Google Profile columns if they don't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
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
    console.error('Error connecting to database or creating tables:', e.message);
    isPostgres = false; // Fall back to local JSON if tables fail
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Initialize Database connection and tables
export async function initDatabase() {
  if (isPostgres) {
    await ensureTables();
  }
}

// Local File Read fallback helper
function readLocalFile(userId) {
  const safeId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const userFilePath = path.join(process.cwd(), `userdata_${safeId}.json`);
  const legacyFilePath = path.join(process.cwd(), 'userdata.json');

  try {
    if (!fs.existsSync(userFilePath)) {
      if (userId === 'local_user' && fs.existsSync(legacyFilePath)) {
        try {
          fs.copyFileSync(legacyFilePath, userFilePath);
          console.log(`Migrated legacy userdata.json to userdata_local_user.json`);
        } catch (err) {
          console.error('Error copying legacy userdata:', err);
        }
      } else {
        const defaultData = {
          completedQuests: [],
          completedSteps: [],
          experiencePoints: 0,
          streak: 0,
          lastActiveDate: null,
          email: null,
          displayName: null,
          avatarUrl: null
        };
        fs.writeFileSync(userFilePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
      }
    }
    const data = fs.readFileSync(userFilePath, 'utf8');
    const parsed = JSON.parse(data);
    return {
      completedQuests: parsed.completedQuests || [],
      completedSteps: parsed.completedSteps || [],
      experiencePoints: parsed.experiencePoints || 0,
      streak: parsed.streak || 0,
      lastActiveDate: parsed.lastActiveDate || null,
      email: parsed.email || null,
      displayName: parsed.displayName || null,
      avatarUrl: parsed.avatarUrl || null
    };
  } catch (e) {
    console.error(`Error reading local userdata for ${userId}:`, e);
    return { completedQuests: [], completedSteps: [], experiencePoints: 0, streak: 0, lastActiveDate: null };
  }
}

// Local File Write fallback helper
function writeLocalFile(userId, data) {
  const safeId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const userFilePath = path.join(process.cwd(), `userdata_${safeId}.json`);
  try {
    fs.writeFileSync(userFilePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error writing local userdata for ${userId}:`, e);
  }
}

// Get User Data (Dual Mode)
export async function getUserData(userId, email = null, displayName = null, avatarUrl = null) {
  if (!userId) userId = 'local_user';
  if (isPostgres && userId !== 'local_user') {
    try {
      // Ensure user exists or update their profile info
      const checkRes = await dbPool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (checkRes.rows.length === 0) {
        await dbPool.query(
          `INSERT INTO users (id, experience_points, streak, last_active_date, email, display_name, avatar_url)
           VALUES ($1, 0, 0, NULL, $2, $3, $4)`,
          [userId, email, displayName, avatarUrl]
        );
      } else if (email || displayName || avatarUrl) {
        await dbPool.query(
          `UPDATE users 
           SET email = COALESCE($2, email), 
               display_name = COALESCE($3, display_name), 
               avatar_url = COALESCE($4, avatar_url)
           WHERE id = $1`,
          [userId, email, displayName, avatarUrl]
        );
      }

      const userRes = await dbPool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const questsRes = await dbPool.query('SELECT quest_key FROM completed_quests WHERE user_id = $1', [userId]);
      const stepsRes = await dbPool.query('SELECT quest_key, step_index FROM completed_steps WHERE user_id = $1', [userId]);
      
      const user = userRes.rows[0];
      const completedQuests = questsRes.rows.map(r => r.quest_key);
      const completedSteps = stepsRes.rows.map(r => `${r.quest_key}:${r.step_index}`);

      return {
        completedQuests,
        completedSteps,
        experiencePoints: user ? user.experience_points : 0,
        streak: user ? user.streak : 0,
        lastActiveDate: user ? user.last_active_date : null,
        email: user ? user.email : null,
        displayName: user ? user.display_name : null,
        avatarUrl: user ? user.avatar_url : null,
        storageMode: 'PostgreSQL Cloud Database'
      };
    } catch (e) {
      console.error(`PostgreSQL error reading user data for ${userId}, falling back to local storage:`, e.message);
    }
  }
  
  // Local File mode
  const localData = readLocalFile(userId);
  let modified = false;
  if (email && localData.email !== email) { localData.email = email; modified = true; }
  if (displayName && localData.displayName !== displayName) { localData.displayName = displayName; modified = true; }
  if (avatarUrl && localData.avatarUrl !== avatarUrl) { localData.avatarUrl = avatarUrl; modified = true; }
  if (modified) {
    writeLocalFile(userId, localData);
  }

  return {
    ...localData,
    storageMode: 'Local File Storage (userdata.json)'
  };
}

// Save User Data (Dual Mode)
export async function saveUserData(userId, data) {
  if (!userId) userId = 'local_user';
  if (isPostgres && userId !== 'local_user') {
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // Update users table with profile fields
      await client.query(`
        UPDATE users 
        SET experience_points = $1, streak = $2, last_active_date = $3,
            email = COALESCE($5, email), display_name = COALESCE($6, display_name), avatar_url = COALESCE($7, avatar_url)
        WHERE id = $4
      `, [data.experiencePoints, data.streak, data.lastActiveDate, userId, data.email || null, data.displayName || null, data.avatarUrl || null]);

      // Sync completed quests
      for (const questKey of data.completedQuests) {
        await client.query(`
          INSERT INTO completed_quests (user_id, quest_key)
          VALUES ($1, $2)
          ON CONFLICT (user_id, quest_key) DO NOTHING
        `, [userId, questKey]);
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
            `, [userId, questKey, stepIndex]);
          }
        }
      }

      await client.query('COMMIT');
      return;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(`PostgreSQL error writing user data for ${userId}, saving locally as backup:`, e.message);
    } finally {
      client.release();
    }
  }

  // Local File mode
  writeLocalFile(userId, {
    completedQuests: data.completedQuests,
    completedSteps: data.completedSteps || [],
    experiencePoints: data.experiencePoints,
    streak: data.streak,
    lastActiveDate: data.lastActiveDate,
    email: data.email || null,
    displayName: data.displayName || null,
    avatarUrl: data.avatarUrl || null
  });
}

// Reset User Data (Dual Mode)
export async function resetUserData(userId) {
  if (!userId) userId = 'local_user';
  if (isPostgres && userId !== 'local_user') {
    try {
      await dbPool.query('DELETE FROM completed_quests WHERE user_id = $1', [userId]);
      await dbPool.query('DELETE FROM completed_steps WHERE user_id = $1', [userId]);
      await dbPool.query(`
        UPDATE users 
        SET experience_points = 0, streak = 0, last_active_date = NULL
        WHERE id = $1
      `, [userId]);
      return;
    } catch (e) {
      console.error(`PostgreSQL error resetting database data for ${userId}, resetting local storage:`, e.message);
    }
  }

  const defaultData = { 
    completedQuests: [], 
    completedSteps: [], 
    experiencePoints: 0, 
    streak: 0, 
    lastActiveDate: null,
    email: null,
    displayName: null,
    avatarUrl: null
  };
  writeLocalFile(userId, defaultData);
}

// Get storage type info helper
export function getStorageMode() {
  return isPostgres ? 'PostgreSQL Cloud Database' : 'Local File Storage (userdata.json)';
}
