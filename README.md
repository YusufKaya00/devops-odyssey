# 🌌 DevOps Odyssey: Gamified Simulation & Roadmap Dashboard

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**DevOps Odyssey** is a premium, gamified, and simulation-based interactive learning platform designed for software engineers, systems developers, and operations team members to master modern DevOps practices, system administration, containerization, orchestration, and continuous integration workflows.

Learners can solve curated hands-on scenarios in two distinct environments:
1. **In-Browser Terminal Simulator**: Practice command-line exercises in a sandbox with zero local setup requirements.
2. **Host Sandbox & Local Backend**: Execute actual commands (like `git`, `docker`, `kubectl`, or `terraform`) in a dedicated workspace directory on their host machine, with a local Express.js backend validating the results in real-time.

---

## 📖 Project Overview & Purpose

DevOps can be daunting due to the sheer number of tools, complex configurations, and abstract concepts. **DevOps Odyssey** bridges this gap by combining:
- **Guided Visual Roadmap**: Clear 12-stage curriculum following the actual evolutionary path of a DevOps engineer.
- **Hands-on Labs (Learning Labs)**: Step-by-step practical quests with mock or real command executions.
- **Immediate Validation Feedback**: Learn by doing, with instant validation of your configurations.
- **Gamified Rewards System**: Leverage experience points (XP), levels, learning streaks, and unlockable achievement badges to keep learners highly motivated.

---

## 🛠️ Key Features

### 1. 12 Comprehensive Curriculum Modules
A structured learning path covering the full spectrum of DevOps engineering:
- Git, CLI scripting, Networking, Web Servers, Docker, Kubernetes, IaC, CI/CD, Observability, Cloud Providers, and Software Engineering Best Practices.

### 2. Interactive Terminal Simulator
A custom command-line simulator built in React that accurately mocks file structures, git staging/commits/reflog, docker containers/images, kubernetes pods/services, and shell tools (`grep`, `curl`, `nslookup`, `cat`, `chmod`, `systemctl`, etc.).

### 3. Host Sandbox & Real Validators
Run the local Express backend to write configurations directly in the `devops-sandbox` folder. The backend runs validator scripts (e.g. verifying that a docker container is up with specified parameters or a git commit history has been rewritten) on your actual machine.

### 4. Quest Review & Step Navigation (New! 🚀)
Want to review a previously completed quest?
- ** Granular Step Navigation**: Switch back and forth using **`← Previous`** and **`Next →`** controls.
- **Checklist Jump**: Click directly on any step in the lab checklist to jump straight to its objectives.
- **Sim State Auto-Resets**: The terminal simulator automatically remounts and resets its filesystem and mock logs to the correct initial conditions for your selected step, allowing you to re-practice specific steps without affecting your overall profile progress or database stats.

### 5. Robust Cloud Sync & Offline Fallback
- **Zero-Config Fallback**: Automatically stores user data in local JSON files (`userdata_<userId>.json`) when database access is offline or unconfigured.
- **Automatic Database Syncing**: When a PostgreSQL cloud database (e.g. Supabase, Neon) is online, the system seamlessly pulls and syncs offline backups directly to the cloud tables on login.

---

## 👤 Google Authentication & Profile Progression

### Google Authentication Integration
Users can securely authenticate using **Google Identity Services (GIS)**. Upon successful login:
1. The client retrieves a Google ID token and sends it via standard Bearer headers.
2. The server verifies the token against Google's Tokeninfo API.
3. User profile details (Display Name, Email, Avatar URL) are updated and synchronized.

### Achievement Badges System
Users earn and unlock distinct achievements based on their learning milestones. Unlocking a badge displays a real-time toast notification.
- **DevOps Novice**: Complete your first DevOps quest validation.
- **Git Maestro**: Unlock all quests in the Git & Version Control module.
- **Script Commander**: Unlock all quests in the Linux & Scripting module.
- **Container Captain**: Unlock all Docker containerization quests.
- **Kubernetes Overlord**: Master Kubernetes orchestration quests.
- **Pipeline Architect**: Unlock all automation pipeline quests.
- **Streak Warrior**: Maintain a learning streak of 3 or more active days.
- **DevOps Grandmaster**: Unlock all 12 modules along the DevOps Odyssey roadmap.

### XP & Leveling System
Complete labs and steps to earn XP and level up your DevOps title:
- **Beginner Quest**: +100 XP
- **Intermediate Quest**: +200 XP
- **Advanced Quest**: +300 XP
- **Individual Sub-steps**: +10/15/20 XP per step.
- **Level Titles**:
  - **Level 1**: DevOps Novice (0 - 199 XP)
  - **Level 2**: Linux Apprentice (200 - 499 XP)
  - **Level 3**: Docker Operator (500 - 999 XP)
  - **Level 4**: Kubernetes Engineer (1000 - 1799 XP)
  - **Level 5**: Cloud Architect (1800+ XP)

---

## 🗄️ Persistence, Cloud Sync & Offline Fallback

### Dual Persistence Architecture
DevOps Odyssey operates a dual-mode storage engine to maximize accessibility:
- **Local File Storage**: Uses `userdata_local_user.json` (for guests) and `userdata_<googleSub>.json` (for authenticated users) in the root directory.
- **PostgreSQL Database**: Uses a PostgreSQL instance with automated table generation.

