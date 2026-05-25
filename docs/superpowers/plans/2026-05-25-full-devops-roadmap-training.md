# Full DevOps Roadmap Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current roadmap app into a serious simulation-based DevOps academy covering all 12 roadmap modules from beginner foundations to senior/operator-level practice.

**Architecture:** Keep the existing React/Vite + Express app, but move training content into module-specific data files and move terminal behavior into a reusable scenario engine. The UI should read a rich scenario schema, the simulator should execute typed command handlers, and the backend should keep local verification only for quests that can safely touch the learner's machine.

**Tech Stack:** React 19, TypeScript, Vite, Express, local JSON/PostgreSQL persistence, existing CSS design system, browser-only simulation engine.

---

## Current Baseline

The repo already has:
- `src/data/gitTraining.ts`: long Git path with 11 quests and quiz.
- `src/data/additionalTraining.ts`: temporary expansion that adds a few quests to modules 2-12.
- `src/data/roadmapData.ts`: core `ModuleData`, `Quest`, `InteractiveStep`, `ModuleQuizQuestion` types.
- `src/components/TerminalSimulator.tsx`: command-driven browser simulator.
- `src/App.tsx`: dashboard, roadmap, focused lab, quiz display, progress handling.
- `server/validators.js`: local validators for selected real-machine tasks.
- `server/database.js`, `server.js`, `supabase_schema.sql`: progress persistence and API.

This plan replaces the temporary broad expansion with a complete curriculum structure and a scalable simulator architecture.

---

## File Structure Target

Create:
- `src/data/training/types.ts`
  - Owns all training-specific types: `ScenarioModule`, `ScenarioQuest`, `ScenarioStep`, `ScenarioQuizQuestion`, `SkillOutcome`, `ScenarioTier`, `CommandExpectation`.
- `src/data/training/index.ts`
  - Exports `roadmapModules` assembled from all module files.
- `src/data/training/git.ts`
  - Move/keep the current `gitTraining.ts` content here.
- `src/data/training/programming.ts`
- `src/data/training/linux.ts`
- `src/data/training/networking.ts`
- `src/data/training/serverManagement.ts`
- `src/data/training/containers.ts`
- `src/data/training/kubernetes.ts`
- `src/data/training/iac.ts`
- `src/data/training/cicd.ts`
- `src/data/training/observability.ts`
- `src/data/training/cloud.ts`
- `src/data/training/softwarePractices.ts`
- `src/data/training/devsecopsBonus.ts`
  - Optional bonus after the 12 roadmap modules.

Create:
- `src/simulator/types.ts`
  - `SimState`, `CommandResult`, `CommandHandler`, `ScenarioRuntime`.
- `src/simulator/createInitialState.ts`
  - Builds initial state per module/quest/tier.
- `src/simulator/normalizeCommand.ts`
  - Normalizes quotes, whitespace, case where safe, and supports accepted alternatives.
- `src/simulator/executeCommand.ts`
  - Dispatches commands to handlers and returns output plus state updates.
- `src/simulator/handlers/git.ts`
- `src/simulator/handlers/linux.ts`
- `src/simulator/handlers/network.ts`
- `src/simulator/handlers/docker.ts`
- `src/simulator/handlers/kubernetes.ts`
- `src/simulator/handlers/terraform.ts`
- `src/simulator/handlers/cicd.ts`
- `src/simulator/handlers/cloud.ts`
- `src/simulator/handlers/observability.ts`
- `src/simulator/handlers/genericFiles.ts`

Modify:
- `src/components/TerminalSimulator.tsx`
  - Make it a pure UI wrapper around `executeCommand`.
- `src/App.tsx`
  - Split later, but first wire it to the new data shape.
- `src/data/roadmapData.ts`
  - Shrink to compatibility exports or remove after migration.
- `server/validators.js`
  - Add only safe validators for selected local quests.
- `server.js`, `server/database.js`, `supabase_schema.sql`
  - Add attempts, quiz scores, capstone completion, and scenario state snapshots.

Optional later split:
- `src/components/ModuleOverview.tsx`
- `src/components/QuestList.tsx`
- `src/components/FocusedLab.tsx`
- `src/components/QuizPanel.tsx`
- `src/components/SkillMap.tsx`

---

## Curriculum Design Rules

Every module must contain:
- 3 tiers: `Foundation`, `Operator`, `Senior`.
- 8-12 simulation quests.
- 1 module checkpoint quiz with 8-12 questions.
- 1 capstone quest every 2-3 modules.
- Clear skill outcomes shown on the module page.
- At least one troubleshooting/failure-mode lab.
- At least one security/reliability habit.

