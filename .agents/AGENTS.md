# AGENTS.md — Agent Guidelines for DevOps Odyssey

This document provides instructions and context for AI coding agents working on this codebase.

## Project Overview

DevOps Odyssey is a gamified DevOps learning platform with:
- A **React + TypeScript + Vite** frontend (port 5173)
- An **Express.js** backend API (port 5001)
- **PostgreSQL** (Supabase) cloud storage with local JSON file fallback
- **Google OAuth2** authentication via ID token verification

## Architecture Quick Reference

```
Frontend (React/Vite)  →  Express API (server.js)  →  PostgreSQL / Local JSON
                                ↓
                        server/validators.js  →  devops-sandbox/ (host filesystem)
```

### Key Files

| File | Purpose |
|---|---|
| `server.js` | Express API entry point. All REST endpoints defined here. |
| `server/database.js` | Dual-mode persistence layer (PostgreSQL + JSON files). Exports: `initDatabase`, `getUserData`, `saveUserData`, `resetUserData`, `getStorageMode`. |
| `server/validators.js` | Host-sandbox quest validators. Each validator checks the `devops-sandbox/` directory for expected state. Exports a `validators` object keyed by `validatorKey`. |
| `src/App.tsx` | Main React component. Contains all dashboard state, tab management, quest flow, profile, and review mode logic. |
| `src/components/TerminalSimulator.tsx` | In-browser terminal simulator component. Handles command parsing, virtual filesystem, and mock outputs. |
| `src/data/roadmapData.ts` | Core curriculum data model. Defines `InteractiveStep`, `Quest`, `ModuleData`, `ResourceLink`, `ModuleQuizQuestion` interfaces and the base 12 modules. |
| `src/data/gitTraining.ts` | Deep-dive Git training quests and quiz data. |
| `src/data/additionalTraining.ts` | Helper to expand base roadmap modules with additional training data. |
| `src/data/training/` | Directory of 12 training data modules + types + helpers. |

### Data Flow

1. User progress is tracked via `completedQuests` (string[]) and `completedSteps` (string[] in `"questKey:stepIndex"` format).
2. `getUserData()` in `database.js` handles all dual-mode read logic, including automatic offline→cloud sync.
3. `saveUserData()` uses PostgreSQL transactions with `BEGIN`/`COMMIT`/`ROLLBACK`.
4. Frontend calls `/api/verify` with `{ validatorKey, difficulty, isSimulated, stepIndex }`.
5. For simulated quests (`isSimulated: true`), no host validation occurs.
6. For host quests, the matching `validators[validatorKey]()` function runs in `devops-sandbox/`.

## Development Commands

```bash
npm run dev              # Start Vite + Express concurrently
npm run build            # Production build (tsc + vite)
npm run lint             # ESLint
npm run validate:training # Validate training data modules
```

## Coding Conventions

- **Module system**: ES Modules (`"type": "module"` in package.json). Use `import`/`export`, not `require`.
- **Frontend**: React 19 functional components with hooks. No class components.
- **Styling**: Vanilla CSS with HSL CSS custom properties for theming. No CSS frameworks.
- **TypeScript**: Strict mode. All interfaces defined in `roadmapData.ts` or `training/types.ts`.
- **Backend**: Express.js with `pg` (node-postgres) driver. Raw SQL queries, no ORM.
- **Error handling**: Backend gracefully degrades from PostgreSQL to local JSON on any DB error.
- **File naming**: React components in PascalCase (`.tsx`), data files in camelCase (`.ts`), server files in camelCase (`.js`).
- **Comments**: Preserve all existing comments unless directly editing the commented code.
- **Language**: All code, comments, variable names, and user-facing strings are in **English**.

## Environment Variables

Required in `.env` (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string (optional; falls back to local JSON)
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth2 client ID for frontend
- `GOOGLE_CLIENT_ID` — Google OAuth2 client ID for server-side token verification

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| GET | `/api/status` | Optional | Get user profile & progress |
| POST | `/api/verify` | Optional | Verify quest/step completion |
| POST | `/api/merge-progress` | Required | Merge guest progress into authenticated account |
| POST | `/api/reset` | Optional | Reset user progress |

## Database

- Tables: `users`, `completed_quests`, `completed_steps`
- Auto-created on startup via `ensureTables()` in `database.js`
- Schema in `supabase_schema.sql`
- SSL: `sslmode` is stripped from `DATABASE_URL` programmatically; `rejectUnauthorized: false` is set.

## Adding New Content

### New Quest
1. Add quest data to the appropriate module in `src/data/training/` or `src/data/roadmapData.ts`
2. Must follow the `Quest` or `ScenarioQuest` interface
3. If host-validated, add a validator function in `server/validators.js`
4. Run `npm run validate:training`

### New Validator
1. Add to the `validators` export object in `server/validators.js`
2. Validators are async functions returning `{ success: boolean, message: string }`
3. Use `runCmd(cmd)` for commands in project root, `runCmdSandbox(cmd)` for commands in `devops-sandbox/`
4. The validator key must match the quest's `validatorKey` field

### New Module
1. Create `src/data/training/<moduleName>.ts`
2. Export module data following `ScenarioModule` interface
3. Register in `src/data/training/index.ts`
4. Update `src/data/additionalTraining.ts` or `src/data/roadmapData.ts`
5. Update `scripts/validate-training-data.mjs` required files list

## Testing

- No automated test framework is set up yet.
- Validate data integrity: `npm run validate:training`
- Manual testing: `npm run dev` and interact with the UI.
- Verify API: `curl http://localhost:5001/api/health`

## Common Pitfalls

1. **Port conflicts**: If dev server crashes on startup with `EADDRINUSE`, run `node scripts/clean-ports.mjs`.
2. **SSL errors**: The `DATABASE_URL` must have `sslmode=require` but the server strips it automatically. Don't remove it from `.env`.
3. **Local user ID**: Guest users use the fixed ID `local_user`. This is hardcoded in `database.js`.
4. **Step key format**: Completed steps are stored as `"questKey:stepIndex"` strings (e.g., `"git_init:0"`).
5. **Review mode**: When a user navigates completed quests, the frontend sets a `reviewMode` flag that prevents XP/progress writes.
