import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import LightningFS from '@isomorphic-git/lightning-fs';
import { GitLab } from '../src/simulation/gitEngine.ts';
import { gitGoals, README } from '../src/simulation/gitGoals.ts';
import { commandsMatch } from '../src/simulation/commands.ts';
import { gitDeepDiveQuests } from '../src/data/gitTraining.ts';

async function lab(id = 'git_init') {
  const fs = new LightningFS(`test-${crypto.randomUUID()}`);
  const instance = new GitLab(fs, id);
  await instance.initialize();
  return instance;
}

async function ok(instance, command) {
  const result = await instance.run(command);
  assert.equal(result.exitCode, 0, `${command}: ${result.output}`);
  return result;
}

test('shell comparison preserves path case and whitespace inside data', () => {
  assert.equal(commandsMatch('git   add "README.md"', "git add 'README.md'"), true);
  assert.equal(commandsMatch('git add readme.md', 'git add README.md'), false);
  assert.equal(commandsMatch('echo "a  b" > a.txt', 'echo "a b" > a.txt'), false);
  assert.equal(commandsMatch('echo $UNKNOWN', 'echo $?'), false);
  assert.equal(commandsMatch('echo "$HOME"', "echo '$HOME'"), false);
});

test('failed commands do not initialize a repository or complete a goal', async () => {
  const instance = await lab();
  const result = await instance.run('git status');
  assert.equal(result.exitCode, 1);
  assert.equal(await instance.satisfies(gitGoals.git_init[1], result), false);
  assert.equal((await instance.snapshot()).initialized, false);
  assert.equal((await instance.run('git init --unsupported')).exitCode, 1);
});

test('commit records the staged snapshot, leaving later edits unstaged', async () => {
  const instance = await lab();
  await ok(instance, 'git init');
  assert.equal((await instance.run('git commit -m "premature"')).exitCode, 1);
  await ok(instance, 'git add README.md');
  await ok(instance, 'echo changed > README.md');
  const result = await ok(instance, 'git commit -m "Any meaningful message"');
  assert.equal(await instance.satisfies(gitGoals.git_init[3], result), true);
  assert.equal((await ok(instance, 'git show HEAD:README.md')).output, README);
  assert.equal(await instance.readFile('README.md'), 'changed\n');
  assert.match((await ok(instance, 'git status')).output, /unstaged\s+README.md/);
  assert.equal((await instance.snapshot()).files.some(file => file.path.startsWith('.git/')), false);
  assert.match((await ok(instance, 'git diff')).output, /\+changed/);
});

test('untracked files are absent from diff, then appear in staged diff', async () => {
  const instance = await lab('git_status_diff');
  await ok(instance, 'echo PORT=8080 > app.conf');
  assert.equal((await ok(instance, 'git diff')).output, '');
  assert.match((await ok(instance, 'git status')).output, /untracked\s+app.conf/);
  assert.equal((await instance.run('git add APP.CONF')).exitCode, 1);
  await ok(instance, 'git add .');
  assert.match((await ok(instance, 'git diff --cached')).output, /\+PORT=8080/);
});

test('Git -a does not include untracked files; ignored secrets are excluded by add dot', async () => {
  const instance = await lab('git_ignore');
  await ok(instance, 'echo API_TOKEN=local-only > .env');
  await ok(instance, "printf '%s\\n' .env '*.log' dist/ > .gitignore");
  assert.equal((await instance.run('git commit -am "No tracked changes"')).exitCode, 1);
  assert.equal((await instance.run('git add .env')).exitCode, 1);
  const added = await ok(instance, 'git add .');
  assert.equal(await instance.satisfies(gitGoals.git_ignore[3], added), true);
  await ok(instance, 'git commit -m "Ignore local credentials"');
  assert.doesNotMatch((await ok(instance, 'git ls-files')).output, /^\.env$/m);
  assert.match((await ok(instance, 'git status --ignored')).output, /ignored\s+\.env/);
});

