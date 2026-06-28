# DevOps Odyssey Project Overview

## Purpose

DevOps Odyssey is a React, TypeScript, Vite, and Express learning platform for DevOps practice. It combines a 12-module roadmap, browser-based command simulations, optional host-machine validation, XP, levels, streaks, badges, Google sign-in, and local/PostgreSQL progress persistence.

## Runtime Shape

- Frontend: `src/App.tsx` renders the dashboard, roadmap modules, focused lab view, profile, achievements, resource hub, and Google sign-in entry points.
- Simulator: `src/components/TerminalSimulator.tsx` runs the browser-only command experience for quest steps.
- Curriculum data: `src/data/roadmapData.ts` defines the legacy module shape. `src/data/training/*` contains the richer modular curriculum model, with Git content sourced from `src/data/gitTraining.ts`.
- Backend: `server.js` exposes status, verification, merge, reset, and health APIs.
- Persistence: `server/database.js` uses PostgreSQL when `DATABASE_URL` is configured, and local JSON files when it is not.
- Validators: `server/validators.js` checks real sandbox state in `devops-sandbox` for local verification mode.
- Progress levels: `server/progress.js` and `src/progress.ts` keep backend and frontend level labels aligned.

## Main User Flows

1. Guest user opens the app and receives local progress from `/api/status`.
2. User starts a roadmap module and opens a focused lab.
3. Each interactive step can award step XP and is stored as `questKey:stepIndex`.
4. Completing the final step verifies the whole quest and awards quest XP.
5. The dashboard recalculates global progress, category progress, next recommended quest, badges, and level title.
6. If the user signs in with Google, the frontend sends the Google ID token to the backend.
7. The backend validates or locally decodes the token, loads that user's progress, and can merge guest progress.

## Progress Model

User data is stored as:

- `completedQuests`: quest validator keys such as `git_init`.
- `completedSteps`: granular keys such as `git_branch:6`.
- `experiencePoints`: total XP from steps and quests.
- `streak`: active learning streak count.
- `lastActiveDate`: last activity date in `YYYY-MM-DD` format.
- Google profile metadata: `email`, `displayName`, and `avatarUrl`.

Current level thresholds:

- Level 1, `DevOps Novice`: 0-199 XP.
- Level 2, `Git Apprentice`: 200-499 XP.
- Level 3, `Version Control Operator`: 500-999 XP.
- Level 4, `Docker Operator`: 1000-1799 XP.
- Level 5, `Cloud Architect`: 1800+ XP.

This avoids showing a Docker title while the learner is still progressing through Git.

## Google Account State Fixed In This Update

The Google user file `userdata_101738297838093824261.json` now reflects the first four Git quests as completed:

- `git_init`
- `git_status_diff`
- `git_ignore`
- `git_branch`

All interactive steps for those four quests are marked complete. XP is normalized to `940`, which maps to Level 3 `Version Control Operator`.

## Authentication Notes

Google Sign-In is initialized in `src/App.tsx` through Google Identity Services. The app renders GIS buttons in the header and profile view when `VITE_GOOGLE_CLIENT_ID` exists. A fallback `Sign in with Google` button now calls `google.accounts.id.prompt()` when the rendered GIS button is not ready yet.

Backend token handling lives in `server.js`:

- Primary path: verify token through `https://oauth2.googleapis.com/tokeninfo`.
- Offline/network fallback: decode the JWT payload locally to avoid logging the user out during tokeninfo network failures.
- Audience validation is performed when tokeninfo succeeds, using `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`.

## Local Data Files

- `userdata.json`: legacy or local guest data.
- `userdata_local_user.json`: current local guest data.
- `userdata_<googleSub>.json`: local backup for a Google account.

PostgreSQL mode still writes a local backup after successful saves, so fallback mode has current data if the database becomes unavailable.

## Important Commands

```bash
npm run dev
npm run build
npm run lint
npm run validate:training
node --test tests/progress.test.mjs
```

`npm run dev` starts Vite and Express together after cleaning stale ports.

## Recent Fixes

- Moved XP level mapping into shared helpers for backend and frontend.
- Renamed Level 3 from `Docker Operator` to `Version Control Operator`.
- Moved `Docker Operator` to Level 4.
- Fixed optimistic/offline XP awarding so completed steps and quests do not add duplicate XP.
- Fixed the Google sign-in fallback button.
- Removed Turkish text fragments from visible app UI labels.
- Added a regression test for level-title mapping.

## Things To Watch

- `README.md` is extensive but contains mojibake characters from older emoji encoding. The app source no longer has the Turkish UI fragments requested in this update.
- `src/App.tsx` is large and owns many responsibilities. Future feature work should consider extracting authentication, progress calculations, profile UI, and lab state into smaller modules.
- Google token local decode is a pragmatic offline fallback, not a full cryptographic verification path. Production deployments should prefer server-side token verification when network access is reliable.