Every quest must contain:
- `id`, `title`, `tier`, `difficulty`, `objective`.
- `prerequisites`: quest ids or module ids.
- `skillOutcomes`: concrete learner outcomes.
- `interactiveSteps`: 4-12 steps.
- `acceptedCommands` where modern and legacy CLI commands differ.
- `failurePrompts`: wrong-command feedback for common mistakes.
- `mockOutput`: realistic enough to teach reading output, not just command typing.
- `localValidatorKey` only if safe and practical.

---

## Full 12-Module Training Matrix

### Module 1: Git & Version Control

Status: Mostly implemented. Expand quality, not quantity.

Required quests:
1. Repository anatomy and first snapshot.
2. Status, diff, staged diff, selective staging.
3. Ignore rules and secret hygiene.
4. Branching, fast-forward merge, graph reading.
5. Merge conflict resolution.
6. Remotes, tracking branches, fetch, pull, push.
7. Restore, reset, revert, safe undo.
8. Stash, clean, context switching.
9. Rebase and cherry-pick.
10. Reflog disaster recovery.
11. Tags, releases, hooks, submodules, worktrees.
12. Capstone: recover a broken release branch and tag a hotfix.

Quiz outcomes:
- Staging vs working tree.
- Public vs private history.
- Merge vs rebase.
- Reflog recovery.
- Safe secret handling.

### Module 2: Programming Language for DevOps

Primary language: Python first. Later optional Go/JavaScript track.

Required quests:
1. Python CLI script: args, exit codes, stdout/stderr.
2. Log parser: count errors and summarize top endpoints.
3. JSON health report generator.
4. YAML config reader and validator.
5. HTTP health checker with timeout and retry.
6. File watcher that detects config drift.
7. Concurrent endpoint checker.
8. Build a small deployment report from multiple files.
9. Write unit tests for automation scripts.
10. Capstone: create a mini incident triage tool.

Senior outcomes:
- Scripts return meaningful exit codes.
- Output is machine-readable.
- Timeouts and retries are explicit.
- Tests cover automation behavior.

### Module 3: Linux & Scripting

Required quests:
1. Filesystem navigation and path discipline.
2. Permissions: `chmod`, ownership model, executable bits.
3. Process inspection: `ps`, `top`/mock, `kill`.
4. Disk and memory triage: `df`, `du`, `free`.
5. Text pipelines: `grep`, `awk`, `sed`, `sort`, `uniq`.
6. Bash script with args and strict mode.
7. Cron job scheduling and log output.
8. Systemd service unit anatomy.
9. SSH key setup and safe remote command pattern.
10. Backup and restore script with verification.
11. Troubleshooting: permission denied, port busy, disk full.
12. Capstone: fix a failing Linux service from logs.

Senior outcomes:
- Can triage common server failures.
- Can automate repeatable admin tasks.
- Understands service lifecycle and logs.

### Module 4: Networking & Security

Required quests:
1. OSI/TCP-IP diagnostic map.
2. DNS lookup: `nslookup`, `dig` style outputs.
3. HTTP headers and status codes with `curl -I`.
4. TLS certificate inspection.
5. Ports and sockets: `netstat`/`ss` style inspection.
6. Firewall allow/deny rule modeling.
7. CIDR and subnet planning exercise.
8. Load balancer health checks.
9. Network troubleshooting: DNS works but HTTPS fails.
10. Security baseline: least exposed ports.
11. Capstone: diagnose a broken service path from client to backend.

Senior outcomes:
- Can reason from DNS to TCP to HTTP/TLS.
- Can identify exposure and firewall mistakes.
- Can explain service connectivity failures.

### Module 5: Server Management

Required quests:
1. Nginx static site config.
2. Reverse proxy to app server.
3. Upstream load balancing.
4. Cache headers and compression.
5. Log formats and access/error log reading.
6. Service reload vs restart.
7. Blue/green server switch.
8. Rate limiting and basic hardening.
9. Certificate renewal mock.
10. Capstone: fix a broken reverse proxy rollout.

Senior outcomes:
- Can operate web server configs safely.
- Knows when to reload vs restart.
- Understands proxy, caching, logs, and rollout risk.

### Module 6: Containers (Docker)

Required quests:
1. Run and inspect a container.
2. Image layers and Dockerfile basics.
3. Build, tag, and list images.
4. Environment variables and container config.
5. Volumes and persistence.
6. Custom bridge networks.
7. Docker Compose multi-service app.
8. Container logs and exec debugging.
9. Healthcheck instruction.
10. Image size optimization and `.dockerignore`.
11. Registry tag/push mock.
12. Capstone: containerize and debug a failing service stack.

Senior outcomes:
- Can build reproducible images.
- Can debug runtime, network, env, and volume issues.
- Understands Compose as a bridge to orchestration.

### Module 7: Container Orchestration (Kubernetes)

