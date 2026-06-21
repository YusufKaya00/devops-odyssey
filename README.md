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

## 📖 Table of Contents

- [Project Overview & Purpose](#-project-overview--purpose)
- [Key Features](#️-key-features)
- [System Architecture](#️-system-architecture)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [NPM Scripts Reference](#-npm-scripts-reference)
- [API Reference](#-api-reference)
- [Database Schema & Persistence](#️-database-schema--persistence)
- [Authentication](#-google-authentication--profile-progression)
- [Curriculum Modules](#-curriculum-modules)
- [Data Model & TypeScript Interfaces](#-data-model--typescript-interfaces)
- [Quest Validators Reference](#-quest-validators-reference)
- [Terminal Simulator](#-terminal-simulator)
- [Quest Review & Step Navigation](#-quest-review--step-navigation-mode)
- [Project Directory Structure](#-project-directory-structure)
- [Utility Scripts](#-utility-scripts)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

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

### 4. Quest Review & Step Navigation
Want to review a previously completed quest?
- **Granular Step Navigation**: Switch back and forth using **`← Previous`** and **`Next →`** controls.
- **Checklist Jump**: Click directly on any step in the lab checklist to jump straight to its objectives.
- **Sim State Auto-Resets**: The terminal simulator automatically remounts and resets its filesystem and mock logs to the correct initial conditions for your selected step, allowing you to re-practice specific steps without affecting your overall profile progress or database stats.

### 5. Robust Cloud Sync & Offline Fallback
- **Zero-Config Fallback**: Automatically stores user data in local JSON files (`userdata_<userId>.json`) when database access is offline or unconfigured.
- **Automatic Database Syncing**: When a PostgreSQL cloud database (e.g. Supabase, Neon) is online, the system seamlessly pulls and syncs offline backups directly to the cloud tables on login.
- **Guest-to-Account Merge**: Start as a guest, then merge all progress into your Google account later.

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

### 1. Frontend Layer (React + Vite + TypeScript)
- Responsive dark-mode layout styled with semantic HSL CSS variables.
- Roadmap nodes mapping the 12-stage curriculum.
- In-browser interactive console simulator mapping standard Unix/Windows commands.
- Tab-based UI: Roadmap → Module Details → Lab Environment → Profile.
- Google Identity Services (GIS) integration for authentication.

### 2. Backend Layer (Express.js + node-postgres)
- **Token Verification**: Global middleware verifying Google OAuth2 ID tokens via `oauth2.googleapis.com/tokeninfo`.
- **Validation Engine**: Script runners validating real directory changes (like `git status`, file edits, docker inspect, kubectl get) in the `devops-sandbox` folder.
- **Dual Persistence**: Automatic switching between PostgreSQL and local JSON file storage.
- **Port Conflict Resolution**: Pre-dev `clean-ports.mjs` script automatically kills stale port connections on startup.

### 3. Database Layer (PostgreSQL / Local JSON)
- Three tables: `users`, `completed_quests`, `completed_steps`.
- Auto-creates tables on startup via `ensureTables()`.
- Transparent offline-to-cloud syncing on user login.

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
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
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials (see [Environment Variables](#-environment-variables) below).

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This runs the **Vite Client** on `http://localhost:5173` and the **Express Backend** on `http://localhost:5001` concurrently.

> **Note:** If `DATABASE_URL` is omitted, the app will run in local file persistence mode — no database setup is needed for basic usage.

---

## 🔑 Environment Variables

All environment variables are defined in `.env` (copied from `.env.example`):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No | PostgreSQL connection string. Format: `postgresql://user:password@host:port/database?sslmode=require`. If omitted, local JSON file storage is used. |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth2 Client ID for frontend authentication. Obtain from [Google Cloud Console](https://console.cloud.google.com/). |
| `GOOGLE_CLIENT_ID` | No | Server-side Google Client ID for token audience verification. Usually the same as `VITE_GOOGLE_CLIENT_ID`. |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth2 Client Secret (not currently used by the token verification middleware, but reserved for future flows). |
| `PORT` | No | Express server port. Defaults to `5001`. |

### SSL Configuration Note
The PostgreSQL connection pool is configured to bypass local system CA checks (`ssl: { rejectUnauthorized: false }`) which are common with Supabase/Neon certificate chains. The server automatically strips the `sslmode` query parameter from the connection string programmatically to prevent it from overriding the Node.js SSL configuration.

---

## 📜 NPM Scripts Reference

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts Vite dev server + Express backend concurrently. Runs `predev` automatically. |
| `predev` | *(automatic)* | Runs `scripts/clean-ports.mjs` to kill stale processes on ports 5001 and 5173 before starting. |
| `build` | `npm run build` | Production build: runs TypeScript compiler (`tsc -b`) then Vite bundler (`vite build`). |
| `lint` | `npm run lint` | Runs ESLint across the entire project. |
| `validate:training` | `npm run validate:training` | Validates all training data modules for structural integrity (see [Utility Scripts](#-utility-scripts)). |
| `preview` | `npm run preview` | Previews the production build using Vite's preview server. |

---

## 📡 API Reference

The Express backend runs on `http://localhost:5001` by default. All endpoints accept and return JSON.

### Authentication
All endpoints use a global middleware (`authenticateGoogleToken`) that optionally reads a Google ID token from the `Authorization: Bearer <token>` header. If a valid token is present, `req.user` is populated with the user's Google profile. If no token is provided, the user is treated as a guest (`local_user`).

### Endpoints

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "serverTime": "2026-06-21T20:00:00.000Z"
}
```

---

#### `GET /api/status`
Fetches the current user's profile, progress, and level information.

**Headers (optional):**
- `Authorization: Bearer <google_id_token>`
- `X-User-Id: <custom_user_id>` (fallback if no Bearer token)

**Response:**
```json
{
  "completedQuests": ["git_init", "git_branch"],
  "completedSteps": ["git_init:0", "git_init:1", "git_branch:0"],
  "experiencePoints": 320,
  "streak": 3,
  "lastActiveDate": "2026-06-21",
  "email": "user@example.com",
  "displayName": "John Doe",
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "levelInfo": {
    "level": 2,
    "title": "Linux Apprentice",
    "nextLevelXp": 500
  },
  "hostOS": "win32",
  "storageMode": "PostgreSQL Cloud Database"
}
```

---

#### `POST /api/verify`
Verifies a quest or sub-step completion. For simulated quests, the verification is instant. For host-sandbox quests, the server runs the appropriate validator function.

**Request Body:**
```json
{
  "validatorKey": "git_init",
  "difficulty": "Beginner",
  "isSimulated": true,
  "stepIndex": 0
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `validatorKey` | `string` | Yes | The quest/validator identifier (e.g., `git_init`, `docker_run`). |
| `difficulty` | `string` | No | One of `"Beginner"`, `"Intermediate"`, `"Advanced"`. Determines XP awarded (100/200/300). |
| `isSimulated` | `boolean` | No | If `true`, skips host validation and marks as completed. |
| `stepIndex` | `number` | No | If provided, verifies a single sub-step instead of the entire quest. Awards 20 XP per step. |

**Response (Success):**
```json
{
  "success": true,
  "message": "Git repository initialized and first commit detected successfully!",
  "data": { "...same as /api/status response..." }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "devops-sandbox/.git folder was not found. Have you run 'git init'?"
}
```

---

#### `POST /api/merge-progress`
Merges guest (`local_user`) progress into the authenticated Google user's account. **Requires authentication.**

**Headers:**
- `Authorization: Bearer <google_id_token>` (required)

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Progress successfully merged from guest account!",
  "data": { "...merged user data with levelInfo..." }
}
```

---

#### `POST /api/reset`
Resets a user's progress (clears all completed quests, steps, XP, and streak).

**Headers (optional):**
- `Authorization: Bearer <google_id_token>`

**Response:**
```json
{
  "success": true,
  "message": "User progress reset successfully.",
  "data": { "...default empty data with levelInfo..." }
}
```

---

## 🗄️ Database Schema & Persistence

### PostgreSQL Schema

The database uses three tables, auto-created on startup. The SQL schema is also available in [`supabase_schema.sql`](supabase_schema.sql).

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

### Dual Persistence Architecture

DevOps Odyssey operates a dual-mode storage engine:

| Mode | Trigger | Storage Location |
|---|---|---|
| **PostgreSQL** | `DATABASE_URL` is set and connection succeeds | Cloud database (Supabase, Neon, etc.) |
| **Local File** | `DATABASE_URL` is unset or connection fails | `userdata_<userId>.json` files in project root |

### Automatic Offline-to-Cloud Syncing

When a user logs in with a PostgreSQL database configured:

1. The system checks for a local JSON backup file (`userdata_<userId>.json`).
2. If the local backup contains quests/steps not present in the database, it **merges** them into the cloud.
3. XP and streak values use `Math.max()` to keep the highest value.
4. This ensures **zero progress loss** during database migrations or offline periods.

### Guest-to-Account Merge

If you start as a guest (`local_user`) and later authenticate with Google:
1. A **Merge Stats** banner appears in the Profile tab.
2. Clicking it calls `POST /api/merge-progress`.
3. All completed quests, steps, and max XP/streak from both `local_user` DB records **and** the `userdata_local_user.json` file on disk are merged into your authenticated account.

---

## 👤 Google Authentication & Profile Progression

### Google Authentication Flow
1. Frontend uses Google Identity Services (GIS) to obtain an ID token.
2. Token is sent in every API request via `Authorization: Bearer <id_token>`.
3. Server middleware verifies the token against `https://oauth2.googleapis.com/tokeninfo`.
4. Audience (`aud`) is validated against both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`.
5. On success, `req.user` is populated with `{ id: sub, email, name, avatarUrl: picture }`.
6. On 401 (expired/invalid token), the frontend auto-logs out the user.

### Achievement Badges System
Users earn and unlock distinct achievements based on learning milestones. Unlocking a badge displays a real-time toast notification.

| Badge | Unlock Condition |
|---|---|
| **DevOps Novice** | Complete your first DevOps quest validation |
| **Git Maestro** | Unlock all quests in the Git & Version Control module |
| **Script Commander** | Unlock all quests in the Linux & Scripting module |
| **Container Captain** | Unlock all Docker containerization quests |
| **Kubernetes Overlord** | Master Kubernetes orchestration quests |
| **Pipeline Architect** | Unlock all automation pipeline quests |
| **Streak Warrior** | Maintain a learning streak of 3 or more active days |
| **DevOps Grandmaster** | Unlock all 12 modules along the DevOps Odyssey roadmap |

### XP & Leveling System

| Action | XP Awarded |
|---|---|
| Complete a Beginner quest | +100 XP |
| Complete an Intermediate quest | +200 XP |
| Complete an Advanced quest | +300 XP |
| Complete a sub-step | +20 XP |

| Level | Title | XP Range |
|---|---|---|
| 1 | DevOps Novice | 0 – 199 XP |
| 2 | Linux Apprentice | 200 – 499 XP |
| 3 | Docker Operator | 500 – 999 XP |
| 4 | Kubernetes Engineer | 1000 – 1799 XP |
| 5 | Cloud Architect | 1800+ XP |

### Streak System
- Completing a quest on a **consecutive day** increments the streak by 1.
- Skipping a day resets the streak to 1.
- First-ever activity sets the streak to 1.

---

## 📚 Curriculum Modules

The roadmap contains **12 progressive modules**, each with multiple quests:

| # | Module | Topics Covered |
|---|---|---|
| 1 | **Git & Version Control** | Snapshots, staging, branching, merging, conflicts, remotes, reflog, stash, tags, rebase, hooks, submodules, worktrees |
| 2 | **Programming Language** | Python automation scripts, health checks, HTTP clients |
| 3 | **Linux & Scripting** | Bash scripting, file permissions, backup automation, chmod, systemctl |
| 4 | **Networking & Security** | Port scanning, DNS lookups, nslookup, curl, network monitoring |
| 5 | **Server Management** | Nginx configuration, reverse proxies, web server setup |
| 6 | **Containers (Docker)** | Dockerfiles, docker run, docker build, docker-compose, multi-service stacks |
| 7 | **Container Orchestration (K8s)** | kubectl, pods, services, deployments, cluster management |
| 8 | **Infrastructure as Code** | Terraform init/plan/apply, state management, local providers |
| 9 | **CI/CD Pipelines** | GitHub Actions workflows, YAML triggers, jobs, automated testing |
| 10 | **Monitoring & Observability** | Prometheus configs, scrape targets, alerting, metrics |
| 11 | **Cloud Providers** | AWS CLI, Azure CLI, gcloud CLI detection and setup |
| 12 | **Software Engineering Practices** | Agile backlogs, sprint planning, JSON data structures |

Each module includes:
- **Resource Links** (free books, interactive tools, official documentation)
- **Quests** with simulated and host-sandbox variants
- **Optional Module Quiz** (multiple-choice knowledge tests)

---

## 🧬 Data Model & TypeScript Interfaces

The training data is defined using these core interfaces (see [`src/data/roadmapData.ts`](src/data/roadmapData.ts)):

### `InteractiveStep`
Defines a single sub-step within a quest's in-browser simulation.

```typescript
interface InteractiveStep {
  title: string;           // Step title displayed in the lab checklist
  explanation: string;     // Educational context shown before the command
  expectedCommand: string; // The exact command the user must type
  acceptedCommands?: string[]; // Alternative valid commands
  hint: string;            // Hint text shown on request
  mockOutput: string;      // Simulated terminal output after correct command
}
```

### `Quest`
Represents a single hands-on lab exercise.

```typescript
interface Quest {
  id: string;                         // Unique identifier, matches validatorKey
  title: string;                      // Display title
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  objective: string;                  // What the learner should accomplish
  stepsWindows: string[];             // Windows-specific instructions
  stepsLinux: string[];               // Linux/macOS-specific instructions
  verificationCommand: string;        // Human-readable verification description
  validatorKey: string;               // Maps to server/validators.js validator function
  hint?: string;                      // Optional hint
  interactiveSteps: InteractiveStep[]; // Sub-steps for the browser simulator
}
```

### `ModuleData`
Represents a curriculum module on the roadmap.

```typescript
interface ModuleData {
  id: number;                    // Module number (1-12)
  title: string;                 // Module title
  icon: string;                  // Icon identifier
  description: string;           // Short description
  detailedInfo: string;          // Extended description
  resources: ResourceLink[];     // Learning resource links
  quests: Quest[];               // Array of quests
  quiz?: ModuleQuizQuestion[];   // Optional module quiz
}
```

### `ResourceLink`
```typescript
interface ResourceLink {
  name: string;   // Display name
  url: string;    // URL
  free: boolean;  // Whether the resource is free
}
```

### `ModuleQuizQuestion`
```typescript
interface ModuleQuizQuestion {
  question: string;      // The question text
  options: string[];     // Multiple choice options
  answerIndex: number;   // Index of the correct answer
  explanation: string;   // Explanation shown after answering
}
```

### Extended Training Types (`src/data/training/types.ts`)
For the expanded training data system:

```typescript
type ScenarioTier = "Beginner" | "Intermediate" | "Advanced";

interface CommandExpectation {
  expectedCommand: string;
  acceptedCommands?: string[];
  hint: string;
  mockOutput: string;
}

interface ScenarioStep extends CommandExpectation {
  title: string;
  explanation: string;
}

interface ScenarioQuest {
  id: string;
  title: string;
  difficulty: ScenarioTier;
  objective: string;
  stepsWindows: string[];
  stepsLinux: string[];
  verificationCommand: string;
  validatorKey: string;
  hint?: string;
  interactiveSteps: ScenarioStep[];
}

interface ScenarioQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface ScenarioModule {
  id: number;
  title: string;
  quests: ScenarioQuest[];
  quiz: ScenarioQuizQuestion[];
}
```

---

## 🔍 Quest Validators Reference

Validators are defined in [`server/validators.js`](server/validators.js). Each validator is a function that checks the user's host machine for the expected state.

| Validator Key | Module | What It Checks |
|---|---|---|
| `git_init` | Git | `.git/` exists in sandbox + at least one commit in log |
| `git_branch` | Git | Branch `feature-devops` exists + `quest.txt` file created |
| `git_reflog` | Git | Branch `recovery-branch` exists (reflog recovery exercise) |
| `py_health` | Programming | `health_check.py` exists with `urllib`/`requests` + status check |
| `bash_backup` | Linux & Scripting | `backup_dest/` contains copies of `README.md` and `quest.txt` |
| `linux_permissions` | Linux & Scripting | `run_check.sh` is executable (Linux) or `run_check.ps1` exists (Windows) |
| `port_scan` | Networking | Always passes (verifies port 5001 is the running server) |
| `nginx_config` | Server Management | `nginx.conf` has `listen 80` + `proxy_pass http://localhost:3000` |
| `docker_run` | Docker | Container `devops-nginx-sandbox` is running on port 8085 |
| `docker_build` | Docker | `Dockerfile` exists + image `devops-mock-app:v1.0` is built |
| `docker_compose` | Docker | `docker-compose.yml` defines nginx+redis + both containers running |
| `k8s_status` | Kubernetes | `kubectl cluster-info` succeeds |
| `k8s_deploy` | Kubernetes | Pod `k8s-nginx-pod` exists and is in `Running` state |
| `k8s_service` | Kubernetes | Service `k8s-nginx-service` exists and exposes port 80 |
| `tf_local` | IaC | `.terraform/` dir, `terraform.tfstate`, and `tf_quest.txt` with correct content |
| `gh_workflow` | CI/CD | `.github/workflows/devops_check.yml` exists with `on:` and `jobs:` |
| `prometheus_mock` | Observability | `prometheus.yml` has `scrape_configs` with `localhost:9100` target |
| `cloud_cli` | Cloud Providers | At least one of `aws`, `az`, or `gcloud` CLI detected in PATH |
| `agile_backlog` | SE Practices | `backlog.json` is valid JSON array with ≥2 items, each having `id`, `title`, `status` |

---

## 🖥️ Terminal Simulator

The terminal simulator ([`src/components/TerminalSimulator.tsx`](src/components/TerminalSimulator.tsx)) is a React component that provides a fully interactive command-line experience in the browser.

### Supported Mock Commands
The simulator handles these commands with simulated outputs:

| Category | Commands |
|---|---|
| **File System** | `ls`, `cat`, `touch`, `mkdir`, `echo`, `cp`, `mv`, `rm`, `pwd`, `cd`, `find`, `tree` |
| **Git** | `git init`, `git add`, `git commit`, `git log`, `git status`, `git branch`, `git checkout`, `git merge`, `git diff`, `git stash`, `git tag`, `git rebase`, `git reflog`, `git remote`, `git push`, `git pull` |
| **Docker** | `docker run`, `docker ps`, `docker images`, `docker build`, `docker inspect`, `docker-compose up/down/ps` |
| **Kubernetes** | `kubectl run`, `kubectl get`, `kubectl apply`, `kubectl expose`, `kubectl describe`, `kubectl cluster-info` |
| **Networking** | `curl`, `nslookup`, `ping`, `traceroute`, `netstat`, `ss` |
| **System** | `chmod`, `chown`, `systemctl`, `grep`, `awk`, `sed`, `wc`, `head`, `tail`, `sort`, `uniq` |
| **Infrastructure** | `terraform init/plan/apply`, `ansible-playbook` |
| **Utilities** | `clear`, `help`, `man`, `which`, `whoami`, `uname`, `date`, `history` |

### How It Works
1. Each quest's `interactiveSteps` array defines the expected commands and mock outputs.
2. When the user types the expected command (or an accepted alternative), the simulator:
   - Displays the `mockOutput`
   - Updates internal virtual filesystem state
   - Marks the step as complete and advances
3. The simulator maintains a virtual filesystem that is reset when switching between steps in review mode.

---

## 🔄 Quest Review & Step Navigation Mode

Review mode provides a powerful revision interface for completed labs:
- **Step Isolation**: Each step is fully isolated. Selecting a step resets the filesystem simulator state so that you can execute commands from a clean initial state matching the lab's instructions.
- **Checklist Click**: Jump directly to steps by clicking their checklist items.
- **Previous/Next Controls**: Navigate forward and backward through steps within a completed quest.
- **Non-destructive**: Re-completing commands or navigating steps in review mode bypasses database storage operations and avoids adding duplicate XP or resetting active learning streaks.

---

## 📂 Project Directory Structure

```text
devops-odyssey/
├── devops-sandbox/              # Directory where host-level tasks are performed by the user
├── docs/                        # Project plans, requirements, and reference logs
│   └── superpowers/plans/       # Historical architecture/planning documents
├── scripts/                     # Utility scripts (port cleanup, build, data validation)
│   ├── build.mjs                # Cross-platform production build (tsc + vite)
│   ├── clean-ports.mjs          # Kills stale processes on ports 5001 & 5173
│   └── validate-training-data.mjs  # Validates training module data integrity
├── server/                      # Backend modules
│   ├── database.js              # Dual-mode persistence (PostgreSQL + Local JSON)
│   └── validators.js            # Host-sandbox quest validator functions
├── src/                         # Frontend React + TypeScript codebase
│   ├── components/
│   │   └── TerminalSimulator.tsx # In-browser interactive terminal component
│   ├── data/
│   │   ├── roadmapData.ts       # Core curriculum modules & quest definitions
│   │   ├── gitTraining.ts       # Deep-dive Git training quests & quiz
│   │   ├── additionalTraining.ts # Module expansion helper
│   │   └── training/            # Extended training data (12 module files)
│   │       ├── types.ts         # TypeScript interfaces for training data
│   │       ├── helpers.ts       # Factory functions (createQuest, createConceptQuiz)
│   │       ├── index.ts         # Barrel export for all training modules
│   │       ├── git.ts           # Git training data
│   │       ├── programming.ts   # Programming language training
│   │       ├── linux.ts         # Linux & scripting training
│   │       ├── networking.ts    # Networking & security training
│   │       ├── serverManagement.ts  # Server management training
│   │       ├── containers.ts    # Docker containers training
│   │       ├── kubernetes.ts    # Kubernetes orchestration training
│   │       ├── iac.ts           # Infrastructure as Code training
│   │       ├── cicd.ts          # CI/CD pipelines training
│   │       ├── observability.ts # Monitoring & observability training
│   │       ├── cloud.ts         # Cloud providers training
│   │       └── softwarePractices.ts  # Software engineering practices
│   └── App.tsx                  # Main dashboard container and state coordinator
├── server.js                    # Express API gateway entry point
├── package.json                 # NPM package definitions and scripts
├── supabase_schema.sql          # PostgreSQL schema for manual database setup
├── .env.example                 # Environment variable template
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This documentation
```

---

## 🧰 Utility Scripts

### `scripts/clean-ports.mjs`
Kills any processes running on ports **5001** (Express) and **5173** (Vite) before starting the development server. Works cross-platform:
- **Windows**: Uses `netstat -ano` to find PIDs and `taskkill /PID` to terminate.
- **Unix/macOS**: Uses `lsof -i :PORT` to find and `kill -9` to terminate.

This script runs automatically via the `predev` NPM hook.

### `scripts/build.mjs`
Cross-platform production build that runs:
1. `npx tsc -b` — TypeScript type checking
2. `npx vite build` — Vite production bundling

### `scripts/validate-training-data.mjs`
Validates the structural integrity of all 12 training data modules. Checks:
- All required training data files exist (`src/data/training/*.ts`)
- Required TypeScript types are exported (`ScenarioTier`, `ScenarioQuest`, `ScenarioModule`, `ScenarioStep`, `ScenarioQuizQuestion`, `CommandExpectation`)
- Helper functions (`createQuest`, `createConceptQuiz`) are exported
- Each module file exports an array with the correct module structure

Run manually:
```bash
npm run validate:training
```

---

## 🐛 Troubleshooting

### `EADDRINUSE` — Port already in use
If port 5001 or 5173 is occupied from a previous run:
```bash
node scripts/clean-ports.mjs
```

### `self-signed certificate in certificate chain`
This occurs when the PostgreSQL `sslmode=require` parameter in the connection string conflicts with Node.js SSL handling. The server automatically strips this parameter. If the error persists:
1. Ensure your `DATABASE_URL` in `.env` uses the correct format.
2. The server's `database.js` programmatically removes `sslmode` from the URL and sets `ssl: { rejectUnauthorized: false }`.

### `Tenant or user not found`
This Supabase error means the connection pooler URL is incorrect:
1. Go to your Supabase Dashboard → Project Settings → Database → Connection string → URI.
2. Copy the exact connection string and paste into `.env`.
3. Make sure the region in the URL matches your project (e.g., `aws-0-eu-west-2`).

### Database connection fails silently
The app gracefully falls back to local JSON file storage. Check the server console for:
- `Database Engine: PostgreSQL configured.` (success)
- `Database Engine: Local file storage configured.` (no `DATABASE_URL`)
- `Error connecting to database or creating tables:` (connection failed, fell back to local)

### Google Authentication not working
1. Ensure `VITE_GOOGLE_CLIENT_ID` is set in `.env`.
2. The Google Client ID must have `http://localhost:5173` as an authorized JavaScript origin.
3. Check browser console for GIS initialization errors.

---

## 🤝 Contributing

1. Fork the Repository.
2. Create a Feature Branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -am 'Add some amazing feature'`
4. Push to the Branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

### Adding a New Quest
1. Define the quest in the appropriate module file under `src/data/training/` or `src/data/roadmapData.ts`.
2. Add `interactiveSteps` with `expectedCommand`, `acceptedCommands`, `hint`, and `mockOutput`.
3. If the quest requires host-sandbox validation, add a validator function in `server/validators.js`.
4. Run `npm run validate:training` to verify data integrity.

### Adding a New Module
1. Create a new training file in `src/data/training/` (e.g., `newModule.ts`).
2. Export the module data following the `ScenarioModule` interface.
3. Register the module in `src/data/training/index.ts`.
4. Add the module to `src/data/additionalTraining.ts` or `src/data/roadmapData.ts`.
5. Add any needed validators to `server/validators.js`.
6. Update `scripts/validate-training-data.mjs` to include the new file.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
