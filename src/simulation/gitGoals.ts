export type GitGoal =
  | { kind: 'initialized' }
  | { kind: 'inspect'; command: string; flags?: string[] }
  | { kind: 'file' | 'staged' | 'commit'; path: string; content: string; branch?: string; merge?: boolean; absent?: string[] }
  | { kind: 'branch'; branch: string }
  | { kind: 'merged'; branch: string; path: string; content: string }
  | { kind: 'conflict'; path: string };

export const README = '# DevOps Sandbox\nPractice Git without changing your computer files.\n';
const config = 'PORT=8080\n';
const feature = 'DevOps Quest Complete!\n';
const ignore = '.env\n*.log\ndist/\n';

export const gitGoals: Record<string, GitGoal[]> = {
  git_init: [
    { kind: 'initialized' },
    { kind: 'inspect', command: 'status' },
    { kind: 'staged', path: 'README.md', content: README },
    { kind: 'commit', path: 'README.md', content: README, branch: 'main' },
    { kind: 'inspect', command: 'log', flags: ['--oneline', '--decorate'] },
  ],
  git_status_diff: [
    { kind: 'file', path: 'app.conf', content: config },
    { kind: 'inspect', command: 'diff' },
    { kind: 'staged', path: 'app.conf', content: config },
    { kind: 'inspect', command: 'diff', flags: ['--staged'] },
    { kind: 'commit', path: 'app.conf', content: config, branch: 'main' },
  ],
  git_ignore: [
    { kind: 'file', path: '.env', content: 'API_TOKEN=local-only\n' },
    { kind: 'file', path: '.gitignore', content: ignore },
    { kind: 'inspect', command: 'status', flags: ['--ignored'] },
    { kind: 'staged', path: '.gitignore', content: ignore, absent: ['.env'] },
    { kind: 'commit', path: '.gitignore', content: ignore, absent: ['.env'] },
  ],
  git_branch: [
    { kind: 'branch', branch: 'feature-devops' },
    { kind: 'file', path: 'quest.txt', content: feature, branch: 'feature-devops' },
    { kind: 'staged', path: 'quest.txt', content: feature, branch: 'feature-devops' },
    { kind: 'commit', path: 'quest.txt', content: feature, branch: 'feature-devops' },
    { kind: 'branch', branch: 'main' },
    { kind: 'merged', branch: 'feature-devops', path: 'quest.txt', content: feature },
    { kind: 'inspect', command: 'log', flags: ['--oneline', '--graph', '--decorate', '--all'] },
  ],
  git_conflict: [
    { kind: 'branch', branch: 'blue-deploy' },
    { kind: 'file', path: 'app.conf', content: 'PORT=8081\n', branch: 'blue-deploy' },
    { kind: 'commit', path: 'app.conf', content: 'PORT=8081\n', branch: 'blue-deploy' },
    { kind: 'branch', branch: 'main' },
    { kind: 'file', path: 'app.conf', content: 'PORT=8082\n', branch: 'main' },
    { kind: 'commit', path: 'app.conf', content: 'PORT=8082\n', branch: 'main' },
    { kind: 'conflict', path: 'app.conf' },
    { kind: 'file', path: 'app.conf', content: config, branch: 'main' },
    { kind: 'staged', path: 'app.conf', content: config },
    { kind: 'commit', path: 'app.conf', content: config, branch: 'main', merge: true },
  ],
};

export function hasStatefulGitLab(questId: string) {
  return Object.hasOwn(gitGoals, questId);
}
