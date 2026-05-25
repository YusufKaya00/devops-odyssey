import type { ModuleData, ModuleQuizQuestion, Quest } from './roadmapData';
import { programmingModule } from './training/programming';

type QuestSeed = {
  id: string;
  title: string;
  difficulty: Quest['difficulty'];
  objective: string;
  commands: Array<{
    title: string;
    explanation: string;
    command: string;
    output: string;
  }>;
};

const makeQuest = (seed: QuestSeed): Quest => ({
  id: seed.id,
  title: seed.title,
  difficulty: seed.difficulty,
  objective: seed.objective,
  stepsWindows: seed.commands.map(step => `Run: '${step.command}'`),
  stepsLinux: seed.commands.map(step => `Run: '${step.command}'`),
  verificationCommand: "Browser simulation validates this applied roadmap drill.",
  validatorKey: seed.id,
  hint: "Treat the command as a realistic DevOps drill: inspect, change, verify, then explain the result.",
  interactiveSteps: seed.commands.map(step => ({
    title: step.title,
    explanation: step.explanation,
    expectedCommand: step.command,
    hint: `Type: ${step.command}`,
    mockOutput: step.output
  }))
});

const moduleQuiz = (topic: string): ModuleQuizQuestion[] => [
  {
    question: `What is the main goal of the ${topic} module?`,
    options: ["Memorize command names only", "Build repeatable operational judgment through practice", "Avoid automation", "Skip verification"],
    answerIndex: 1,
    explanation: "The site is designed around applied drills: each command should connect to an operational reason and a verification habit."
  },
  {
    question: "Which workflow is safest before changing production-like systems?",
    options: ["Change first, inspect later", "Inspect current state, apply a focused change, verify the result", "Delete state files", "Ignore logs"],
    answerIndex: 1,
    explanation: "DevOps work is stateful. Good operators observe first, make small changes, and verify with evidence."
  },
  {
    question: "Why are simulations useful before local or cloud execution?",
    options: ["They replace all real practice", "They let you learn command intent and failure modes safely", "They make logs unnecessary", "They remove the need for source control"],
    answerIndex: 1,
    explanation: "Simulation is the low-risk rehearsal layer. Real local verification is still available for selected quests."
  }
];

