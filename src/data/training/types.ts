export type ScenarioTier = "Foundation" | "Operator" | "Senior" | "Capstone";
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

export interface ResourceLink {
  name: string;
  url: string;
  free: boolean;
}

export interface ScenarioModule {
  id: number;
  title: string;
  icon: string;
  description: string;
  detailedInfo: string;
  outcomes: string[];
  resources: ResourceLink[];
  quests: ScenarioQuest[];
  quiz: ScenarioQuizQuestion[];
}