### Automatic Offline-to-Cloud Syncing
If a user completes labs in **Local Mode** (e.g., during database setup or offline periods), their progress is saved to a local JSON file. 
Once they configure a PostgreSQL database (like Supabase) and log in:
- The system reads their local JSON backup.
- It compares the progress (XP, completed quests, completed steps).
- It merges the higher progress and automatically upserts it into the cloud PostgreSQL tables, ensuring no progress is ever lost during server migrations.

### Merge Guest Progress
If you start learning as a guest (`local_user`) and decide to log in with your Google Account later, a **Merge Stats** banner is displayed in the **Profile Tab**. Clicking this calls the `/api/merge-progress` endpoint, merging all completed quests, steps, and highest XP values from your guest profile into your Google cloud account.

---

## 🔄 Quest Review & Step Navigation Mode

Review mode provides a powerful revision interface for completed labs:
- **Step Isolation**: Each step is fully isolated. Selecting a step resets the filesystem simulator state so that you can execute commands from a clean initial state matching the lab's instructions.
- **Checklist Click**: Jump directly to steps by clicking their checklist items.
- **Non-destructive**: Re-completing commands or navigating steps in review mode bypasses database storage operations and avoids adding duplicate XP or resetting active learning streaks.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Frontend React Dashboard] -->|API Requests with Google Token| B[Express.js Server]
    B -->|Local Verification / CMDs| C[devops-sandbox Workspace]
    B -->|Database Controller| D{DATABASE_URL Configured?}
    D -->|Yes| E[PostgreSQL Cloud Database]
    D -->|No| F[Local JSON Backups on Disk]
    E -.->|Auto-Merge Local Data| F
```

### 1. Frontend Layer (React + Vite + TS)
- Responsive dark-mode layout styled with semantic HSL variables.
- Roadmap nodes mapping the 12-stage curriculum.
- In-browser interactive console simulator mapping standard commands.

### 2. Backend Layer (Express + pg)
- **Token Verification**: Middleware verifying Google OAuth.
- **Validation Engine**: Script runners validating real directory changes (like `git status`, file edits, docker lists) in the `devops-sandbox` folder.
- **Port Conflict Resolution**: Pre-dev configurations automatically kill stale port connections on startup.

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Optional: [Docker](https://www.docker.com/), [Kubectl](https://kubernetes.io/docs/tasks/tools/), [Terraform](https://www.terraform.io/) (for host-level quests)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YusufKaya00/devops-odyssey.git
   cd devops-odyssey
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` to include your specific configurations:
   ```env
   # PostgreSQL Connection String (Supabase / Neon)
   # NOTE: If your Supabase instance is in a specific region, copy the exact connection string
   # from your dashboard. (Example: aws-1-eu-west-2.pooler.supabase.com:6543)
   DATABASE_URL=postgresql://postgres.your-project-id:your-password@aws-1-your-region.pooler.supabase.com:6543/postgres?sslmode=require

   # Google Client IDs for Authentication
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```
   *Note: If `DATABASE_URL` is omitted, the app will run in local file persistence mode.*

4. **SSL Configuration Bypass**:
   The postgres connection pool is configured to bypass local system CA checks (`rejectUnauthorized: false`) which are common with Supabase/Neon certificate chains. The server automatically strips `sslmode` from the connection string programmatically to ensure this parameter doesn't override safety flags.

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This command starts the **Vite Client** on `http://localhost:5173` and the **Express Backend** on `http://localhost:5001` concurrently.

### Port Cleanup Script
If port `5001` or `5173` is occupied from a previous run, the server will throw an `EADDRINUSE` crash. To clean up these processes manually:
```bash
node scripts/clean-ports.mjs
```
This script finds the processes running on ports `5001` and `5173` using `netstat` (Windows) or `lsof` (Unix) and terminates them immediately.

---

## 🗄️ Database Schema Configuration

If you want to configure your database manually, run the following SQL commands (also found in [supabase_schema.sql](file:///c:/Users/skyks/Desktop/devops/supabase_schema.sql)):

```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  experience_points INT DEFAULT 0,
  streak INT DEFAULT 0,
  last_active_date VARCHAR(10),
  email VARCHAR(100),
  display_name VARCHAR(100),
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS completed_quests (
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  quest_key VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, quest_key)
);

CREATE TABLE IF NOT EXISTS completed_steps (
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  quest_key VARCHAR(100) NOT NULL,
  step_index INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, quest_key, step_index)
);
```

---

## 📂 Project Directory Structure

```text
devops-odyssey/
├── devops-sandbox/      # Directory where host-level tasks are performed by the user
├── docs/                # Project plans, requirements, and reference logs
├── scripts/             # Scripts for cleaning ports, building, and data validation
├── server/              # Backend database configurations (database.js) and quest validators (validators.js)
├── src/                 # Frontend React codebase
│   ├── components/      # UI components (TerminalSimulator, etc.)
│   ├── data/            # Curriculum database and helpers (roadmapData.ts)
│   └── App.tsx          # Main dashboard container and state coordinator
├── server.js            # Express API gateway entry point
├── package.json         # NPM package definitions and scripts
└── README.md            # Documentation
```

---

## 🤝 Contributing

1. Fork the Repository.
2. Create a Feature Branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -am 'Add some amazing feature'`
4. Push to the Branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.
