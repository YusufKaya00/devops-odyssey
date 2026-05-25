-- PostgreSQL Database Schema for DevOps Odyssey Progress Syncing (Supabase / Neon / Postgres)

-- 1. Create users table to store general stats
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  experience_points INT DEFAULT 0,
  streak INT DEFAULT 0,
  last_active_date VARCHAR(10)
);

-- 2. Create completed_quests table to track progress of each quest
CREATE TABLE IF NOT EXISTS completed_quests (
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  quest_key VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, quest_key)
);

-- 3. Insert default local user (needed for the local dashboard engine to authenticate and store data)
INSERT INTO users (id, experience_points, streak, last_active_date)
VALUES ('local_user', 0, 0, NULL)
ON CONFLICT (id) DO NOTHING;
