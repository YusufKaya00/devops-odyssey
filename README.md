# 🌌 DevOps Odyssey: Gamified Simulation & Roadmap Dashboard

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**DevOps Odyssey** is a gamified, simulation-based interactive learning platform designed for developers and system administrators to master modern DevOps practices, tools, and workflows.

Learners can solve real-world scenarios directly via the browser-based interactive terminal simulator or spin up the local Express.js backend to execute and validate actual commands on their host machines.

---

## 🌟 Key Features

- **12 Comprehensive Curriculum Modules**: A structured learning path spanning from basic Git operations to Cloud Providers, CI/CD pipelines, and Kubernetes orchestration.
- **Gamification Engine**: Earn XP (Experience Points) by completing quests, level up from "DevOps Novice" to "Cloud Architect", and track your progression.
- **Daily Streak System**: Build and maintain your learning habits with daily active streak tracking.
- **Dual-Mode Persistence**:
  - **Local Mode**: Zero configuration needed. Stores user progress locally in a `userdata.json` file.
  - **Cloud/Database Mode**: Integrates with PostgreSQL (such as Supabase or Neon) to keep progress synchronized in the cloud.
- **In-Browser Terminal Simulator**: Offers an interactive command-line experience inside the browser with no setup required.
- **Host Sandbox & Real Validators**: Allows running actual commands (like `git`, `docker`, and `kubectl`) in the `devops-sandbox` folder, with automated system validators testing the results on the host machine.
- **Module Checkpoint Quizzes**: Test your conceptual knowledge at the end of each module with 8-12 curated questions.

---

## 🏗️ System Architecture

The application is structured into two main layers:

1. **Frontend (React + Vite + TypeScript)**:
   - Modern, high-fidelity UI styling based on a customized dark-mode HSL color system.
   - Interactive roadmap graph, detailed lab panels, and gamified progress dashboard.
   - Client-side command processor (`TerminalSimulator.tsx`) that normalizes inputs and updates simulation state.
2. **Backend (Express.js)**:
   - Local validation API (`/api/verify`) that executes target scripts against the local workspace.
   - Dual-mode database controller (`server/database.js`) supporting PostgreSQL or fallback local JSON files.
   - Automatic setup of a `devops-sandbox` directory where all local quest activities occur safely.

---

## 📚 12-Module Curriculum

The learning path consists of the following modules:

1. **Git & Version Control**: Repositories, snapshots, selective staging, branching, conflict resolution, stashing, reflog recovery, tags, and hooks.
2. **Programming Language for DevOps**: Python CLI scripting, exit codes, log parsing, JSON/YAML validation, and HTTP health checkers with retry logic.
3. **Linux & Scripting**: Filesystem navigation, octal file permissions (`chmod`), process triage (`ps`/`kill`), text manipulation pipelines (`grep`/`awk`/`sed`), Cron jobs, and Systemd services.
4. **Networking & Security**: OSI model diagnostics, DNS lookups (`dig`), HTTP header analysis (`curl`), TLS certificate inspection, port scanning, firewalls, and CIDR subnets.
5. **Server Management**: Nginx static hosting, reverse proxy configurations, upstream load balancing, rate limiting, and SSL certificate renewals.
6. **Containers (Docker)**: Writing Dockerfiles, image building, environment configurations, volume persistence, custom bridge networks, and multi-service Docker Compose stacks.
7. **Container Orchestration (Kubernetes)**: Cluster communication (`kubectl`), Pods, Deployments, Services (ClusterIP, NodePort, LoadBalancer), ConfigMaps, Secrets, Helm releases, and debugging (CrashLoopBackOff).
8. **Infrastructure as Code (IaC)**: Terraform lifecycle, state files, drift detection, provider configurations, modules, and Ansible playbooks.
9. **CI/CD Pipelines**: Automated test gates, build stages, artifact uploads, caching, matrix builds, GitHub Actions workflows, and automated rollbacks.
10. **Monitoring & Observability**: Prometheus scraping configurations, PromQL queries, alerting rules, Grafana dashboard designs, SLOs/SLIs, and runbook integration.
11. **Cloud Providers**: AWS/Azure/GCP CLI tools, IAM least-privilege policy design, VPC subnet planning, object storage lifecycles, and cost-budget alerts.
12. **Software Engineering Practices**: SDLC models, Agile backlog prioritization (`backlog.json`), release checklists, incident postmortems, and DORA metrics.

---

## 🚀 Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Optional: [Docker](https://www.docker.com/) and [Kubectl](https://kubernetes.io/docs/tasks/tools/) (required to validate real host-level quests)

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

3. **Configure Environment Variables (Optional)**:
   If you want to sync your progress to a remote PostgreSQL database, copy `.env.example` to `.env` and fill in the database URL:
   ```bash
   cp .env.example .env
   ```
   *Note: If `.env` is omitted or `DATABASE_URL` is empty, progress will automatically fall back to local file storage (`userdata.json`).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This script runs both the **Vite frontend server** (`http://localhost:5173`) and the **Express backend server** (`http://localhost:5001`) concurrently.

---

## 🛠️ Available Scripts (NPM Scripts)

The following scripts are defined in `package.json`:

- **`npm run dev`**: Starts both the frontend dev server and the backend API server. (It automatically resolves port conflicts before starting).
- **`npm run build`**: Compiles TypeScript files and builds the production-ready client bundle to the `dist/` directory.
- **`npm run lint`**: Runs ESLint to check for code standard conformance.
- **`npm run validate:training`**: Validates the schema and completeness of training modules in `src/data/training/`.
- **`npm run preview`**: Starts a local preview of the production-built site.

---

## 🗄️ Database Schema Configuration (Supabase / Postgres)

When a PostgreSQL instance is configured, tables are automatically initialized on startup. Alternatively, you can run the SQL definitions located in [supabase_schema.sql](file:///c:/Users/skyks/Desktop/devops/supabase_schema.sql):

- **`users`**: Stores XP points, streak count, and last active timestamp.
- **`completed_quests`**: Records completed quest IDs.
- **`completed_steps`**: Tracks granular step-by-step progress within each quest.

---

## 📂 Project Directory Structure

```text
devops-odyssey/
├── devops-sandbox/      # Directory where host-level tasks are performed by the user
├── docs/                # Project plans, requirements, and reference logs
├── scripts/             # Scripts for cleaning ports, building, and data validation
├── server/              # Backend database configurations and quest validators (validators.js)
├── src/                 # Frontend React codebase
│   ├── components/      # UI components (TerminalSimulator, etc.)
│   ├── data/            # Curriculum database and helpers (training/)
│   └── App.tsx          # Main dashboard container and state coordinator
├── server.js            # Express API gateway entry point
└── package.json         # NPM package definitions and scripts
```

---

## 🤝 Contributing

1. Fork the Repository.
2. Create a Feature Branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -am 'Add some amazing feature'`
4. Push to the Branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.