test('all five lab scripts reach each goal, including actual conflict and two-parent merge', async () => {
  for (const [id, goals] of Object.entries(gitGoals)) {
    const instance = await lab(id);
    const quest = gitDeepDiveQuests.find(quest => quest.validatorKey === id);
    assert.equal(goals.length, quest.interactiveSteps.length, id);
    for (const [index, step] of quest.interactiveSteps.entries()) {
      const result = await instance.run(step.expectedCommand);
      assert.equal(await instance.satisfies(goals[index], result), true, `${id}:${index} ${result.output}`);
      if (goals[index].kind === 'conflict') {
        assert.equal(result.exitCode, 1);
        assert.match(await instance.readFile('app.conf'), /<<<<<<<|=======|>>>>>>>/);
        assert.equal((await instance.run('git commit -m "Still conflicted"')).exitCode, 1);
        assert.equal((await instance.run('git add app.conf')).exitCode, 1);
      }
    }
    if (id === 'git_conflict') assert.equal((await instance.snapshot()).commits[0].parents.length, 2);
  }
});

test('switch updates working files and blocks overwriting local modifications', async () => {
  const instance = await lab('git_branch');
  await ok(instance, 'git switch -c feature');
  await ok(instance, 'echo feature > README.md');
  await ok(instance, 'git commit -am "Feature"');
  await ok(instance, 'git switch main');
  assert.equal(await instance.readFile('README.md'), README);
  await ok(instance, 'echo local > README.md');
  assert.equal((await instance.run('git switch feature')).exitCode, 1);
  assert.equal(await instance.readFile('README.md'), 'local\n');
});

test('restoring a saved lab preserves the index and does not replay completed steps', async () => {
  const instance = await lab();
  await ok(instance, 'git init');
  await ok(instance, 'git add README.md');
  await ok(instance, 'echo pending > README.md');
  const reopened = new GitLab(instance.fs, 'git_init');
  await reopened.initialize();
  assert.equal(await reopened.readFile('README.md'), 'pending\n');
  await ok(reopened, 'git commit -m "Resumed"');
  assert.equal((await ok(reopened, 'git show HEAD:README.md')).output, README);
  await reopened.reset();
  assert.equal((await reopened.snapshot()).initialized, false);
  assert.equal(await reopened.readFile('README.md'), README);
});

test('unsupported commands and escaping paths are errors, not successful operations', async () => {
  const instance = await lab('git_branch');
  for (const command of ['git nonsense', 'echo hacked > ../outside.txt', 'echo broken > .git/HEAD', 'git status && git branch', 'git status --made-up']) {
    assert.equal((await instance.run(command)).exitCode, 1, command);
  }
  assert.equal((await instance.snapshot()).branch, 'main');
  assert.equal((await ok(instance, 'echo $?')).output, '1\n');
  assert.equal((await ok(instance, 'echo $?')).output, '0\n');
});

test('add dot stages tracked deletions and restore staged keeps the working file', async () => {
  const instance = await lab('git_branch');
  await ok(instance, 'rm README.md');
  await ok(instance, 'git add .');
  assert.match((await ok(instance, 'git diff --staged')).output, /-# DevOps Sandbox/);
  await ok(instance, 'git restore --staged README.md');
  assert.match((await ok(instance, 'git status')).output, /unstaged/);
  await ok(instance, 'git restore README.md');
  assert.equal(await instance.readFile('README.md'), README);
});

test('log all shows children before their parents even with same-second commits', async () => {
  const instance = await lab('git_branch');
  await ok(instance, 'git switch -c z-feature');
  await ok(instance, 'echo feature > README.md');
  await ok(instance, 'git commit -am "New child"');
  await ok(instance, 'git switch main');
  const log = (await ok(instance, 'git log --all --oneline --graph')).output;
  assert.ok(log.indexOf('New child') < log.indexOf('Initial lab snapshot'));
});
