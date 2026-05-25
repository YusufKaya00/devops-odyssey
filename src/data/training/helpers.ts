import type {
  QuestDifficulty,
  ScenarioModule,
  ScenarioQuest,
  ScenarioQuizQuestion,
  ScenarioTier
} from './types';

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
    commonMistakes?: Array<{
      commandPattern: string;
      feedback: string;
    }>;
  }>;
  localValidatorKey?: string;
  hint?: string;
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
      : 'Browser simulation validates this scenario.',
    validatorKey: input.id,
    localValidatorKey: input.localValidatorKey,
    hint: input.hint || 'Read the objective, run the command, inspect output, and explain what changed.',
    interactiveSteps: input.commands.map(step => ({
      title: step.title,
      explanation: step.explanation,
      expectedCommand: step.command,
      acceptedCommands: step.acceptedCommands,
      hint: step.hint || `Type: ${step.command}`,
      mockOutput: step.output,
      commonMistakes: step.commonMistakes
    }))
  };
}

export function createConceptQuiz(
  topic: string,
  questions: ScenarioQuizQuestion[]
): ScenarioQuizQuestion[] {
  return questions.map(question => ({
    ...question,
    explanation: `${topic}: ${question.explanation}`
  }));
}

export function createModule(input: ScenarioModule): ScenarioModule {
  return input;
}