Required quests:
1. kubeconfig and cluster-info.
2. Pods and `kubectl get/describe/logs`.
3. Deployments and ReplicaSets.
4. Rollout status, pause, undo.
5. Services: ClusterIP, NodePort, LoadBalancer.
6. ConfigMaps and Secrets.
7. Resource requests/limits.
8. Probes: readiness and liveness.
9. Ingress basics.
10. PersistentVolumeClaim.
11. Jobs and CronJobs.
12. Helm install/upgrade/rollback mock.
13. Troubleshooting: ImagePullBackOff, CrashLoopBackOff.
14. Capstone: deploy a production-like app and recover a bad rollout.

Senior outcomes:
- Can operate Kubernetes workloads.
- Can debug common pod and rollout failures.
- Understands config, secrets, networking, storage, and Helm.

### Module 8: Infrastructure as Code

Required quests:
1. Terraform init/plan/apply lifecycle.
2. Variables and outputs.
3. State file anatomy and drift.
4. Providers and resource addressing.
5. Modules and reusable infrastructure.
6. Remote backend mock and state locking.
7. Terraform import mock.
8. Plan review and destructive change detection.
9. Ansible inventory basics.
10. Ansible playbook idempotency.
11. Secrets handling for IaC.
12. Capstone: provision app infra, detect drift, and fix safely.

Senior outcomes:
- Can read and review infrastructure plans.
- Understands state, drift, modules, and idempotency.
- Avoids unsafe destructive applies.

### Module 9: CI/CD Pipelines

Required quests:
1. Pipeline anatomy: trigger, jobs, steps.
2. Build stage.
3. Test gate with failing test remediation.
4. Artifact upload/download.
5. Cache dependencies.
6. Environment variables and secrets.
7. Matrix jobs.
8. Manual approval gate.
9. Deployment to staging.
10. Rollback workflow.
11. Security scan gate.
12. Capstone: build a full pipeline with test, scan, artifact, deploy, rollback.

Senior outcomes:
- Can design a safe delivery pipeline.
- Understands gates, artifacts, secrets, and rollback.
- Can troubleshoot failed CI jobs from logs.

### Module 10: Monitoring & Observability

Required quests:
1. Metrics vs logs vs traces.
2. Prometheus scrape config.
3. PromQL basic queries.
4. Alert rule design.
5. Grafana dashboard JSON.
6. Log query and correlation.
7. SLI/SLO/error budget calculation.
8. Incident alert routing.
9. Runbook creation.
10. Post-incident dashboard improvement.
11. Capstone: investigate elevated errors using metrics and logs.

Senior outcomes:
- Can define useful signals.
- Can avoid noisy alerts.
- Can connect incidents to SLO and runbook improvements.

### Module 11: Cloud Provider

Use AWS-style terms first, but keep concepts portable to Azure/GCP.

Required quests:
1. CLI identity and region config.
2. IAM least-privilege policy.
3. Object storage bucket lifecycle.
4. VPC/subnet/security group planning.
5. VM launch config mock.
6. Load balancer and target group mock.
7. Managed database backup policy.
8. Serverless function config.
9. Cloud logs and metrics lookup.
10. Cost tagging and budget alert.
11. Well-Architected review checklist.
12. Capstone: design and operate a small cloud service environment.

Senior outcomes:
- Understands IAM, network, compute, storage, managed services.
- Can reason about cost, security, reliability, and operations.
- Can map provider-specific tools to general cloud concepts.

### Module 12: Software Engineering Practices

Required quests:
1. SDLC models and release flow.
2. Scrum board and backlog modeling.
3. User story acceptance criteria.
4. Branching strategy and PR review checklist.
5. Unit test and integration test gates.
6. Release checklist.
7. Change management and risk scoring.
8. Incident postmortem skeleton.
9. DORA metrics calculation.
10. Team topology handoff simulation.
11. Capstone: plan, release, observe, and improve a change.

Senior outcomes:
- Can connect DevOps tools to delivery outcomes.
- Understands collaboration, review, testing, release, and learning loops.
- Can measure software delivery performance.

### Bonus: DevSecOps Fundamentals

Add after the 12 modules, not required for initial completion.

Required quests:
1. Secret scan.
2. Dependency vulnerability report.
3. Container image scan with Trivy-style output.
4. SAST finding triage.
5. DAST finding triage.
6. SBOM generation mock.
7. SLSA/supply-chain provenance.
8. Policy-as-code gate.
9. Vault-style secret retrieval.
10. Capstone: secure a CI/CD pipeline.

---

## Task 1: Introduce Rich Training Types

**Files:**
- Create: `src/data/training/types.ts`
- Modify: `src/data/roadmapData.ts`

- [ ] **Step 1: Create rich type definitions**

