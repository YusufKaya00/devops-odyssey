import { gitDeepDiveQuests, gitModuleQuiz } from '../gitTraining';
import { createModule } from './helpers';

export const gitModule = createModule({
  id: 1,
  title: 'Git & Version Control',
  icon: 'git-branch',
  description: 'Master Git for code, infrastructure, collaboration, release recovery, and auditability.',
  detailedInfo: 'Git is the source of truth for application code, infrastructure code, pipeline definitions, and release history.',
  outcomes: [
    'Explain working tree, index, commits, refs, remotes, and reflog.',
    'Resolve conflicts and recover lost commits.',
    'Use branches, tags, hooks, worktrees, and safe undo workflows.'
  ],
  resources: [
    { name: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2', free: true },
    { name: 'Learn Git Branching', url: 'https://learngitbranching.js.org/', free: true }
  ],
  quests: gitDeepDiveQuests.map(quest => ({
    ...quest,
    tier: quest.difficulty === 'Beginner' ? 'Foundation' : quest.difficulty === 'Intermediate' ? 'Operator' : 'Senior',
    prerequisites: [],
    skillOutcomes: [quest.objective]
  })),
  quiz: gitModuleQuiz
});

