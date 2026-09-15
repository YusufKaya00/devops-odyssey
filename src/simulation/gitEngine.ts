import * as git from 'isomorphic-git';
import LightningFS from '@isomorphic-git/lightning-fs';
import { Buffer } from 'buffer';
import { createTwoFilesPatch } from 'diff';
import { parseCommand } from './commands.ts';
import { gitGoals, README } from './gitGoals.ts';
import type { GitGoal } from './gitGoals.ts';

export interface CommandResult {
  output: string;
  exitCode: number;
  action: string;
  args: string[];
  conflict?: boolean;
}

interface MergeState { parents: string[]; unresolved: string[] }
export interface RepositorySnapshot {
  branch: string;
  head: string | null;
  initialized: boolean;
  files: { path: string; status: string }[];
  commits: { oid: string; message: string; parents: string[] }[];
  merge: MergeState | null;
}

const author = { name: 'DevOps Student', email: 'student@example.test' };
// isomorphic-git's browser bundle uses the Node-compatible Buffer API.
if (!('Buffer' in globalThis)) Object.assign(globalThis, { Buffer });
const decoder = new TextDecoder();
const missing = (error: unknown) => (error as { code?: string }).code === 'ENOENT';
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

export class GitLab {
  readonly fs: LightningFS;
  readonly dir: string;
  readonly root: string;
  private mergeState: MergeState | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private lastExitCode = 0;

  constructor(fs: LightningFS, questId: string) {
    if (!Object.hasOwn(gitGoals, questId)) throw new Error('Unknown Git lab');
    this.fs = fs;
    this.root = `/labs/${questId}`;
    this.dir = `${this.root}/repo`;
  }

  private get context() { return { fs: this.fs, dir: this.dir }; }

  private async exists(path: string) {
    try { await this.fs.promises.stat(path); return true; }
    catch (error) { if (missing(error)) return false; throw error; }
  }

  private async mkdir(path: string) {
    const parts = path.split('/').filter(Boolean);
    let current = '';
    for (const part of parts) {
      current += `/${part}`;
      if (!await this.exists(current)) {
        try { await this.fs.promises.mkdir(current); }
        catch (error) { if ((error as { code?: string }).code !== 'EEXIST') throw error; }
      }
    }
  }

  async initialize() {
    await this.mkdir(this.dir);
    if (await this.exists(`${this.root}/ready`)) {
      this.mergeState = JSON.parse(await this.fs.promises.readFile(`${this.root}/merge.json`, 'utf8'));
      return;
    }
    await this.fs.promises.writeFile(`${this.dir}/README.md`, README, 'utf8');
    if (!this.root.endsWith('/git_init')) {
      await git.init({ ...this.context, defaultBranch: 'main' });
      await git.add({ ...this.context, filepath: 'README.md' });
      if (this.root.endsWith('/git_conflict')) {
        await this.fs.promises.writeFile(`${this.dir}/app.conf`, 'PORT=8080\n', 'utf8');
        await git.add({ ...this.context, filepath: 'app.conf' });
      }
      await git.commit({ ...this.context, message: 'Initial lab snapshot', author });
    }
    await this.saveMerge();
    await this.fs.promises.writeFile(`${this.root}/ready`, '1', 'utf8');
    await this.fs.promises.flush();
  }

  private async saveMerge() {
    await this.fs.promises.writeFile(`${this.root}/merge.json`, JSON.stringify(this.mergeState), 'utf8');
  }

  private path(input: string, write = false) {
    if (!input || input.startsWith('/') || input.includes('\\')) throw new Error('Use a path relative to this repository.');
    const parts: string[] = [];
    for (const part of input.split('/')) {
      if (part === '..') { if (!parts.length) throw new Error('Path is outside the lab.'); parts.pop(); }
      else if (part && part !== '.') parts.push(part);
    }
    if (write && parts[0] === '.git') throw new Error('Use Git commands to change repository metadata.');
    return parts.join('/') || '.';
  }

  async readFile(path: string): Promise<string | null> {
    try { return await this.fs.promises.readFile(`${this.dir}/${this.path(path)}`, 'utf8'); }
    catch (error) { if (missing(error)) return null; throw error; }
  }

