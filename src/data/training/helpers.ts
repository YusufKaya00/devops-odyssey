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
    commandFlags?: Array<{ flag: string; description: string }>;
    realWorldContext?: string;
    bestPractices?: string[];
    warnings?: string[];
  }>;
  localValidatorKey?: string;
  hint?: string;
  conceptSummary?: string;
  learningObjectives?: string[];
  architectureDiagram?: string;
  realWorldScenario?: string;
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
      ? `Browser command practice. Legacy local validator '${input.localValidatorKey}' is a reference only, not verification of this scenario.`
      : 'Browser command practice with simulated output; no local execution is verified.',
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
      commonMistakes: step.commonMistakes,
      commandFlags: step.commandFlags,
      realWorldContext: step.realWorldContext,
      bestPractices: step.bestPractices,
      warnings: step.warnings
    })),
    conceptSummary: input.conceptSummary,
    learningObjectives: input.learningObjectives,
    architectureDiagram: input.architectureDiagram,
    realWorldScenario: input.realWorldScenario
  };
}

export function createConceptQuiz(
  topic: string,
  questions: ScenarioQuizQuestion[]
): ScenarioQuizQuestion[] {
  return questions.map((question, index) => {
    const optionCount = question.options.length;
    const validAnswer = Number.isInteger(question.answerIndex)
      && question.answerIndex >= 0 && question.answerIndex < optionCount;
    // Rotate to a stable slot; leave invalid indices visible to the integrity check.
    const answerIndex = validAnswer ? index % optionCount : question.answerIndex;
    const offset = validAnswer ? (question.answerIndex - answerIndex + optionCount) % optionCount : 0;

    return {
      ...question,
      options: [...question.options.slice(offset), ...question.options.slice(0, offset)],
      answerIndex,
      explanation: `${topic}: ${question.explanation}`
    };
  });
}

export function createModule(input: ScenarioModule): ScenarioModule {
  return input;
}