```ts
export type ScenarioTier = "Foundation" | "Operator" | "Senior";
export type QuestDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface CommandExpectation {
  expectedCommand: string;
  acceptedCommands?: string[];
  mockOutput: string;
  commonMistakes?: Array<{
    commandPattern: string;
    feedback: string;
  }>;
}

export interface ScenarioStep extends CommandExpectation {
  title: string;
  explanation: string;
  hint: string;
}

export interface ScenarioQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ScenarioQuest {
  id: string;
  title: string;
  tier: ScenarioTier;
  difficulty: QuestDifficulty;
  objective: string;
  prerequisites: string[];
  skillOutcomes: string[];
  stepsWindows: string[];
  stepsLinux: string[];
  verificationCommand: string;
  validatorKey: string;
  localValidatorKey?: string;
  hint?: string;
  interactiveSteps: ScenarioStep[];
}

export interface ScenarioModule {
  id: number;
  title: string;
  icon: string;
  description: string;
  detailedInfo: string;
  outcomes: string[];
  resources: Array<{ name: string; url: string; free: boolean }>;
  quests: ScenarioQuest[];
  quiz: ScenarioQuizQuestion[];
}
```

- [ ] **Step 2: Keep backward compatibility**

Modify `src/data/roadmapData.ts` to re-export compatible names while App migration is in progress:

```ts
export type {
  ScenarioStep as InteractiveStep,
  ScenarioQuest as Quest,
  ScenarioModule as ModuleData,
  ScenarioQuizQuestion as ModuleQuizQuestion
} from "./training/types";

export { roadmapModules } from "./training";
```

- [ ] **Step 3: Run verification**

Run:

```powershell
npx tsc -b
npm run lint
```

Expected:
- TypeScript passes.
- ESLint passes.

---

## Task 2: Move Training Data Into Module Files

**Files:**
- Create: `src/data/training/index.ts`
- Create: all 12 module files listed in File Structure Target
- Modify: `src/data/gitTraining.ts`, `src/data/additionalTraining.ts`

- [ ] **Step 1: Move Git into `src/data/training/git.ts`**

Copy the existing `gitDeepDiveQuests` and `gitModuleQuiz` into:

```ts
import type { ScenarioModule } from "./types";

export const gitModule: ScenarioModule = {
  id: 1,
  title: "Git & Version Control",
  icon: "git-branch",
  description: "Master Git for code, infrastructure, collaboration, release recovery, and auditability.",
  detailedInfo: "Git is the source of truth for application code, infrastructure code, pipeline definitions, and release history.",
  outcomes: [
    "Explain working tree, index, commits, refs, remotes, and reflog.",
    "Resolve conflicts and recover lost commits.",
    "Use branches, tags, hooks, worktrees, and safe undo workflows."
  ],
  resources: [
    { name: "Pro Git Book", url: "https://git-scm.com/book/en/v2", free: true },
    { name: "Learn Git Branching", url: "https://learngitbranching.js.org/", free: true }
  ],
  quests: gitDeepDiveQuests,
  quiz: gitModuleQuiz
};
```

- [ ] **Step 2: Replace `additionalTraining.ts` with real module files**

Create one file per roadmap module instead of the temporary `expandRoadmapModules` approach.

- [ ] **Step 3: Assemble modules in order**

`src/data/training/index.ts`:

```ts
import { gitModule } from "./git";
import { programmingModule } from "./programming";
import { linuxModule } from "./linux";
import { networkingModule } from "./networking";
import { serverManagementModule } from "./serverManagement";
import { containersModule } from "./containers";
import { kubernetesModule } from "./kubernetes";
import { iacModule } from "./iac";
import { cicdModule } from "./cicd";
import { observabilityModule } from "./observability";
import { cloudModule } from "./cloud";
import { softwarePracticesModule } from "./softwarePractices";

export const roadmapModules = [
  gitModule,
  programmingModule,
  linuxModule,
  networkingModule,
  serverManagementModule,
  containersModule,
  kubernetesModule,
  iacModule,
  cicdModule,
  observabilityModule,
  cloudModule,
  softwarePracticesModule
];
```

- [ ] **Step 4: Verify quest count**

Expected rough target:
- Git: 12 quests.
- Programming: 10 quests.
- Linux: 12 quests.
- Networking: 11 quests.
- Server Management: 10 quests.
- Containers: 12 quests.
- Kubernetes: 14 quests.
- IaC: 12 quests.
- CI/CD: 12 quests.
- Observability: 11 quests.
- Cloud: 12 quests.
- Software Practices: 11 quests.
- Total: 139 quests before DevSecOps bonus.

---

## Task 3: Build Scenario Data Helpers

**Files:**
- Create: `src/data/training/helpers.ts`
- Modify: every module file

- [ ] **Step 1: Add quest helper**