  private async files(dir = this.dir, prefix = ''): Promise<string[]> {
    const result: string[] = [];
    for (const name of (await this.fs.promises.readdir(dir)).sort()) {
      if (name === '.git') continue;
      const stat = await this.fs.promises.stat(`${dir}/${name}`);
      if (stat.isDirectory()) result.push(...await this.files(`${dir}/${name}`, `${prefix}${name}/`));
      else result.push(`${prefix}${name}`);
    }
    return result;
  }

  private async head() {
    if (!await this.exists(`${this.dir}/.git/HEAD`)) return null;
    try { return await git.resolveRef({ ...this.context, ref: 'HEAD' }); }
    catch (error) { if ((error as { code?: string }).code === 'NotFoundError') return null; throw error; }
  }

  async snapshot(): Promise<RepositorySnapshot> {
    const initialized = await this.exists(`${this.dir}/.git/HEAD`);
    const head = await this.head();
    const branch = initialized ? await git.currentBranch(this.context) || '(detached)' : 'no-git';
    const files: RepositorySnapshot['files'] = [];
    if (initialized) {
      for (const [path, h, w, s] of await git.statusMatrix({ ...this.context, ignored: true, filter: path => path !== '.git' && !path.startsWith('.git/') })) {
        let status = h === 0 && s === 0 ? 'untracked' : h === s && w === s ? 'clean' : h !== s ? (w !== s ? 'staged + unstaged' : 'staged') : 'unstaged';
        if (h === 0 && s === 0 && await git.isIgnored({ ...this.context, filepath: path })) status = 'ignored';
        if (this.mergeState?.unresolved.includes(path)) status = 'conflict';
        files.push({ path, status });
      }
    } else {
      files.push(...(await this.files()).map(path => ({ path, status: 'untracked' })));
    }
    const commits = head ? (await git.log({ ...this.context, depth: 12 })).map(({ oid, commit }) => ({ oid, message: commit.message.trim(), parents: commit.parent })) : [];
    return { initialized, branch, head, files, commits, merge: this.mergeState };
  }

  private async blob(path: string, stage: boolean) {
    const trees = stage ? [git.STAGE()] : [git.TREE({ ref: 'HEAD' })];
    if (!stage && !await this.head()) return null;
    let content: string | null = null;
    await git.walk({ ...this.context, trees, map: async (filepath, [entry]) => {
      if (filepath === path && entry && await entry.type() === 'blob') {
        const oid = await entry.oid();
        if (oid) content = decoder.decode((await git.readBlob({ ...this.context, oid })).blob);
      }
    } });
    return content;
  }

  private async diff(staged: boolean) {
    const patches: string[] = [];
    for (const [path, h, w, s] of await git.statusMatrix(this.context)) {
      if (staged ? h === s : s === 0 || w === s) continue;
      const before = await this.blob(path, !staged) || '';
      const after = staged ? await this.blob(path, true) || '' : await this.readFile(path) || '';
      if (before !== after) patches.push(createTwoFilesPatch(`a/${path}`, `b/${path}`, before, after));
    }
    return patches.join('\n');
  }

  // Serialize commands so rapid Enter presses cannot race index writes or commits.
  run(command: string): Promise<CommandResult> {
    const pending = this.queue.then(() => this.execute(command));
    this.queue = pending.catch(() => undefined);
    return pending;
  }

  private async execute(command: string): Promise<CommandResult> {
    let args: string[] = [];
    let action = '';
    try {
      if (command.length > 16384) throw new Error('Command exceeds the lab limit of 16,384 characters.');
      const tokens = parseCommand(command, { '?': String(this.lastExitCode) });
      const redirect = tokens.findIndex(token => typeof token === 'object' && 'op' in token && (token.op === '>' || token.op === '>>'));
      const words = redirect === -1 ? tokens : tokens.slice(0, redirect);
      if (words.some(word => typeof word !== 'string')) throw new Error('Run one command at a time; pipes and shell expansion are not supported in this lab.');
      args = words as string[];
      action = args[0] === 'git' ? `git ${args[1] || ''}` : args[0] || '';
      const output = await this.dispatch(args, redirect === -1 ? undefined : tokens.slice(redirect));
      await this.saveMerge();
      await this.fs.promises.flush();
      this.lastExitCode = 0;
      return { output, exitCode: 0, action, args };
    } catch (error) {
      await this.saveMerge();
      await this.fs.promises.flush();
      this.lastExitCode = 1;
      return { output: errorMessage(error), exitCode: 1, action, args, conflict: error instanceof git.Errors.MergeConflictError };
    }
  }

