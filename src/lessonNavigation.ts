interface LessonProgress {
  completedQuests: string[];
  completedSteps?: string[];
  experiencePoints: number;
  stepNotes?: Record<string, string>;
}

export function getLessonNavigation(
  questKey: string,
  stepCount: number,
  progress: LessonProgress,
  selectedIndex: number | null = null,
) {
  const completed = new Set(progress.completedSteps || []);
  const isQuestComplete = progress.completedQuests.includes(questKey);
  const stepCompleted = Array.from({ length: stepCount }, (_, index) =>
    isQuestComplete || completed.has(`${questKey}:${index}`),
  );
  const firstIncomplete = stepCompleted.indexOf(false);
  const requestedIndex = selectedIndex ?? (firstIncomplete < 0 ? 0 : firstIncomplete);
  const activeStepIndex = stepCount === 0 ? null : Math.max(0, Math.min(
    Number.isFinite(requestedIndex) ? Math.trunc(requestedIndex) : 0,
    stepCount - 1,
  ));

  return {
    activeStepIndex,
    stepCompleted,
    completedCount: stepCompleted.filter(Boolean).length,
    allStepsComplete: stepCount > 0 && stepCompleted.every(Boolean),
    noteKey: activeStepIndex === null ? null : `${questKey}:${activeStepIndex}`,
    canGoPrevious: activeStepIndex !== null && activeStepIndex > 0,
    canGoNext: activeStepIndex !== null && activeStepIndex < stepCount - 1,
  };
}

export function completeLessonStep<T extends LessonProgress>(
  progress: T,
  questKey: string,
  stepCount: number,
  stepIndex: number,
): T {
  const stepKey = `${questKey}:${stepIndex}`;
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= stepCount ||
      progress.completedQuests.includes(questKey) || progress.completedSteps?.includes(stepKey)) {
    return progress;
  }
  return {
    ...progress,
    completedSteps: [...(progress.completedSteps || []), stepKey],
    experiencePoints: progress.experiencePoints + 20,
  };
}

// An older server response must not replace newer local commands or note drafts.
export function mergeLessonProgress<T extends LessonProgress>(current: T, incoming: T): T {
  return {
    ...current,
    ...incoming,
    completedQuests: [...new Set([...incoming.completedQuests, ...current.completedQuests])],
    completedSteps: [...new Set([...(incoming.completedSteps || []), ...(current.completedSteps || [])])],
    experiencePoints: Math.max(current.experiencePoints, incoming.experiencePoints),
    stepNotes: { ...incoming.stepNotes, ...current.stepNotes },
  };
}