```ts
import type { ScenarioQuest, QuestDifficulty, ScenarioTier } from "./types";

export function createQuest(input: {
  id: string;
  title: string;
  tier: ScenarioTier;
  difficulty: QuestDifficulty;
  objective: string;
  prerequisites?: string[];
  skillOutcomes: string[];
  commands: Array<{
    title: string;
    explanation: string;
    command: string;
    acceptedCommands?: string[];
    output: string;
    hint?: string;
  }>;
  localValidatorKey?: string;
}): ScenarioQuest {
  return {
    id: input.id,
    title: input.title,
    tier: input.tier,
    difficulty: input.difficulty,
    objective: input.objective,
    prerequisites: input.prerequisites || [],
    skillOutcomes: input.skillOutcomes,
    stepsWindows: input.commands.map(step => `Run: '${step.command}'`),
    stepsLinux: input.commands.map(step => `Run: '${step.command}'`),
    verificationCommand: input.localValidatorKey
      ? `Runs local validator '${input.localValidatorKey}'.`
      : "Browser simulation validates this scenario.",
    validatorKey: input.id,
    localValidatorKey: input.localValidatorKey,
    hint: "Read the objective, run the command, inspect output, and explain what changed.",
    interactiveSteps: input.commands.map(step => ({
      title: step.title,
      explanation: step.explanation,
      expectedCommand: step.command,
      acceptedCommands: step.acceptedCommands,
      hint: step.hint || `Type: ${step.command}`,
      mockOutput: step.output
    }))
  };
}
```

- [ ] **Step 2: Add quiz helper**

```ts
import type { ScenarioQuizQuestion } from "./types";

export function createConceptQuiz(topic: string, questions: ScenarioQuizQuestion[]): ScenarioQuizQuestion[] {
  return questions.map(question => ({
    ...question,
    explanation: `${topic}: ${question.explanation}`
  }));
}
```

- [ ] **Step 3: Refactor module data to use helpers**

Start with `programming.ts`, `linux.ts`, and `networking.ts`. Keep each file below 500 lines where possible.

---

## Task 4: Implement Simulator Engine

**Files:**
- Create: `src/simulator/types.ts`
- Create: `src/simulator/createInitialState.ts`
- Create: `src/simulator/normalizeCommand.ts`
- Create: `src/simulator/executeCommand.ts`
- Create: handler files under `src/simulator/handlers/`
- Modify: `src/components/TerminalSimulator.tsx`

- [ ] **Step 1: Extract simulator types**

```ts
export interface SimState {
  fs: Record<string, string>;
  permissions: Record<string, string>;
  currentDir: string;
  env: Record<string, string>;
  git: {
    initialized: boolean;
    currentBranch: string;
    branches: Record<string, string>;
    staged: string[];
    commits: Array<{ sha: string; msg: string; files: Record<string, string> }>;
    reflog: Array<{ action: string; sha: string }>;
    remotes: Record<string, string>;
    stashes: string[];
    tags: string[];
  };
  services: Record<string, { status: "running" | "stopped" | "failed"; port?: number; logs: string[] }>;
  docker: {
    containers: Array<{ id: string; name: string; image: string; ports: string; status: string }>;
    images: Array<{ tag: string; id: string; created: string }>;
    volumes: string[];
    networks: string[];
    composeActive: boolean;
  };
  k8s: {
    pods: Array<{ name: string; image: string; status: string; age: string }>;
    deployments: Array<{ name: string; image: string; replicas: number; ready: number }>;
    services: Array<{ name: string; type: string; clusterIp: string; ports: string; age: string }>;
    configMaps: string[];
    secrets: string[];
  };
  cloud: {
    identity?: string;
    region?: string;
    resources: Record<string, string>;
  };
}

export interface CommandResult {
  output: string;
  type: "output" | "error" | "success";
  nextState: SimState;
}
```

- [ ] **Step 2: Extract command normalization**

```ts
export function normalizeCommand(command: string): string {
  return command
    .trim()
    .replace(/['"`]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function commandMatches(input: string, accepted: string[]): boolean {
  const normalizedInput = normalizeCommand(input);
  return accepted.some(command => normalizeCommand(command) === normalizedInput);
}
```

- [ ] **Step 3: Add engine dispatcher**

```ts
import type { CommandResult, SimState } from "./types";
import { runGitCommand } from "./handlers/git";
import { runGenericFileCommand } from "./handlers/genericFiles";

