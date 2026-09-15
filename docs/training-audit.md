# Training Data Audit

Snapshot: 2026-09-15, shared working tree on `codex/stateful-git-learning`.
Counts below are from evaluated TypeScript exports, not source-text matches.
Concurrent curriculum edits can change this snapshot; rerun `npm run validate:training`.

## Runtime Inventory

| ID | Module | Catalog quests | Roadmap quests | Catalog steps | Roadmap steps | Quiz questions |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | Git | 11 | 11 | 72 | 72 | 8 |
| 2 | Programming | 10 | 11 | 31 | 33 | 8 |
| 3 | Linux | 12 | 14 | 38 | 44 | 8 |
| 4 | Networking | 11 | 12 | 29 | 30 | 8 |
| 5 | Server management | 10 | 11 | 21 | 22 | 8 |
| 6 | Containers | 12 | 15 | 21 | 28 | 8 |
| 7 | Kubernetes | 14 | 17 | 29 | 34 | 8 |
| 8 | Infrastructure as code | 12 | 13 | 19 | 22 | 8 |
| 9 | CI/CD | 12 | 13 | 14 | 15 | 8 |
| 10 | Observability | 11 | 12 | 15 | 16 | 8 |
| 11 | Cloud | 12 | 13 | 15 | 16 | 8 |
| 12 | Software practices | 11 | 12 | 13 | 14 | 8 |
| Total | 12 populated modules | 138 | 154 | 317 | 346 | 96 |

The roadmap retains 16 legacy-only quests, accounting for its additional 29 steps.
Both catalogs have unique module IDs, quest IDs and progress keys, valid prerequisite references with no cycles, and valid quiz answer indices. Quiz counts are identical in both catalogs.

## Changes and Checks

- Replaced file/token scanning with an in-memory Vite bundle of the actual catalog, roadmap, expansion function and helpers. No extra package, app config, server, or bundle output is required.
- Integrity checks cover all 12 module IDs, quest count floors, required content, command steps, optional enrichment shapes, resources, quiz options/answers, duplicate IDs/progress keys, missing prerequisites and cycles. Git's floor is the established 11 quests; other module floors retain the prior validator's quest counts. These floors are regression checks, not a complete curriculum specification. Empty string mock outputs remain valid, including the actual first five Git quests' silent `git diff` step; missing/non-string outputs are rejected.
- Compare source quests, quizzes, resources and module enrichment against the exported roadmap. This detects content that exists in a source file but is dropped during expansion.
- Expansion now includes Git enrichment, merges quizzes/resources, keeps legacy-only quests, and is idempotent. Catalog records win on matching IDs, question text or URLs; existing order is retained.
- Preserved the existing helper's quest/step enrichment. Corrected its verification label: a legacy local validator reference is not proof that the scenario was executed.
- `createConceptQuiz` deterministically rotates options so the original correct answer occupies `questionIndex % optionCount`. The source options are not mutated, invalid answer indices remain invalid, and no random shuffle is used. Modules 2-12 now each have two correct answers at every option index; Git's separately authored quiz is unchanged. A fresh-process reload produces identical quizzes.
- Passed: `node --test tests/training-integrity.test.mjs` (52 tests), `npm run validate:training` (no errors or warnings), focused ESLint on the two edited TypeScript files, and a focused TypeScript dependency-graph check using `--ignoreConfig --noEmit`. Tests cover answer identity against original options, rotation/distribution for 2-5 options, invalid inputs, real module distribution and reload stability. A separate before/after runtime comparison confirmed all 96 correct answer identities, option sets and explanations, and all quest records remained unchanged. CLI loading also passes when launched outside the workspace.
- Full application build, browser/database E2E and real infrastructure execution were not repeated in this bounded audit. No commit or push was performed.

## Remaining Gaps

- Local validation mapping is unfinished: `prog_cli_exit_codes` writes `check_deploy.py` but references `py_health`, whose server validator inspects `health_check.py`; `linux_backup_restore` creates `backup.tar.gz`/`data.txt` but references a validator expecting `backup_dest/README.md` and `quest.txt`. The permissions scenario creates a shell script, while the Windows validator expects `run_check.ps1`. Do not wire these aliases into progress recording without scenario-specific checks.
- `prog_http_retry_checker` prints a fixed successful status and immediately breaks. It neither makes an HTTP request nor exercises a timeout/retry failure. Add an actual client, a controlled failing endpoint, bounded attempts and assertions; Python's [urlopen timeout documentation](https://docs.python.org/3/library/urllib.request.html#urllib.request.urlopen) describes the relevant timeout parameter.
- `cicd_capstone_full_pipeline` reads/stages/commits root-level `workflow.yml`, then claims a runner is triggered immediately. A runnable exercise needs a workflow in `.github/workflows`, an actual triggering event, and run/job evidence. A local commit alone is not the configured `push` event. See [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
- `linux_backup_restore` extracts over the still-present original file. Add an isolated restore destination and a content/checksum assertion so failed restoration cannot be mistaken for reading the original data.
- The always-first answer-position defect is fixed through deterministic rotation. Assessment quality still needs scenario-based distractors and applied questions; the stable positional cycle is predictable, and balanced indices alone do not establish understanding.
- Programming, Linux, Networking and Server Management each reuse one concept summary across every quest. Modules 6-9 still expose generic cheat-sheet entries such as bare `init` and `apply`. Replace these with topic-specific explanations and executable tool-qualified examples.
- There are 57 single-step catalog quests, including 11 of 12 CI/CD quests. Only 11 of 138 catalog quests declare prerequisites. Expand important scenarios into setup, controlled failure, diagnosis, repair and verification; define dependencies where actual prior knowledge is required.
- Windows/Linux instruction arrays from `createQuest` use the same command strings. They do not establish PowerShell compatibility. Test shell-specific commands and quoting separately or label the required shell explicitly.

Passing these integrity checks proves populated, internally consistent content and preserved metadata. It does not establish command semantics, stateful simulation behavior, working deployments, or curriculum mastery.
