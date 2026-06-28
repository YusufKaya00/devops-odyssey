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

    // Step notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS step_notes (
        user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        quest_key VARCHAR(100) NOT NULL,
        step_index INT NOT NULL,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
          avatarUrl: null,
          stepNotes: {}
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
      avatarUrl: parsed.avatarUrl || null,
      stepNotes: parsed.stepNotes || {}
    };
  } catch (e) {
    console.error(`Error reading local userdata for ${userId}:`, e);
    return { completedQuests: [], completedSteps: [], experiencePoints: 0, streak: 0, lastActiveDate: null, stepNotes: {} };
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
      const userExists = checkRes.rows.length > 0;

      // Load local backup file if it exists
      const safeId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const userFilePath = path.join(process.cwd(), `userdata_${safeId}.json`);
      let localData = null;
      if (fs.existsSync(userFilePath)) {
        try {
          const fileContent = fs.readFileSync(userFilePath, 'utf8');
          localData = JSON.parse(fileContent);
        } catch (err) {
          console.error('Error reading local backup during database sync:', err);
        }
      }

      if (!userExists) {
        // User is new to the database, initialize with local backup data if available
        const initXp = localData ? (localData.experiencePoints || 0) : 0;
        const initStreak = localData ? (localData.streak || 0) : 0;
        const initActiveDate = localData ? (localData.lastActiveDate || null) : null;

        await dbPool.query(
          `INSERT INTO users (id, experience_points, streak, last_active_date, email, display_name, avatar_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, initXp, initStreak, initActiveDate, email, displayName, avatarUrl]
        );

        if (localData) {
          if (localData.completedQuests) {
            for (const questKey of localData.completedQuests) {
              await dbPool.query(
                `INSERT INTO completed_quests (user_id, quest_key)
                 VALUES ($1, $2) ON CONFLICT (user_id, quest_key) DO NOTHING`,
                [userId, questKey]
              );
            }
          }
          if (localData.completedSteps) {
            for (const stepStr of localData.completedSteps) {
              const [questKey, stepIdxStr] = stepStr.split(':');
              const stepIndex = parseInt(stepIdxStr, 10);
              if (questKey && !isNaN(stepIndex)) {
                await dbPool.query(
                  `INSERT INTO completed_steps (user_id, quest_key, step_index)
                   VALUES ($1, $2, $3) ON CONFLICT (user_id, quest_key, step_index) DO NOTHING`,
                  [userId, questKey, stepIndex]
                );
              }
            }
          }
          if (localData.stepNotes) {
            for (const [key, noteText] of Object.entries(localData.stepNotes)) {
              const [questKey, stepIdxStr] = key.split(':');
              const stepIndex = parseInt(stepIdxStr, 10);
              if (questKey && !isNaN(stepIndex)) {
                await dbPool.query(
                  `INSERT INTO step_notes (user_id, quest_key, step_index, notes)
                   VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, quest_key, step_index) DO UPDATE SET notes = EXCLUDED.notes`,
                  [userId, questKey, stepIndex, noteText]
                );
              }
            }
          }
          console.log(`Synced local backup userdata_${safeId}.json to PostgreSQL database for new user.`);
        }
      } else {
        // User exists in database. Update profile metadata
        if (email || displayName || avatarUrl) {
          await dbPool.query(
            `UPDATE users 
             SET email = COALESCE($2, email), 
                 display_name = COALESCE($3, display_name), 
                 avatar_url = COALESCE($4, avatar_url)
             WHERE id = $1`,
            [userId, email, displayName, avatarUrl]
          );
        }

        // Check if local backup has more progress than the database, and if so, merge it!
        const dbQuestsRes = await dbPool.query('SELECT quest_key FROM completed_quests WHERE user_id = $1', [userId]);
        const dbQuests = dbQuestsRes.rows.map(r => r.quest_key);

        if (localData && localData.completedQuests && localData.completedQuests.some(q => !dbQuests.includes(q))) {
          console.log(`Local backup has quests not in database. Merging local backup to database for user ${userId}.`);
          
          const dbUserRes = await dbPool.query('SELECT experience_points, streak, last_active_date FROM users WHERE id = $1', [userId]);
          const dbUser = dbUserRes.rows[0];
          const mergedXp = Math.max(dbUser.experience_points || 0, localData.experiencePoints || 0);
          const mergedStreak = Math.max(dbUser.streak || 0, localData.streak || 0);
          const mergedActiveDate = dbUser.last_active_date || localData.lastActiveDate;

          await dbPool.query(
            `UPDATE users SET experience_points = $2, streak = $3, last_active_date = $4 WHERE id = $1`,
            [userId, mergedXp, mergedStreak, mergedActiveDate]
          );

          for (const questKey of localData.completedQuests) {
            await dbPool.query(
              `INSERT INTO completed_quests (user_id, quest_key)
               VALUES ($1, $2) ON CONFLICT (user_id, quest_key) DO NOTHING`,
              [userId, questKey]
            );
          }

          if (localData.completedSteps) {
            for (const stepStr of localData.completedSteps) {
              const [questKey, stepIdxStr] = stepStr.split(':');
              const stepIndex = parseInt(stepIdxStr, 10);
              if (questKey && !isNaN(stepIndex)) {
                await dbPool.query(
                  `INSERT INTO completed_steps (user_id, quest_key, step_index)
                   VALUES ($1, $2, $3) ON CONFLICT (user_id, quest_key, step_index) DO NOTHING`,
                  [userId, questKey, stepIndex]
                );
              }
            }
          }
          if (localData.stepNotes) {
            for (const [key, noteText] of Object.entries(localData.stepNotes)) {
              const [questKey, stepIdxStr] = key.split(':');
              const stepIndex = parseInt(stepIdxStr, 10);
              if (questKey && !isNaN(stepIndex)) {
                await dbPool.query(
                  `INSERT INTO step_notes (user_id, quest_key, step_index, notes)
                   VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, quest_key, step_index) DO UPDATE SET notes = EXCLUDED.notes`,
                  [userId, questKey, stepIndex, noteText]
                );
              }
            }
          }
        }
      }

      const userRes = await dbPool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const questsRes = await dbPool.query('SELECT quest_key FROM completed_quests WHERE user_id = $1', [userId]);
      const stepsRes = await dbPool.query('SELECT quest_key, step_index FROM completed_steps WHERE user_id = $1', [userId]);
      const notesRes = await dbPool.query('SELECT quest_key, step_index, notes FROM step_notes WHERE user_id = $1', [userId]);
      
      const user = userRes.rows[0];
      const completedQuests = questsRes.rows.map(r => r.quest_key);
      const completedSteps = stepsRes.rows.map(r => `${r.quest_key}:${r.step_index}`);
      const stepNotes = {};
      notesRes.rows.forEach(r => {
        stepNotes[`${r.quest_key}:${r.step_index}`] = r.notes;
      });
 
      return {
        completedQuests,
        completedSteps,
        experiencePoints: user ? user.experience_points : 0,
        streak: user ? user.streak : 0,
        lastActiveDate: user ? user.last_active_date : null,
        email: user ? user.email : null,
        displayName: user ? user.display_name : null,
        avatarUrl: user ? user.avatar_url : null,
        stepNotes,
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

      // Sync step notes
      if (data.stepNotes) {
        for (const [key, noteText] of Object.entries(data.stepNotes)) {
          const [questKey, stepIdxStr] = key.split(':');
          const stepIndex = parseInt(stepIdxStr, 10);
          if (questKey && !isNaN(stepIndex)) {
            await client.query(`
              INSERT INTO step_notes (user_id, quest_key, step_index, notes)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (user_id, quest_key, step_index) 
              DO UPDATE SET notes = EXCLUDED.notes
            `, [userId, questKey, stepIndex, noteText]);
          }
        }
      }
 
      await client.query('COMMIT');
 
      // Always write local backup even when PostgreSQL succeeds,
      // so offline fallback has up-to-date data if DB goes down later
      writeLocalFile(userId, {
        completedQuests: data.completedQuests,
        completedSteps: data.completedSteps || [],
        experiencePoints: data.experiencePoints,
        streak: data.streak,
        lastActiveDate: data.lastActiveDate,
        email: data.email || null,
        displayName: data.displayName || null,
        avatarUrl: data.avatarUrl || null,
        stepNotes: data.stepNotes || {}
      });
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
    avatarUrl: data.avatarUrl || null,
    stepNotes: data.stepNotes || {}
  });
}

// Reset User Data (Dual Mode)
export async function resetUserData(userId) {
  if (!userId) userId = 'local_user';
  if (isPostgres && userId !== 'local_user') {
    try {
      await dbPool.query('DELETE FROM completed_quests WHERE user_id = $1', [userId]);
      await dbPool.query('DELETE FROM completed_steps WHERE user_id = $1', [userId]);
      await dbPool.query('DELETE FROM step_notes WHERE user_id = $1', [userId]);
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
    avatarUrl: null,
    stepNotes: {}
  };
  writeLocalFile(userId, defaultData);
}

// Get storage type info helper
export function getStorageMode() {
  return isPostgres ? 'PostgreSQL Cloud Database' : 'Local File Storage (userdata.json)';
}