  private async dispatch(args: string[], redirect?: ReturnType<typeof parseCommand>) {
    const [cmd, ...rest] = args;
    if (redirect && cmd !== 'echo' && cmd !== 'printf') throw new Error('Redirection is supported for echo and printf.');
    if (cmd === 'help') return 'Git: init, status, add, commit, diff, log, show, branch, switch, checkout, merge, restore, rm, ls-files\nFiles: ls, cat, echo, printf, touch, mkdir, rm, pwd\nEach lab has its own saved repository. Unsupported commands return an error.';
    if (cmd === 'pwd') return '/devops-sandbox';
    if (cmd === 'ls') {
      if (rest.some(arg => !['-a', '-l', '-la', '-al', '.'].includes(arg))) throw new Error('Supported: ls, ls -a, ls -l');
      return ((await this.exists(`${this.dir}/.git`)) && rest.some(arg => arg.includes('a')) ? ['.git/', ...await this.files()] : await this.files()).join('\n');
    }
    if (cmd === 'cat') {
      if (!rest.length) throw new Error('Usage: cat <file>');
      const contents: string[] = [];
      for (const file of rest) { const text = await this.readFile(file); if (text === null) throw new Error(`cat: ${file}: No such file`); contents.push(text); }
      return contents.join('');
    }
    if (cmd === 'echo' || cmd === 'printf') {
      let content: string;
      if (cmd === 'printf') {
        if (rest[0] !== '%s\\n' || rest.length < 2) throw new Error("Supported: printf '%s\\n' <values> > <file>");
        content = rest.slice(1).map(value => `${value}\n`).join('');
      } else {
        const options = rest[0] === '-n' || rest[0] === '-e' ? rest.shift() : undefined;
        content = rest.join(' ') + (options === '-n' ? '' : '\n');
        if (options === '-e') content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      }
      if (!redirect) return content;
      if (redirect.length !== 2 || typeof redirect[1] !== 'string') throw new Error('Use one output file after > or >>.');
      const path = this.path(redirect[1], true);
      const op = redirect[0] as { op: string };
      const old = op.op === '>>' ? await this.readFile(path) || '' : '';
      await this.fs.promises.writeFile(`${this.dir}/${path}`, old + content, 'utf8');
      return '';
    }
    if (cmd === 'mkdir' || cmd === 'touch' || cmd === 'rm') {
      if (!rest.length || rest.some(arg => arg.startsWith('-'))) throw new Error(`Usage: ${cmd} <path>`);
      for (const file of rest) {
        const path = this.path(file, true);
        if (cmd === 'mkdir') await this.fs.promises.mkdir(`${this.dir}/${path}`);
        else if (cmd === 'touch') { if (!await this.exists(`${this.dir}/${path}`)) await this.fs.promises.writeFile(`${this.dir}/${path}`, '', 'utf8'); }
        else await this.fs.promises.unlink(`${this.dir}/${path}`);
      }
      return '';
    }
    if (cmd !== 'git') throw new Error(`${cmd || 'empty command'}: not supported in this Git lab. Type help.`);
    const [sub, ...options] = rest;
    const only = (allowed: string[]) => { if (options.some(opt => !allowed.includes(opt))) throw new Error(`Unsupported git ${sub} option. Supported: ${allowed.join(', ') || '(no arguments)'}`); };
    if (sub === 'init') { only([]); await git.init({ ...this.context, defaultBranch: 'main' }); return 'Initialized Git repository in /devops-sandbox/.git/'; }
    if (!await this.exists(`${this.dir}/.git/HEAD`)) throw new Error('fatal: not a git repository. Run git init first.');
    if (sub === 'status') {
      only(['--short', '-s', '--ignored']);
      const state = await this.snapshot();
      const changes = state.files.filter(file => file.status !== 'clean' && (options.includes('--ignored') || file.status !== 'ignored'));
      return `On branch ${state.branch}\n${state.head ? '' : 'No commits yet\n'}${state.merge ? 'Merge in progress\n' : ''}\n${changes.length ? changes.map(file => `${file.status.padEnd(19)} ${file.path}`).join('\n') : 'nothing to commit, working tree clean'}`;
    }
    if (sub === 'ls-files') { only([]); return (await git.listFiles(this.context)).join('\n'); }
    if (sub === 'add') {
      if (!options.length || options.some(opt => opt.startsWith('-'))) throw new Error('Usage: git add <file...> or git add .');
      for (const file of options) {
        const path = this.path(file, true);
        const resolved = this.mergeState ? this.mergeState.unresolved.filter(target => path === '.' || target === path || target.startsWith(`${path}/`)) : [];
        for (const target of resolved) {
          if (/^(<{7}|={7}|>{7})/m.test(await this.readFile(target) || '')) throw new Error(`Conflict markers remain in ${target}. Resolve them before staging.`);
        }
        if (path !== '.' && await git.isIgnored({ ...this.context, filepath: path }) && !(await git.listFiles(this.context)).includes(path)) throw new Error(`Ignored path: ${path}. Keep secrets out of the index.`);
        if (path !== '.' && !await this.exists(`${this.dir}/${path}`)) {
          if (!(await git.listFiles(this.context)).includes(path)) throw new Error(`pathspec '${path}' did not match any files`);
          await git.remove({ ...this.context, filepath: path });
        } else {
          const tracked = await git.listFiles(this.context);
          await git.add({ ...this.context, filepath: path });
          for (const target of tracked) {
            if ((path === '.' || target.startsWith(`${path}/`)) && !await this.exists(`${this.dir}/${target}`)) await git.remove({ ...this.context, filepath: target });
          }
        }
        if (this.mergeState) {
          this.mergeState.unresolved = this.mergeState.unresolved.filter(target => !resolved.includes(target));
        }
      }
      return '';
    }
    if (sub === 'diff') { only(['--staged', '--cached']); return this.diff(options.length > 0); }
    if (sub === 'commit') {
      const all = options.includes('-a') || options.includes('-am');
      const index = options.findIndex(option => option === '-m' || option === '-am');
      if (index < 0 || !options[index + 1]?.trim() || options.some((opt, i) => i !== index + 1 && !['-a', '-am', '-m'].includes(opt))) throw new Error('Usage: git commit [-a] -m "message"');
      if (this.mergeState?.unresolved.length) throw new Error(`Unmerged paths: ${this.mergeState.unresolved.join(', ')}. Resolve and git add each file.`);
      if (all) {
        for (const file of await git.listFiles(this.context)) {
          if (await this.exists(`${this.dir}/${file}`)) await git.add({ ...this.context, filepath: file });
          else await git.remove({ ...this.context, filepath: file });
        }
      }
      const rows = await git.statusMatrix(this.context);
      if (!this.mergeState && !rows.some(([, h, , s]) => h !== s)) throw new Error('nothing to commit: stage changes with git add first');
      const oid = await git.commit({ ...this.context, message: options[index + 1], author, ...(this.mergeState ? { parent: this.mergeState.parents } : {}) });
      this.mergeState = null;
      return `[${await git.currentBranch(this.context)} ${oid.slice(0, 7)}] ${options[index + 1]}`;
    }
    if (sub === 'branch') {
      if (!options.length) { const current = await git.currentBranch(this.context); return (await git.listBranches(this.context)).map(branch => `${branch === current ? '*' : ' '} ${branch}`).join('\n'); }
      if (options.length !== 1 || options[0].startsWith('-')) throw new Error('Usage: git branch [name]');
      await git.branch({ ...this.context, ref: options[0] }); return '';
    }
    if (sub === 'checkout' || sub === 'switch') {
      const create = options[0] === (sub === 'checkout' ? '-b' : '-c');
      const target = options[create ? 1 : 0];
      if (!target || target.startsWith('-') || options.length !== (create ? 2 : 1)) throw new Error(`Usage: git ${sub} [${sub === 'checkout' ? '-b' : '-c'}] <branch>`);
      if (this.mergeState) throw new Error('Finish or abort the current merge before switching branches.');
      if (create) await git.branch({ ...this.context, ref: target });
      await git.checkout({ ...this.context, ref: target });
      return `Switched to branch '${target}'`;
    }
    if (sub === 'merge') {
      if (options[0] === '--abort' && options.length === 1) {
        if (!this.mergeState) throw new Error('There is no merge to abort.');
        await git.checkout({ ...this.context, ref: await git.currentBranch(this.context) || 'main', force: true });
        this.mergeState = null; return 'Merge aborted.';
      }
      if (this.mergeState) throw new Error('Finish or abort the current merge.');
      if (options.length !== 1 || options[0].startsWith('-')) throw new Error('Usage: git merge <branch>');
      if ((await git.statusMatrix(this.context)).some(([, h, w, s]) => h !== s || (h > 0 && w !== s))) throw new Error('Commit or restore tracked changes before merging.');
      const ours = await this.head();
      const theirs = await git.resolveRef({ ...this.context, ref: options[0] });
      try {
        const result = await git.merge({ ...this.context, theirs: options[0], author, abortOnConflict: false });
        await git.checkout({ ...this.context, ref: await git.currentBranch(this.context) || 'main' });
        return result.alreadyMerged ? 'Already up to date.' : result.fastForward ? 'Fast-forward' : 'Merge completed.';
      } catch (error) {
        if (error instanceof git.Errors.MergeConflictError && ours) this.mergeState = { parents: [ours, theirs], unresolved: error.data.filepaths };
        throw error;
      }
    }
    if (sub === 'restore') {
      const staged = options[0] === '--staged';
      const path = options[staged ? 1 : 0];
      if (!path || options.length !== (staged ? 2 : 1) || path.startsWith('-')) throw new Error('Usage: git restore [--staged] <file>');
      const filepath = this.path(path, true);
      if (staged) await git.resetIndex({ ...this.context, filepath });
      else { const content = await this.blob(filepath, true); if (content === null) throw new Error('Path is not in the index.'); await this.fs.promises.writeFile(`${this.dir}/${filepath}`, content, 'utf8'); }
      return '';
    }
    if (sub === 'rm') {
      const cached = options[0] === '--cached';
      const file = options[cached ? 1 : 0];
      if (!file || options.length !== (cached ? 2 : 1) || file.startsWith('-')) throw new Error('Usage: git rm [--cached] <file>');
      const filepath = this.path(file, true);
      if (!(await git.listFiles(this.context)).includes(filepath)) throw new Error(`Path is not tracked: ${filepath}`);
      const staged = await this.blob(filepath, true);
      const worktree = await this.readFile(filepath);
      const committed = await this.blob(filepath, false);
      if (cached ? staged !== committed && staged !== worktree : staged !== committed || staged !== worktree) throw new Error('File has local modifications. Commit or restore it before git rm.');
      await git.remove({ ...this.context, filepath });
      if (!cached) await this.fs.promises.unlink(`${this.dir}/${filepath}`);
      return `rm '${filepath}'`;
    }
    if (sub === 'log') {
      only(['--oneline', '--decorate', '--graph', '--all']);
      if (!await this.head()) throw new Error('Your current branch does not have any commits yet.');
      const branches = await git.listBranches(this.context);
      const refs = await Promise.all(branches.map(async name => ({ name, oid: await git.resolveRef({ ...this.context, ref: name }) })));
      const current = await git.currentBranch(this.context);
      const entries = new Map<string, git.ReadCommitResult>();
      for (const ref of options.includes('--all') ? branches : ['HEAD']) for (const entry of await git.log({ ...this.context, ref, depth: 40 })) entries.set(entry.oid, entry);
      const ordered: git.ReadCommitResult[] = [];
      const childCount = new Map([...entries.keys()].map(oid => [oid, 0]));
      for (const { commit } of entries.values()) for (const parent of commit.parent) if (childCount.has(parent)) childCount.set(parent, childCount.get(parent)! + 1);
      const pending = [...entries.values()].filter(entry => childCount.get(entry.oid) === 0);
      while (pending.length) {
        const entry = pending.shift()!;
        ordered.push(entry);
        for (const parent of entry.commit.parent) {
          if (!childCount.has(parent)) continue;
          childCount.set(parent, childCount.get(parent)! - 1);
          if (childCount.get(parent) === 0) pending.push(entries.get(parent)!);
        }
      }
      return ordered.map(({ oid, commit }) => {
        const labels = options.includes('--decorate') ? refs.filter(ref => ref.oid === oid).map(ref => ref.name === current ? `HEAD -> ${ref.name}` : ref.name) : [];
        // Parent IDs keep topology explicit even when several branches diverge.
        const graph = options.includes('--graph') ? `* ${oid.slice(0, 7)} <- [${commit.parent.map(parent => parent.slice(0, 7)).join(', ')}] ` : '';
        return `${graph}${options.includes('--oneline') ? oid.slice(0, 7) : `commit ${oid}`} ${labels.length ? `(${labels.join(', ')}) ` : ''}${commit.message.trim()}`;
      }).join('\n');
    }
    if (sub === 'show') {
      if (options.length !== 1 || !options[0].startsWith('HEAD:')) throw new Error('Supported: git show HEAD:<file>');
      const content = await this.blob(this.path(options[0].slice(5)), false);
      if (content === null) throw new Error('Path does not exist in HEAD.');
      return content;
    }
    throw new Error(`git ${sub}: not supported in this lab. Type help for available commands.`);
  }

