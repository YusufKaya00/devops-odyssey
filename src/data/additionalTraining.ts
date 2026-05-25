import type { ModuleData, ModuleQuizQuestion, Quest } from './roadmapData';
import { linuxModule } from './training/linux';
import { programmingModule } from './training/programming';
import { networkingModule } from './training/networking';
import { serverManagementModule } from './training/serverManagement';
import { containersModule } from './training/containers';
import { kubernetesModule } from './training/kubernetes';
import { iacModule } from './training/iac';
import { cicdModule } from './training/cicd';
import { observabilityModule } from './training/observability';

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
    quests: linuxModule.quests,
    quiz: linuxModule.quiz
  },
  4: {
    quests: networkingModule.quests,
    quiz: networkingModule.quiz
  },
  5: {
    quests: serverManagementModule.quests,
    quiz: serverManagementModule.quiz
  },
  6: {
    quests: containersModule.quests,
    quiz: containersModule.quiz
  },
  7: {
    quests: kubernetesModule.quests,
    quiz: kubernetesModule.quiz
  },
  8: {
    quests: iacModule.quests,
    quiz: iacModule.quiz
  },
  9: {
    quests: cicdModule.quests,
    quiz: cicdModule.quiz
  },
  10: {
    quests: observabilityModule.quests,
    quiz: observabilityModule.quiz
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