const additions: Record<number, { quests: Quest[]; quiz: ModuleQuizQuestion[] }> = {
  2: {
    quests: programmingModule.quests,
    quiz: programmingModule.quiz
  },
  3: {
    quests: [
      makeQuest({
        id: "linux_process_audit",
        title: "Audit Processes and Disk Usage",
        difficulty: "Beginner",
        objective: "Practice the inspection commands used during server triage.",
        commands: [
          { title: "List Processes", explanation: "Process inspection helps identify runaway jobs, failed daemons, and resource pressure.", command: "ps aux", output: "USER PID %CPU COMMAND\nroot 1 0.0 init\nstudent 42 1.2 node server.js" },
          { title: "Inspect Disk Usage", explanation: "Disk pressure is a common outage cause. df gives filesystem capacity and usage.", command: "df -h", output: "Filesystem Size Used Avail Use%\n/dev/sda1 40G 18G 22G 45%" }
        ]
      }),
      makeQuest({
        id: "linux_text_pipeline",
        title: "Build a Grep/Awk Text Pipeline",
        difficulty: "Intermediate",
        objective: "Extract useful lines from operational text.",
        commands: [
          { title: "Create Access Log", explanation: "Logs are raw operational evidence. Shell pipelines let you reduce them quickly.", command: "echo \"GET / 200\nGET /admin 403\nPOST /deploy 500\" > access.log", output: "Wrote access.log." },
          { title: "Find Failing Requests", explanation: "grep is a first-line incident response tool for finding patterns in logs.", command: "grep 500 access.log", output: "POST /deploy 500" }
        ]
      })
    ],
    quiz: moduleQuiz("Linux and scripting")
  },
  4: {
    quests: [
      makeQuest({
        id: "dns_http_trace",
        title: "Trace DNS and HTTP Connectivity",
        difficulty: "Beginner",
        objective: "Practice resolving a hostname and checking an HTTP endpoint.",
        commands: [
          { title: "Resolve a Hostname", explanation: "DNS translates names into IP addresses. Many incidents start as DNS failures.", command: "nslookup example.com", output: "Name: example.com\nAddress: 93.184.216.34" },
          { title: "Check HTTP Headers", explanation: "Headers reveal server behavior, caching, redirects, and status codes.", command: "curl -I https://example.com", output: "HTTP/2 200\ncontent-type: text/html" }
        ]
      }),
      makeQuest({
        id: "firewall_rule_mock",
        title: "Model a Firewall Allow Rule",
        difficulty: "Intermediate",
        objective: "Create a mock rule documenting allowed service traffic.",
        commands: [
          { title: "Write Firewall Rule", explanation: "Firewall changes should be explicit: source, destination, port, and protocol.", command: "echo \"allow tcp 10.0.0.0/24 -> 10.0.1.10:443\" > firewall.rules", output: "Wrote firewall.rules." },
          { title: "Review the Rule", explanation: "A human-readable review catches accidental broad access before production.", command: "cat firewall.rules", output: "allow tcp 10.0.0.0/24 -> 10.0.1.10:443" }
        ]
      })
    ],
    quiz: moduleQuiz("networking and security")
  },
  5: {
    quests: [
      makeQuest({
        id: "nginx_load_balancer",
        title: "Configure an Nginx Upstream",
        difficulty: "Intermediate",
        objective: "Model a reverse proxy with two backend services.",
        commands: [
          { title: "Write Upstream Config", explanation: "Upstreams let Nginx distribute traffic across backend instances.", command: "echo \"upstream app { server app1:3000; server app2:3000; }\" > upstream.conf", output: "Wrote upstream.conf." },
          { title: "Inspect Config", explanation: "Reviewing config before reload prevents avoidable downtime.", command: "cat upstream.conf", output: "upstream app { server app1:3000; server app2:3000; }" }
        ]
      }),
      makeQuest({
        id: "server_log_rotation",
        title: "Design Log Rotation Policy",
        difficulty: "Beginner",
        objective: "Create a basic policy that prevents logs from filling disks.",
        commands: [
          { title: "Write Rotation Policy", explanation: "Unbounded logs can fill a server. Rotation policies keep retention predictable.", command: "echo \"rotate daily keep 14 compress\" > logrotate.policy", output: "Wrote logrotate.policy." },
          { title: "Review Policy", explanation: "Compression and retention are operational tradeoffs between cost and forensic depth.", command: "cat logrotate.policy", output: "rotate daily keep 14 compress" }
        ]
      })
    ],
    quiz: moduleQuiz("server management")
  },
  6: {
    quests: [
      makeQuest({
        id: "docker_volume_network",
        title: "Practice Docker Volumes and Networks",
        difficulty: "Intermediate",
        objective: "Model persistent data and private container networking.",
        commands: [
          { title: "Create a Network", explanation: "Custom bridge networks give containers service discovery and isolation.", command: "docker network create devops-net", output: "devops-net" },
          { title: "Create a Volume", explanation: "Volumes persist data beyond a container lifecycle.", command: "docker volume create app-data", output: "app-data" }
        ]
      }),
      makeQuest({
        id: "docker_healthcheck",
        title: "Add a Container Healthcheck",
        difficulty: "Advanced",
        objective: "Add a healthcheck instruction to a Dockerfile.",
        commands: [
          { title: "Write Healthcheck Dockerfile", explanation: "Healthchecks let orchestrators know whether a running process is actually healthy.", command: "echo \"FROM nginx\nHEALTHCHECK CMD curl -f http://localhost/ || exit 1\" > Dockerfile.health", output: "Wrote Dockerfile.health." },
          { title: "Inspect Dockerfile", explanation: "The healthcheck becomes image metadata used by runtime tooling.", command: "cat Dockerfile.health", output: "FROM nginx\nHEALTHCHECK CMD curl -f http://localhost/ || exit 1" }
        ]
      })
    ],
    quiz: moduleQuiz("containers")
  },
  7: {
    quests: [
      makeQuest({
        id: "k8s_deployment_rollout",
        title: "Kubernetes Deployment Rollout",
        difficulty: "Intermediate",
        objective: "Create and inspect a Deployment rollout.",
        commands: [
          { title: "Create Deployment", explanation: "Deployments manage ReplicaSets and give you declarative rollout controls.", command: "kubectl create deployment web --image=nginx", output: "deployment.apps/web created" },
          { title: "Check Rollout", explanation: "Rollout status tells you whether the desired state became ready.", command: "kubectl rollout status deployment/web", output: "deployment \"web\" successfully rolled out" }
        ]
      }),
      makeQuest({
        id: "k8s_config_secret",
        title: "ConfigMap and Secret Basics",
        difficulty: "Intermediate",
        objective: "Model app configuration and sensitive values as Kubernetes resources.",
        commands: [
          { title: "Create ConfigMap", explanation: "ConfigMaps keep non-secret configuration separate from container images.", command: "kubectl create configmap app-config --from-literal=MODE=prod", output: "configmap/app-config created" },
          { title: "Create Secret", explanation: "Secrets are Kubernetes objects for sensitive values, with access controlled by RBAC and namespace boundaries.", command: "kubectl create secret generic app-secret --from-literal=TOKEN=demo", output: "secret/app-secret created" }
        ]
      })
    ],
    quiz: moduleQuiz("Kubernetes")
  },
  8: {
    quests: [
      makeQuest({
        id: "tf_plan_variables",
        title: "Terraform Variables and Plan Review",
        difficulty: "Intermediate",
        objective: "Model variables and review an execution plan before apply.",
        commands: [
          { title: "Create Variable File", explanation: "Variables make Terraform modules reusable across environments.", command: "echo \"variable \\\"env\\\" { default = \\\"dev\\\" }\" > variables.tf", output: "Wrote variables.tf." },
          { title: "Review Plan", explanation: "terraform plan is the safety review before changing infrastructure state.", command: "terraform plan", output: "Plan: 1 to add, 0 to change, 0 to destroy." }
        ]
      }),
      makeQuest({
        id: "ansible_inventory",
        title: "Ansible Inventory and Playbook",
        difficulty: "Beginner",
        objective: "Create an inventory and a tiny playbook skeleton.",
        commands: [
          { title: "Create Inventory", explanation: "Ansible inventories define which hosts automation targets.", command: "echo \"[web]\nweb1 ansible_host=10.0.1.10\" > inventory.ini", output: "Wrote inventory.ini." },
          { title: "Create Playbook", explanation: "Playbooks describe desired configuration tasks in YAML.", command: "echo \"- hosts: web\n  tasks:\n    - debug: msg=hello\" > playbook.yml", output: "Wrote playbook.yml." }
        ]
      })
    ],
    quiz: moduleQuiz("infrastructure as code")
  },
  9: {
    quests: [
      makeQuest({
        id: "gha_test_gate",
        title: "Add a CI Test Gate",
        difficulty: "Intermediate",
        objective: "Model a pipeline that installs dependencies and runs tests.",
        commands: [
          { title: "Write Test Job", explanation: "A CI gate prevents unverified code from moving further through delivery.", command: "echo \"jobs:\n  test:\n    steps:\n      - run: npm test\" > ci-test.yml", output: "Wrote ci-test.yml." },
          { title: "Inspect Pipeline", explanation: "Pipeline YAML should make the verification path obvious to reviewers.", command: "cat ci-test.yml", output: "jobs:\n  test:\n    steps:\n      - run: npm test" }
        ]
      }),
      makeQuest({
        id: "gha_artifact_secret",
        title: "Artifacts and Secrets in Pipelines",
        difficulty: "Advanced",
        objective: "Model artifact publication and secret usage boundaries.",
        commands: [
          { title: "Write Artifact Step", explanation: "Artifacts move build output between jobs and into release systems.", command: "echo \"upload-artifact: dist/\" > artifact.yml", output: "Wrote artifact.yml." },
          { title: "Write Secret Reference", explanation: "Pipelines should reference secrets through the platform secret store, not hardcoded text.", command: "echo \"TOKEN: \\${{ secrets.DEPLOY_TOKEN }}\" > secret-ref.yml", output: "Wrote secret-ref.yml." }
        ]
      })
    ],
    quiz: moduleQuiz("CI/CD")
  },
  10: {
    quests: [
      makeQuest({
        id: "prometheus_alert_rule",
        title: "Create a Prometheus Alert Rule",
        difficulty: "Intermediate",
        objective: "Model an alert for high error rate.",
        commands: [
          { title: "Write Alert Rule", explanation: "Alerts turn metrics into human action. Good alerts point to user impact, not noise.", command: "echo \"alert: HighErrorRate\nexpr: rate(http_500_total[5m]) > 0.05\" > alerts.yml", output: "Wrote alerts.yml." },
          { title: "Review Rule", explanation: "The expression should be specific enough to avoid alert fatigue.", command: "cat alerts.yml", output: "alert: HighErrorRate\nexpr: rate(http_500_total[5m]) > 0.05" }
        ]
      }),
      makeQuest({
        id: "slo_error_budget",
        title: "Calculate an SLO Error Budget",
        difficulty: "Advanced",
        objective: "Practice the reliability math behind SRE decisions.",
        commands: [
          { title: "Define SLO", explanation: "A 99.9 percent SLO allows 0.1 percent bad requests in the measurement window.", command: "echo \"requests=100000 errors=60 slo=99.9\" > slo.txt", output: "Wrote slo.txt." },
          { title: "Evaluate Budget", explanation: "Error budget thinking connects reliability targets to release velocity.", command: "cat slo.txt", output: "requests=100000 errors=60 slo=99.9\nbudget remaining: 40 errors" }
        ]
      })
    ],
    quiz: moduleQuiz("monitoring and observability")
  },
  11: {
    quests: [
      makeQuest({
        id: "cloud_iam_policy",
        title: "Write Least-Privilege IAM Policy",
        difficulty: "Intermediate",
        objective: "Model a narrow cloud permissions policy.",
        commands: [
          { title: "Create Policy", explanation: "Least privilege grants only the actions needed for a workload.", command: "echo \"Allow s3:GetObject on arn:aws:s3:::demo-bucket/*\" > iam.policy", output: "Wrote iam.policy." },
          { title: "Review Policy", explanation: "Reviewing scope prevents broad admin permissions from becoming the default.", command: "cat iam.policy", output: "Allow s3:GetObject on arn:aws:s3:::demo-bucket/*" }
        ]
      }),
      makeQuest({
        id: "cloud_network_plan",
        title: "Plan VPC Subnets and Security Groups",
        difficulty: "Intermediate",
        objective: "Model cloud network segmentation.",
        commands: [
          { title: "Write Network Plan", explanation: "Cloud networks separate public entry points from private application and data layers.", command: "echo \"public:10.0.1.0/24 private:10.0.2.0/24\" > vpc.plan", output: "Wrote vpc.plan." },
          { title: "Review Network Plan", explanation: "CIDR review catches overlaps and accidental exposure early.", command: "cat vpc.plan", output: "public:10.0.1.0/24 private:10.0.2.0/24" }
        ]
      })
    ],
    quiz: moduleQuiz("cloud")
  },
  12: {
    quests: [
      makeQuest({
        id: "testing_release_checklist",
        title: "Create Test and Release Checklist",
        difficulty: "Beginner",
        objective: "Model a repeatable release readiness checklist.",
        commands: [
          { title: "Write Checklist", explanation: "Release checklists reduce cognitive load and prevent repeated operational misses.", command: "echo \"tests pass\nrollback ready\nalerts enabled\" > release.checklist", output: "Wrote release.checklist." },
          { title: "Review Checklist", explanation: "A checklist is useful only when it is specific and observable.", command: "cat release.checklist", output: "tests pass\nrollback ready\nalerts enabled" }
        ]
      }),
      makeQuest({
        id: "incident_postmortem",
        title: "Write a Blameless Postmortem Skeleton",
        difficulty: "Intermediate",
        objective: "Practice incident learning documentation.",
        commands: [
          { title: "Create Postmortem", explanation: "Blameless postmortems focus on system improvement, not individual blame.", command: "echo \"impact:\ntimeline:\nroot cause:\nactions:\" > postmortem.md", output: "Wrote postmortem.md." },
          { title: "Review Sections", explanation: "Good action items are owned, measurable, and connected to the contributing factors.", command: "cat postmortem.md", output: "impact:\ntimeline:\nroot cause:\nactions:" }
        ]
      })
    ],
    quiz: moduleQuiz("software engineering practices")
  }
};

export const expandRoadmapModules = (modules: ModuleData[]): ModuleData[] => (
  modules.map(module => {
    const extra = additions[module.id];
    if (!extra) return module;

    return {
      ...module,
      quests: [...module.quests, ...extra.quests],
      quiz: module.quiz || extra.quiz
    };
  })
);
