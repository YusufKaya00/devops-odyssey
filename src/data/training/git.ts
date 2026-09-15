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
  quiz: gitModuleQuiz,
  keyConcepts: [
    { title: "Repository & Working Tree", description: "Git tracks snapshots not diffs. The .git directory holds the entire object database." },
    { title: "Staging Area (Index)", description: "The index is a pre-commit buffer. git add promotes working tree changes into the next snapshot." },
    { title: "Commits & Object IDs", description: "Git identifies objects by hashes of their contents. An object ID helps detect changes; it does not authenticate the author." },
    { title: "Branches & HEAD", description: "A branch is just a pointer to a commit. HEAD tells Git which branch you are on." },
    { title: "Merging & Conflict Resolution", description: "Fast-forward merges move the pointer. Three-way merges create a new merge commit." },
    { title: "Remote Repositories", description: "Remotes are bookmarks to other copies of the repo. fetch downloads, push uploads." },
    { title: "Rebase & History Rewriting", description: "Rebase replays commits on a new base. Never rebase shared/public branches." },
    { title: "Recovery & Reflog", description: "Reflogs record local reference movements. Recovery depends on configurable expiration and whether garbage collection has removed the objects." }
  ],
  commandCheatSheet: [
    { command: "git init", description: "Initialize a new repository in the current directory" },
    { command: "git status", description: "Show working tree and staging area state" },
    { command: "git add <file>", description: "Stage file changes for the next commit", example: "git add README.md" },
    { command: "git commit -m \"msg\"", description: "Create a snapshot of staged changes", example: "git commit -m \"feat: add login\"" },
    { command: "git log --oneline --graph", description: "Compact history with branch graph" },
    { command: "git diff", description: "Compare tracked working-tree changes against the index" },
    { command: "git diff --staged", description: "Show staged changes vs last commit" },
    { command: "git branch <name>", description: "Create a new branch", example: "git branch feature-auth" },
    { command: "git checkout -b <name>", description: "Create and switch to new branch" },
    { command: "git merge <branch>", description: "Merge branch into current branch" },
    { command: "git remote add origin <url>", description: "Link a remote repository" },
    { command: "git push -u origin main", description: "Push and set upstream tracking" },
    { command: "git pull --rebase", description: "Fetch and rebase local commits on top" },
    { command: "git stash push -m \"msg\"", description: "Temporarily shelve work in progress" },
    { command: "git reflog", description: "Show log of all HEAD movements" }
  ],
  learningPath: "This module takes you from zero to confident Git user. You start by creating your first repository, then learn to track changes with status and diff. Next you explore branching, merging, and conflict resolution — the core collaboration workflow. Advanced quests cover undoing mistakes, stashing work, rebasing history, and recovering lost commits. By the end, you will be ready to manage real codebases with tags, hooks, submodules, and worktrees.",
  modulePrerequisites: ["Basic terminal/command line familiarity", "A text editor (VS Code, Vim, or Nano)"]
});