export function executeCommand(command: string, state: SimState): CommandResult {
  const [root] = command.trim().split(/\s+/);

  if (root === "git") return runGitCommand(command, state);
  if (["echo", "cat", "ls", "dir", "pwd", "mkdir"].includes(root)) return runGenericFileCommand(command, state);

  return {
    type: "error",
    output: `command not found in simulator: ${root}`,
    nextState: state
  };
}
```

- [ ] **Step 4: Move existing command code from `TerminalSimulator.tsx` into handlers**

Do this in small commits:
1. Generic files.
2. Git.
3. Docker.
4. Kubernetes.
5. Terraform/IaC.
6. Cloud/CI/CD/observability mocks.

- [ ] **Step 5: Keep `TerminalSimulator.tsx` UI-focused**

After refactor it should own:
- input state.
- history.
- rendering logs.
- calling `executeCommand`.
- comparing with current scenario step.
- calling `onStepComplete`.

It should not own domain-specific command logic.

---

## Task 5: Implement Module 2 Data - Programming

**Files:**
- Create: `src/data/training/programming.ts`

- [ ] **Step 1: Add module shell**
- [ ] **Step 2: Add all 10 quests from the matrix**
- [ ] **Step 3: Add 10-question quiz**
- [ ] **Step 4: Add at least 3 common mistake feedback entries**

Important quest ids:
- `prog_cli_exit_codes`
- `prog_log_parser`
- `prog_json_health_report`
- `prog_yaml_validator`
- `prog_http_retry_checker`
- `prog_config_drift`
- `prog_concurrent_checker`
- `prog_deploy_report`
- `prog_script_unit_tests`
- `prog_incident_triage_capstone`

Verification:

```powershell
npx tsc -b
npm run lint
```

Expected:
- Module appears as 10 quests in UI.
- Quest starts focused lab.
- First command advances to step 2.

---

## Task 6: Implement Module 3 Data - Linux

**Files:**
- Create: `src/data/training/linux.ts`
- Modify: `src/simulator/handlers/linux.ts`

Quest ids:
- `linux_paths_filesystem`
- `linux_permissions_deep`
- `linux_process_triage`
- `linux_disk_memory`
- `linux_text_pipeline`
- `linux_bash_strict_mode`
- `linux_cron_logs`
- `linux_systemd_unit`
- `linux_ssh_keys`
- `linux_backup_restore`
- `linux_failure_modes`
- `linux_service_capstone`

Handler support required:
- `chmod`
- `ps`
- `df`
- `du`
- `grep`
- `awk` mock output for known scenarios
- `systemctl status/start/restart`
- `journalctl -u`

Verification:
- Start `linux_service_capstone`.
- Enter `systemctl status api.service`.
- UI should show failed status and next remediation step.

---

## Task 7: Implement Module 4 Data - Networking

**Files:**
- Create: `src/data/training/networking.ts`
- Modify: `src/simulator/handlers/network.ts`

Quest ids:
- `net_osi_diagnostic_map`
- `net_dns_lookup`
- `net_http_headers`
- `net_tls_certificate`
- `net_ports_sockets`
- `net_firewall_rules`
- `net_cidr_subnets`
- `net_lb_health_checks`
- `net_dns_https_failure`
- `net_exposure_baseline`
- `net_service_path_capstone`

Handler support required:
- `nslookup`
- `dig`
- `curl -I`
- `openssl s_client` mock
- `ss -tulpn`
- `netstat -ano`
- firewall rule file commands

Verification:
- DNS and HTTP quests must teach difference between name resolution, TCP port reachability, TLS, and app response.

---

## Task 8: Implement Module 5 Data - Server Management

**Files:**
- Create: `src/data/training/serverManagement.ts`
- Modify: `src/simulator/handlers/genericFiles.ts`

Quest ids:
- `server_nginx_static`
- `server_reverse_proxy`
- `server_upstream_lb`
- `server_cache_compression`
- `server_log_reading`
- `server_reload_restart`
- `server_blue_green`
- `server_rate_limit_hardening`
- `server_cert_renewal`
- `server_proxy_capstone`

Handler support required:
- `nginx -t` mock validation.
- `systemctl reload nginx`
- `tail -n`
- `cat`

Capstone failure:
- Bad upstream points to `localhost:3999`.
- Learner must inspect logs, fix upstream, run config test, reload.

---

## Task 9: Implement Module 6 Data - Containers

**Files:**
- Create: `src/data/training/containers.ts`
- Modify: `src/simulator/handlers/docker.ts`

Quest ids:
- `docker_run_inspect`
- `docker_layers_dockerfile`
- `docker_build_tag`
- `docker_env_config`
- `docker_volumes`
- `docker_networks`
- `docker_compose_stack`
- `docker_logs_exec`
- `docker_healthcheck`
- `docker_image_optimization`
- `docker_registry_mock`
- `docker_stack_capstone`

Handler support required:
- `docker run`
- `docker ps`
- `docker inspect`
- `docker logs`
- `docker exec`
- `docker build`
- `docker images`
- `docker volume`
- `docker network`
- `docker compose up`

---

## Task 10: Implement Module 7 Data - Kubernetes

**Files:**
- Create: `src/data/training/kubernetes.ts`
- Modify: `src/simulator/handlers/kubernetes.ts`

Quest ids:
- `k8s_kubeconfig_cluster`
- `k8s_pods_describe_logs`
- `k8s_deployments_replicasets`
- `k8s_rollout_undo`
- `k8s_services_types`
- `k8s_configmaps_secrets`
- `k8s_resources_limits`
- `k8s_probes`
- `k8s_ingress`
- `k8s_pvc_storage`
- `k8s_jobs_cronjobs`
- `k8s_helm_release`
- `k8s_failure_modes`
- `k8s_capstone_rollout_recovery`

Handler support required:
- `kubectl get`
- `kubectl describe`
- `kubectl logs`
- `kubectl create deployment`
- `kubectl set image`
- `kubectl rollout status`
- `kubectl rollout undo`
- `kubectl create configmap`
- `kubectl create secret`
- `helm install`
- `helm upgrade`
- `helm rollback`

---

## Task 11: Implement Module 8 Data - IaC

**Files:**
- Create: `src/data/training/iac.ts`
- Modify: `src/simulator/handlers/terraform.ts`

Quest ids:
- `iac_tf_lifecycle`
- `iac_tf_variables_outputs`
- `iac_tf_state_drift`
- `iac_tf_providers_resources`
- `iac_tf_modules`
- `iac_tf_remote_backend`
- `iac_tf_import`
- `iac_tf_plan_review`
- `iac_ansible_inventory`
- `iac_ansible_idempotency`
- `iac_secret_handling`
- `iac_capstone_drift_fix`

Handler support required:
- `terraform init`
- `terraform fmt`
- `terraform validate`
- `terraform plan`
- `terraform apply`
- `terraform state list`
- `terraform import`
- `ansible-inventory`
- `ansible-playbook`

---

## Task 12: Implement Module 9 Data - CI/CD

**Files:**
- Create: `src/data/training/cicd.ts`
- Modify: `src/simulator/handlers/cicd.ts`

Quest ids:
- `cicd_pipeline_anatomy`
- `cicd_build_stage`
- `cicd_test_gate`
- `cicd_artifacts`
- `cicd_dependency_cache`
- `cicd_env_secrets`
- `cicd_matrix_jobs`
- `cicd_manual_approval`
- `cicd_staging_deploy`
- `cicd_rollback`
- `cicd_security_scan`
- `cicd_capstone_full_pipeline`

Handler support required:
- Read and validate mock YAML files.
- Simulate failing and passing job logs.
- Simulate artifact creation.
- Simulate secret reference validation.

---

## Task 13: Implement Module 10 Data - Observability

**Files:**
- Create: `src/data/training/observability.ts`
- Modify: `src/simulator/handlers/observability.ts`

Quest ids:
- `obs_signals_metrics_logs_traces`
- `obs_prometheus_scrape`
- `obs_promql_queries`
- `obs_alert_rule`
- `obs_grafana_dashboard`
- `obs_log_correlation`
- `obs_slo_error_budget`
- `obs_alert_routing`
- `obs_runbook`
- `obs_dashboard_improvement`
- `obs_capstone_error_investigation`

Handler support required:
- `promtool check rules`
- mock `promql` command.
- log query command.
- dashboard JSON file inspection.

---

## Task 14: Implement Module 11 Data - Cloud

**Files:**
- Create: `src/data/training/cloud.ts`
- Modify: `src/simulator/handlers/cloud.ts`

Quest ids:
- `cloud_cli_identity_region`
- `cloud_iam_least_privilege`
- `cloud_object_lifecycle`
- `cloud_vpc_subnet_sg`
- `cloud_vm_launch_config`
- `cloud_lb_target_group`
- `cloud_db_backup_policy`
- `cloud_serverless_function`
- `cloud_logs_metrics`
- `cloud_cost_tags_budget`
- `cloud_well_architected`
- `cloud_capstone_service_environment`

Handler support required:
- `aws sts get-caller-identity`
- `aws configure get region`
- `aws iam simulate-principal-policy` mock
- `aws s3api`
- `aws ec2`
- `aws logs`
- Generic provider-neutral output notes in explanations.

---

## Task 15: Implement Module 12 Data - Software Practices

**Files:**
- Create: `src/data/training/softwarePractices.ts`

Quest ids:
- `sw_sdlc_release_flow`
- `sw_scrum_backlog`
- `sw_acceptance_criteria`
- `sw_branching_pr_review`
- `sw_test_strategy`
- `sw_release_checklist`
- `sw_change_risk_score`
- `sw_incident_postmortem`
- `sw_dora_metrics`
- `sw_team_topology_handoff`
- `sw_capstone_change_lifecycle`

No complex simulator handler required:
- Mostly file creation, JSON/YAML/Markdown review, and quiz reasoning.

---

## Task 16: Progress, Scoring, and Unlocks

**Files:**
- Modify: `server.js`
- Modify: `server/database.js`
- Modify: `supabase_schema.sql`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add progress fields**

Add:
- `completedSteps`
- `completedQuizzes`
- `quizScores`
- `capstonesCompleted`
- `scenarioAttempts`

- [ ] **Step 2: Add unlock rules**

Rules:
- Module quests can be opened freely for exploration.
- Module quiz becomes active after all module quests are complete.
- Capstone gets "recommended" badge after tier quests are complete.
- Next module is recommended, not hard-locked.

- [ ] **Step 3: Add scoring**

XP:
- Foundation step: 10 XP.
- Operator step: 15 XP.
- Senior step: 20 XP.
- Foundation quest completion: 100 XP.
- Operator quest completion: 200 XP.
- Senior quest completion: 300 XP.
- Capstone completion: 500 XP.
- Perfect quiz: 250 XP.

---

## Task 17: UI Improvements for Serious Learning

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ModuleOverview.tsx`
- Create: `src/components/QuestList.tsx`
- Create: `src/components/FocusedLab.tsx`
- Create: `src/components/QuizPanel.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add module outcome cards**

Show:
- Foundation outcomes.
- Operator outcomes.
- Senior outcomes.
- Capstone status.

- [ ] **Step 2: Add quest tier filters**

Controls:
- `All`
- `Foundation`
- `Operator`
- `Senior`
- `Capstone`

- [ ] **Step 3: Add lab left panel improvements**

Each step should show:
- Concept.
- Why it matters in DevOps.
- Command objective.
- Expected output clue.
- Mistake feedback area.

- [ ] **Step 4: Add "Explain before continue" optional reflection**

For senior quests, add a short prompt:
- "What changed?"
- "How would you verify in production?"
- "What could go wrong?"

Store locally only. Do not require AI grading.

---

## Task 18: Local Validators Strategy

**Files:**
- Modify: `server/validators.js`

Only add local validators for safe, contained tasks:
- Git repo checks inside `devops-sandbox`.
- Python script file existence and content.
- Linux file/script checks without destructive commands.
- Docker checks only if Docker is installed and learner explicitly uses local mode.
- Kubernetes checks only if `kubectl` exists and a cluster is reachable.
- Terraform checks only inside `devops-sandbox`.

Do not run:
- destructive shell commands.
- cloud-changing commands.
- firewall-changing commands.
- system service changes on host.
- package installs.

For risky topics, use browser simulation only.

---

## Task 19: Verification Before Completion

Run after every module file is added:

```powershell
npm run lint
npx tsc -b
npx vite build
```

Manual browser checks:
1. Open `http://localhost:5173`.
2. Confirm total quest count increased.
3. Open each module.
4. Confirm at least 8 quests exist.
5. Start one Foundation quest.
6. Type first command.
7. Confirm step advances.
8. Exit lab.
9. Confirm progress persists.
10. Finish a module with temporary reset data and confirm quiz unlocks.