  async satisfies(goal: GitGoal, result: CommandResult): Promise<boolean> {
    if (goal.kind === 'conflict') return result.conflict === true && !!this.mergeState?.unresolved.includes(goal.path);
    if (result.exitCode !== 0) return false;
    const state = await this.snapshot();
    if (goal.kind === 'initialized') return result.action === 'git init' && state.initialized;
    if (goal.kind === 'inspect') {
      const flags = result.args.map(arg => arg === '--cached' ? '--staged' : arg);
      return result.action === `git ${goal.command}` && (goal.flags || []).every(flag => flags.includes(flag)) && !(goal.command === 'diff' && !goal.flags && flags.includes('--staged'));
    }
    if (goal.kind === 'branch') return ['git checkout', 'git switch'].includes(result.action) && state.branch === goal.branch;
    if (goal.kind === 'merged') {
      return result.action === 'git merge' && state.branch === 'main' && state.head === await git.resolveRef({ ...this.context, ref: goal.branch }) && await this.blob(goal.path, false) === goal.content;
    }
    if (goal.branch && goal.branch !== state.branch) return false;
    const contents = goal.kind === 'file' ? await this.readFile(goal.path) : await this.blob(goal.path, goal.kind === 'staged');
    if (contents !== goal.content) return false;
    if (goal.absent) for (const path of goal.absent) if (await this.blob(path, goal.kind === 'staged') !== null) return false;
    if (goal.kind === 'staged') return result.action === 'git add' && !state.merge?.unresolved.includes(goal.path);
    if (goal.kind === 'commit') return result.action === 'git commit' && (!goal.merge || state.commits[0]?.parents.length === 2);
    return ['echo', 'printf'].includes(result.action);
  }

  async reset() {
    await this.queue;
    const remove = async (path: string): Promise<void> => {
      if ((await this.fs.promises.stat(path)).isDirectory()) {
        for (const name of await this.fs.promises.readdir(path)) await remove(`${path}/${name}`);
        await this.fs.promises.rmdir(path);
      } else await this.fs.promises.unlink(path);
    };
    await remove(this.root);
    this.mergeState = null;
    await this.initialize();
  }
}

let browserFS: LightningFS | undefined;
const labs = new Map<string, Promise<GitLab>>();
export function getGitLab(questId: string) {
  if (!labs.has(questId)) {
    browserFS ??= new LightningFS('devops-odyssey-git-v1');
    const lab = new GitLab(browserFS, questId);
    const pending = lab.initialize().then(() => lab).catch(error => { labs.delete(questId); throw error; });
    labs.set(questId, pending);
  }
  return labs.get(questId)!;
}
