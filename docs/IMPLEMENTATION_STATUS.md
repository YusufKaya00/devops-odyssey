# DevOps Odyssey: Implementation Checkpoint

Date: 2026-09-15
Branch: `codex/stateful-git-learning`

## Delivered In This Checkpoint

- The existing, uncommitted curriculum enrichment was preserved and reviewed. The roadmap contains 12 modules, 154 quests, 346 interactive steps and 96 quiz questions. These are content counts, not proof of DevOps proficiency.
- Git lessons 01-05 (32 steps) execute against real Git objects using `isomorphic-git`, with a browser-only LightningFS/IndexedDB filesystem. Nothing is executed in the host shell and no remote Git service is contacted.
- Working files, staged blobs, commit messages, branch tips, ignore rules, diffs and merge conflicts derive from repository state. A failed command does not earn a normal step. The conflict-diagnosis step explicitly expects an actual merge conflict.
- Equivalent successful approaches can satisfy goals: `git add .`, `git switch`, reordered supported log flags, and meaningful alternative commit messages. File paths and contents remain case-sensitive.
- Each of these labs persists its repository independently. Leaving/reopening/reloading does not reconstruct it from completed-step flags. Resetting a lab clears only its virtual repository, keeping learning progress and notes.
- Steps and quests can be selected freely. Navigation does not mark skipped steps complete. Notes follow the selected step and drafts persist immediately. The terminal stays available for practice after completion.
- Guided scenarios retain their existing mock execution path and now accept multiline input. They are labelled "Guided scenario". They do not provide the same execution guarantees as the first five Git labs.
- Runtime curriculum validation checks evaluated data, identities, references, prerequisite cycles, quiz keys and metadata propagation. Git module reference material is now surfaced by the module expansion.
- Google authentication no longer trusts decoded-but-unverified tokens after provider failures. Guest request headers cannot select an authenticated user's storage identity.

## Verification Commands

```sh
npm ci
npm test
npm run validate:training
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
```

The browser suite uses isolated browser contexts and a mocked progress API. It exercises the real frontend and browser Git engine without modifying the learner's saved progress. It is not a live Google sign-in or PostgreSQL integration test. The unit suite includes actual Git object/index behavior, conflict resolution and persistence, plus navigation and authentication boundary tests.

Verified on 2026-09-15:

- 191 unit/backend/data checks passed.
- The opt-in navigation harness passed all four browser scenarios (five reported tests including its parent), with the terminal and backend mocked. It covers delayed progress responses, out-of-order completion and note drafts.
- All 12 Playwright checks passed against a production build: desktop/mobile Git workflows, persistence, multiline input and roadmap layout, including resize checks from 320 to 1440 pixels. Screenshots were inspected.
- TypeScript and production build passed. ESLint has zero errors and three pre-existing hook dependency warnings in `App.tsx`. Vite still warns about the main content bundle exceeding 500 kB; the Git engine is lazy-loaded separately.
- `npm audit` reports zero known vulnerabilities after compatible dependency updates.
- Local backend `/api/health` returned `ok`. Live Google and PostgreSQL flows were not exercised.

## Next Work, In Order

1. Convert `git_remote`, `git_undo`, `git_stash`, `git_rebase`, `git_reflog`, and `git_release` from guided commands to independently seeded stateful exercises. Use a second virtual repository for remote collaboration. Add recovery and abort-path tests before enabling each lesson. Keep existing quest IDs and step indices stable, or provide an explicit progress migration.
2. Add an independent Git incident capstone with hidden checks, several valid repair paths and an evidence report. Do not equate typing the example with understanding the outcome.
3. Extend Linux and networking with a typed model of files, permissions, processes, services, sockets, DNS and routing. Each important scenario needs setup, a controlled failure, diagnosis, repair and verification.
4. Replace placeholder scripting exercises with execution in an isolated runtime or a real local lab. Fix mismatched local validator aliases before enabling them. Then cover Docker, Kubernetes, IaC, CI/CD, observability and cloud state using dedicated domain models.
5. Expand the 57 single-step catalog quests and improve question distractors. Add persisted quiz attempts, practical gates and capstone evidence; simple XP thresholds should not imply professional mastery.
6. Complete backend validation of known quest/step IDs, per-user progress reconciliation, quiz results and scenario versioning. The current progress API still accepts client-reported simulation completion; it is not a certification authority.

See [training-audit.md](training-audit.md) for per-module inventory, specific misleading exercises, and official references. The original [implementation plan](superpowers/plans/2026-05-25-full-devops-roadmap-training.md) remains the long-term scope; unchecked tasks must not be treated as finished because their data files exist.

## Sources Used For The Git Engine

- [isomorphic-git quick start with bundlers](https://isomorphic-git.org/docs/en/quickstart-with-bundlers)
- [isomorphic-git status matrix](https://isomorphic-git.org/docs/en/statusMatrix)
- [Git diff reference](https://git-scm.com/docs/git-diff)

Repository state is durable only within this browser profile and origin. Browser storage removal resets the virtual repositories. The displayed history is a bounded view with explicit parent IDs, not a complete emulation of every Git CLI flag.