---

## Recommended Execution Order

1. Data model and helpers.
2. Simulator engine extraction.
3. Git migration to new structure.
4. Programming, Linux, Networking.
5. Server, Containers, Kubernetes.
6. IaC, CI/CD, Observability.
7. Cloud, Software Practices.
8. Progress/scoring/unlocks.
9. UI split and polish.
10. DevSecOps bonus.
11. Final QA.

---

## Commit Plan

Use small commits:

```bash
git add src/data/training/types.ts src/data/training/helpers.ts src/data/roadmapData.ts
git commit -m "refactor: add rich training data model"
```

```bash
git add src/simulator src/components/TerminalSimulator.tsx
git commit -m "refactor: extract simulator command engine"
```

```bash
git add src/data/training/programming.ts src/data/training/linux.ts src/data/training/networking.ts
git commit -m "feat: add foundational roadmap training modules"
```

```bash
git add src/data/training/serverManagement.ts src/data/training/containers.ts src/data/training/kubernetes.ts
git commit -m "feat: add infrastructure runtime training modules"
```

```bash
git add src/data/training/iac.ts src/data/training/cicd.ts src/data/training/observability.ts
git commit -m "feat: add delivery and operations training modules"
```

```bash
git add src/data/training/cloud.ts src/data/training/softwarePractices.ts
git commit -m "feat: add cloud and engineering practice training modules"
```

```bash
git add src/App.tsx src/components src/index.css server.js server/database.js supabase_schema.sql
git commit -m "feat: add academy progress, quizzes, and capstones"
```

---

## Stop Point for Next Session

If context runs out, continue from the first unchecked task above. The most important continuation anchor is:

1. Open this file.
2. Check `git status --short`.
3. Run `npm run lint`, `npx tsc -b`, and `npx vite build`.
4. Continue at the first unchecked task.

