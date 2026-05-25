import React, { useState, useEffect, useRef } from 'react';

interface TerminalSimulatorProps {
  questId: string;
  validatorKey: string;
  onSuccess: (isSimulated: boolean) => void;
}

interface SimState {
  fs: Record<string, string>;
  permissions: Record<string, string>; // file -> permissions
  currentDir: string;
  git: {
    initialized: boolean;
    currentBranch: string;
    branches: Record<string, string>; // name -> commitSHA
    staged: string[];
    commits: { sha: string; msg: string; files: Record<string, string> }[];
    reflog: { action: string; sha: string }[];
  };
  docker: {
    containers: { id: string; name: string; image: string; ports: string; status: string }[];
    images: { tag: string; id: string; created: string }[];
    composeActive: boolean;
  };
  k8s: {
    pods: { name: string; image: string; status: string; age: string }[];
    services: { name: string; type: string; clusterIp: string; ports: string; age: string }[];
  };
}

const INITIAL_STATE: SimState = {
  fs: {
    'README.md': '# DevOps Sandbox\nUse this directory to perform your quest tasks, run commands, and practice configurations.\n'
  },
  permissions: {},
  currentDir: 'devops-sandbox',
  git: {
    initialized: false,
    currentBranch: 'main',
    branches: { 'main': '' },
    staged: [],
    commits: [],
    reflog: []
  },
  docker: {
    containers: [],
    images: [
      { tag: 'nginx:latest', id: 'sha256:8b5cf6', created: '2 days ago' },
      { tag: 'redis:latest', id: 'sha256:06b6d4', created: '1 week ago' },
      { tag: 'alpine:latest', id: 'sha256:10b981', created: '3 weeks ago' }
    ],
    composeActive: false
  },
  k8s: {
    pods: [],
    services: []
  }
};

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({ questId, validatorKey, onSuccess }) => {
  const [history, setHistory] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [logs, setLogs] = useState<{ type: 'input' | 'output' | 'error' | 'success'; text: string }[]>([
    { type: 'output', text: '=== DevOps Odyssey Interactive Browser Terminal Simulator ===' },
    { type: 'output', text: 'Type "help" to see available commands. Type commands to complete your active quest.' },
    { type: 'output', text: '-------------------------------------------------------------' }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [simState, setSimState] = useState<SimState>(INITIAL_STATE);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Focus terminal input on click
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Generate short SHA
  const genSHA = () => Math.random().toString(16).substring(2, 9);

  // Helper to add output log
  const printOut = (text: string) => {
    setLogs(prev => [...prev, { type: 'output', text }]);
  };

  // Helper to add error log
  const printErr = (text: string) => {
    setLogs(prev => [...prev, { type: 'error', text }]);
  };

  // Helper to add success log
  const printSuccess = (text: string) => {
    setLogs(prev => [...prev, { type: 'success', text }]);
  };

  // Validate the quest state on every state change
  useEffect(() => {
    checkQuestCompletion();
  }, [simState]);

  const checkQuestCompletion = () => {
    let completed = false;

    switch (validatorKey) {
      case 'git_init':
        // git init, and at least one commit
        if (simState.git.initialized && simState.git.commits.length > 0) {
          completed = true;
        }
        break;
      case 'git_branch':
        // branch feature-devops exists, and quest.txt is committed/exists
        if (simState.git.branches['feature-devops'] && simState.fs['quest.txt']) {
          completed = true;
        }
        break;
      case 'git_reflog':
        // recovery-branch exists
        if (simState.git.branches['recovery-branch']) {
          completed = true;
        }
        break;
      case 'py_health':
        // health_check.py exists and contains urllib/requests, and user has executed it
        // Checked in command runner when running `python health_check.py`
        break;
      case 'bash_backup':
        // backup_dest/README.md and backup_dest/quest.txt exist
        if (simState.fs['backup_dest/README.md'] && simState.fs['backup_dest/quest.txt']) {
          completed = true;
        }
        break;
      case 'port_scan':
        // Run nc or test net connection
        break;
      case 'nginx_config':
        // nginx.conf exists and has correct directives
        const nginxConf = simState.fs['nginx.conf'];
        if (nginxConf && nginxConf.includes('listen 80') && nginxConf.includes('proxy_pass http://localhost:3000')) {
          completed = true;
        }
        break;
      case 'docker_run':
        // container devops-nginx-sandbox exists, image nginx, port 8085
        const nginxContainer = simState.docker.containers.find(c => c.name === 'devops-nginx-sandbox');
        if (nginxContainer && nginxContainer.ports.includes('8085') && nginxContainer.status === 'running') {
          completed = true;
        }
        break;
      case 'docker_compose':
        // Compose active and has redis and nginx images
        if (simState.docker.composeActive) {
          const hasNginx = simState.docker.containers.some(c => c.image.includes('nginx'));
          const hasRedis = simState.docker.containers.some(c => c.image.includes('redis'));
          if (hasNginx && hasRedis) {
            completed = true;
          }
        }
        break;
      case 'docker_build':
        // Image devops-mock-app:v1.0 exists
        const mockImg = simState.docker.images.find(img => img.tag === 'devops-mock-app:v1.0');
        if (mockImg) {
          completed = true;
        }
        break;
      case 'k8s_status':
        // Handled in command execution
        break;
      case 'k8s_deploy':
        // Pod k8s-nginx-pod exists and runs
        const nginxPod = simState.k8s.pods.find(p => p.name === 'k8s-nginx-pod');
        if (nginxPod && nginxPod.status === 'Running') {
          completed = true;
        }
        break;
      case 'k8s_service':
        // Service k8s-nginx-service exists on port 80
        const nginxSvc = simState.k8s.services.find(s => s.name === 'k8s-nginx-service');
        if (nginxSvc && nginxSvc.ports.includes('80')) {
          completed = true;
        }
        break;
      case 'tf_local':
        // tf_quest.txt exists and contains Terraform was here!
        const tfFile = simState.fs['tf_quest.txt'];
        if (tfFile && tfFile.includes('Terraform was here!')) {
          completed = true;
        }
        break;
      case 'gh_workflow':
        // .github/workflows/devops_check.yml exists and contains basic keys
        const workflow = simState.fs['.github/workflows/devops_check.yml'];
        if (workflow && workflow.includes('on:') && workflow.includes('jobs:')) {
          completed = true;
        }
        break;
      case 'prometheus_mock':
        // prometheus.yml exists and has localhost:9100
        const promConf = simState.fs['prometheus.yml'];
        if (promConf && promConf.includes('scrape_configs') && promConf.includes('localhost:9100')) {
          completed = true;
        }
        break;
      case 'cloud_cli':
        // CLI version query handled in command execution
        break;
      case 'agile_backlog':
        // backlog.json exists and has valid json list of backlog items
        const backlogFile = simState.fs['backlog.json'];
        if (backlogFile) {
          try {
            const parsed = JSON.parse(backlogFile);
            if (Array.isArray(parsed) && parsed.length >= 2 && parsed[0].title && parsed[0].status) {
              completed = true;
            }
          } catch (e) {}
        }
        break;
      default:
        break;
    }

    if (completed) {
      printSuccess(`🎯 [GOAL ACHIEVED] You have completed all criteria for "${questId}" in the simulation! Click "VERIFY QUEST" to claim your XP.`);
      onSuccess(true);
    }
  };

  const handleCommand = (rawLine: string) => {
    const cmdLine = rawLine.trim();
    if (!cmdLine) return;

    // Log the input
    setLogs(prev => [...prev, { type: 'input', text: cmdLine }]);
    setHistory(prev => [...prev, cmdLine]);
    setHistoryIndex(-1);

    // Parsing commands
    const args = cmdLine.split(/\s+/);
    const cmd = args[0].toLowerCase();

    // 1. HELP
    if (cmd === 'help') {
      printOut('Supported commands:');
      printOut('  General: ls, cd, pwd, mkdir, cat, echo, clear, help');
      printOut('  Git: git init, git status, git add, git commit, git log, git reflog, git branch, git checkout, git reset');
      printOut('  Docker: docker run, docker ps, docker images, docker build, docker-compose');
      printOut('  Kubernetes: kubectl cluster-info, kubectl run, kubectl get, kubectl expose');
      printOut('  Terraform: terraform init, terraform apply');
      printOut('  Other: python, chmod');
      return;
    }

    // 2. CLEAR
    if (cmd === 'clear' || cmd === 'cls') {
      setLogs([]);
      return;
    }

    // 3. PWD
    if (cmd === 'pwd') {
      printOut(`/${simState.currentDir}`);
      return;
    }

    // 4. LS / DIR
    if (cmd === 'ls' || cmd === 'dir') {
      const files = Object.keys(simState.fs);
      if (files.length === 0) {
        printOut('(empty directory)');
      } else {
        files.forEach(f => {
          const isExec = simState.permissions[f]?.includes('x') || f.endsWith('.sh') || f.endsWith('.ps1');
          printOut(`${isExec ? '* ' : '  '}${f}`);
        });
      }
      return;
    }

    // 5. MKDIR
    if (cmd === 'mkdir') {
      if (args.length < 2) {
        printErr('mkdir: missing operand');
        return;
      }
      printOut(`Created directory: ${args[1]}`);
      return;
    }

    // 6. CAT
    if (cmd === 'cat') {
      if (args.length < 2) {
        printErr('cat: missing filename');
        return;
      }
      const filename = args[1];
      const content = simState.fs[filename];
      if (content !== undefined) {
        printOut(content);
      } else {
        printErr(`cat: ${filename}: No such file or directory`);
      }
      return;
    }

    // 7. ECHO (supports echo "text" > file)
    if (cmd === 'echo') {
      // Find redirection
      const redirectIndex = args.indexOf('>');
      if (redirectIndex !== -1 && redirectIndex < args.length - 1) {
        const textParts = args.slice(1, redirectIndex);
        let text = textParts.join(' ').replace(/^["']|["']$/g, ''); // strip quotes
        // Handle escaped newlines
        text = text.replace(/\\n/g, '\n').replace(/`n/g, '\n');
        const destFile = args[redirectIndex + 1];
        
        setSimState(prev => ({
          ...prev,
          fs: {
            ...prev.fs,
            [destFile]: text
          }
        }));
        printOut(`Wrote contents to ${destFile}`);
      } else {
        printOut(args.slice(1).join(' ').replace(/^["']|["']$/g, ''));
      }
      return;
    }

    // 8. CHMOD
    if (cmd === 'chmod') {
      if (args.length < 3) {
        printErr('chmod: missing arguments. Usage: chmod 755 <file>');
        return;
      }
      const mode = args[1];
      const file = args[2];
      if (simState.fs[file] === undefined) {
        printErr(`chmod: ${file}: No such file`);
        return;
      }
      setSimState(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [file]: mode === '755' || mode === '+x' ? 'rwxr-xr-x' : 'rw-r--r--'
        }
      }));
      printOut(`Changed mode of ${file} to ${mode}`);
      return;
    }

    // 9. GIT COMMANDS
    if (cmd === 'git') {
      const gitCmd = args[1]?.toLowerCase();
      if (!gitCmd) {
        printOut('Usage: git [init | status | add | commit | log | reflog | branch | checkout | reset]');
        return;
      }

      // git init
      if (gitCmd === 'init') {
        setSimState(prev => {
          const isInit = prev.git.initialized;
          const reflog = [...prev.git.reflog];
          if (!isInit) {
            reflog.push({ action: 'init: Created empty Git repository', sha: '0000000' });
          }
          return {
            ...prev,
            git: {
              ...prev.git,
              initialized: true,
              reflog
            }
          };
        });
        printOut('Initialized empty Git repository in /workspace/devops-sandbox/.git/');
        return;
      }

      if (!simState.git.initialized) {
        printErr('fatal: not a git repository (or any of the parent directories): .git');
        return;
      }

      // git status
      if (gitCmd === 'status') {
        printOut(`On branch ${simState.git.currentBranch}`);
        printOut("Your branch is up to date with 'origin/main'.");
        printOut('');

        // Find unstaged vs staged files
        const allFiles = Object.keys(simState.fs);
        const committedFiles = simState.git.commits[simState.git.commits.length - 1]?.files || {};
        
        const staged = simState.git.staged;
        const unstaged: string[] = [];
        const untracked: string[] = [];

        allFiles.forEach(f => {
          if (f === '.git') return;
          if (staged.includes(f)) return;
          
          if (committedFiles[f] === undefined) {
            untracked.push(f);
          } else if (committedFiles[f] !== simState.fs[f]) {
            unstaged.push(f);
          }
        });

        if (staged.length > 0) {
          printOut('Changes to be committed:');
          printOut('  (use "git restore --staged <file>..." to unstage)');
          staged.forEach(f => printOut(`\tnew file:   ${f}`));
          printOut('');
        }

        if (unstaged.length > 0) {
          printOut('Changes not staged for commit:');
          printOut('  (use "git add <file>..." to update what will be committed)');
          unstaged.forEach(f => printOut(`\tmodified:   ${f}`));
          printOut('');
        }

        if (untracked.length > 0) {
          printOut('Untracked files:');
          printOut('  (use "git add <file>..." to include in what will be committed)');
          untracked.forEach(f => printOut(`\t${f}`));
          printOut('');
        }

        if (staged.length === 0 && unstaged.length === 0 && untracked.length === 0) {
          printOut('nothing to commit, working tree clean');
        }
        return;
      }

      // git add
      if (gitCmd === 'add') {
        if (args.length < 3) {
          printErr('Nothing specified, nothing added.');
          return;
        }
        const target = args[2];
        const allFiles = Object.keys(simState.fs);
        let added: string[] = [];

        if (target === '.' || target === '*') {
          added = allFiles.filter(f => !simState.git.staged.includes(f));
        } else {
          if (simState.fs[target] !== undefined) {
            if (!simState.git.staged.includes(target)) {
              added = [target];
            }
          } else {
            printErr(`fatal: pathspec '${target}' did not match any files`);
            return;
          }
        }

        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            staged: [...prev.git.staged, ...added]
          }
        }));
        printOut(`Staged ${added.length} files.`);
        return;
      }

      // git commit
      if (gitCmd === 'commit') {
        const mIdx = args.indexOf('-m');
        if (mIdx === -1 || mIdx === args.length - 1) {
          printErr('error: switch `m\' requires a value');
          return;
        }
        const msg = args.slice(mIdx + 1).join(' ').replace(/^["']|["']$/g, '');

        if (simState.git.staged.length === 0) {
          printOut('On branch ' + simState.git.currentBranch);
          printOut('nothing to commit, working tree clean');
          return;
        }

        const sha = genSHA();
        setSimState(prev => {
          const filesInCommit = { ...prev.fs };
          const newCommit = {
            sha,
            msg,
            files: filesInCommit
          };
          const reflog = [...prev.git.reflog];
          reflog.push({ action: `commit: ${msg}`, sha });

          return {
            ...prev,
            git: {
              ...prev.git,
              commits: [...prev.git.commits, newCommit],
              staged: [],
              branches: {
                ...prev.git.branches,
                [prev.git.currentBranch]: sha
              },
              reflog
            }
          };
        });

        printOut(`[${simState.git.currentBranch} ${sha}] ${msg}`);
        printOut(` ${simState.git.staged.length} file changed`);
        return;
      }

      // git log
      if (gitCmd === 'log') {
        if (simState.git.commits.length === 0) {
          printErr('fatal: your current branch does not have any commits yet');
          return;
        }
        // Print commits reversed
        const list = [...simState.git.commits].reverse();
        list.forEach(c => {
          printOut(`commit ${c.sha} (HEAD -> ${simState.git.currentBranch})`);
          printOut(`Author: DevOps Practitioner <student@devops.odyssey>`);
          printOut(`Date:   ${new Date().toLocaleString()}`);
          printOut(`\n    ${c.msg}\n`);
        });
        return;
      }

      // git reflog
      if (gitCmd === 'reflog') {
        if (simState.git.reflog.length === 0) {
          printOut('No reflog records found.');
          return;
        }
        const list = [...simState.git.reflog].reverse();
        list.forEach((entry, idx) => {
          printOut(`${entry.sha} HEAD@{${idx}}: ${entry.action}`);
        });
        return;
      }

      // git branch
      if (gitCmd === 'branch') {
        if (args.length === 2) {
          // List branches
          Object.keys(simState.git.branches).forEach(b => {
            const isCurrent = b === simState.git.currentBranch;
            printOut(`${isCurrent ? '* ' : '  '}${b} (${simState.git.branches[b] || 'no commits'})`);
          });
          return;
        }

        const newBranchName = args[2];
        const shaOrRef = args[3];

        if (newBranchName === '-d' || newBranchName === '-D') {
          const deleteTarget = args[3];
          if (!deleteTarget) {
            printErr('fatal: branch name required');
            return;
          }
          if (deleteTarget === simState.git.currentBranch) {
            printErr(`error: Cannot delete branch '${deleteTarget}' checked out at '/workspace/devops-sandbox'`);
            return;
          }
          setSimState(prev => {
            const branches = { ...prev.git.branches };
            delete branches[deleteTarget];
            return {
              ...prev,
              git: { ...prev.git, branches }
            };
          });
          printOut(`Deleted branch ${deleteTarget} (was ${simState.git.branches[deleteTarget] || 'none'}).`);
          return;
        }

        let targetSHA = simState.git.branches[simState.git.currentBranch] || '';
        if (shaOrRef) {
          // Check if custom SHA exists in commits or reflog
          const commitExists = simState.git.commits.some(c => c.sha === shaOrRef) || simState.git.reflog.some(r => r.sha === shaOrRef);
          if (!commitExists && shaOrRef !== 'HEAD') {
            printErr(`fatal: '${shaOrRef}' is not a valid commit reference`);
            return;
          }
          targetSHA = shaOrRef === 'HEAD' ? (simState.git.branches[simState.git.currentBranch] || '') : shaOrRef;
        }

        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            branches: {
              ...prev.git.branches,
              [newBranchName]: targetSHA
            }
          }
        }));
        printOut(`Branch '${newBranchName}' created pointing to ${targetSHA || 'HEAD'}.`);
        return;
      }

      // git checkout
      if (gitCmd === 'checkout') {
        let target = args[2];
        const isB = target === '-b';
        if (isB) {
          target = args[3];
          if (!target) {
            printErr('fatal: branch name required');
            return;
          }
          // Create branch and switch
          setSimState(prev => {
            const reflog = [...prev.git.reflog];
            reflog.push({ action: `checkout: moving from ${prev.git.currentBranch} to ${target}`, sha: prev.git.branches[prev.git.currentBranch] || '0000000' });
            return {
              ...prev,
              git: {
                ...prev.git,
                branches: {
                  ...prev.git.branches,
                  [target]: prev.git.branches[prev.git.currentBranch] || ''
                },
                currentBranch: target,
                reflog
              }
            };
          });
          printOut(`Switched to a new branch '${target}'`);
          return;
        }

        if (!target) {
          printErr('fatal: branch or commit name required');
          return;
        }

        // Switch existing branch
        if (simState.git.branches[target] !== undefined) {
          const targetSHA = simState.git.branches[target];
          // Load files from target branch's last commit
          const lastCommitOfBranch = simState.git.commits.find(c => c.sha === targetSHA);
          
          setSimState(prev => {
            const reflog = [...prev.git.reflog];
            reflog.push({ action: `checkout: moving from ${prev.git.currentBranch} to ${target}`, sha: targetSHA || '0000000' });
            return {
              ...prev,
              fs: lastCommitOfBranch ? { ...lastCommitOfBranch.files } : { ...INITIAL_STATE.fs },
              git: {
                ...prev.git,
                currentBranch: target,
                reflog
              }
            };
          });
          printOut(`Switched to branch '${target}'`);
        } else {
          printErr(`error: pathspec '${target}' did not match any file(s) known to git`);
        }
        return;
      }

      // git reset
      if (gitCmd === 'reset') {
        const isHard = args[2] === '--hard';
        let targetRef = isHard ? args[3] : args[2];

        if (!targetRef) {
          printOut('Unstaged changes reset.');
          return;
        }

        let targetSHA = '';
        if (targetRef === 'HEAD~1') {
          const idx = simState.git.commits.length - 2;
          if (idx < 0) {
            printErr('fatal: Cannot reset: no parent commit found');
            return;
          }
          targetSHA = simState.git.commits[idx].sha;
        } else {
          // Check if valid SHA
          const commit = simState.git.commits.find(c => c.sha === targetRef);
          if (!commit) {
            // Check in reflog
            const reflogEntry = simState.git.reflog.find(r => r.sha === targetRef);
            if (reflogEntry) {
              targetSHA = reflogEntry.sha;
            } else {
              printErr(`fatal: Cannot find reference '${targetRef}'`);
              return;
            }
          } else {
            targetSHA = commit.sha;
          }
        }

        // Perform reset
        const targetCommit = simState.git.commits.find(c => c.sha === targetSHA);
        setSimState(prev => {
          const reflog = [...prev.git.reflog];
          reflog.push({ action: `reset: moving to ${targetRef}`, sha: targetSHA });
          
          // Truncate commits that are newer if desired, or keep them in history (Git keeps them in reflog but deletes them from log)
          const commitIndex = prev.git.commits.findIndex(c => c.sha === targetSHA);
          const truncatedCommits = prev.git.commits.slice(0, commitIndex + 1);

          return {
            ...prev,
            fs: targetCommit ? { ...targetCommit.files } : { ...INITIAL_STATE.fs },
            git: {
              ...prev.git,
              commits: truncatedCommits,
              branches: {
                ...prev.git.branches,
                [prev.git.currentBranch]: targetSHA
              },
              reflog
            }
          };
        });

        printOut(`HEAD is now at ${targetSHA || 'init'}`);
        return;
      }

      printErr(`git: '${gitCmd}' is not a simulated git command. See 'help'.`);
      return;
    }

    // 10. DOCKER COMMANDS
    if (cmd === 'docker') {
      const sub = args[1]?.toLowerCase();
      if (!sub) {
        printOut('Usage: docker [run | ps | images | build]');
        return;
      }

      // docker run
      if (sub === 'run') {
        const dIdx = args.indexOf('-d');
        const nameIdx = args.indexOf('--name');
        const pIdx = args.indexOf('-p');

        const name = nameIdx !== -1 ? args[nameIdx + 1] : 'docker-container-' + genSHA().slice(0, 4);
        const ports = pIdx !== -1 ? args[pIdx + 1] : '80:80';
        const image = args[args.length - 1];

        if (image === 'run') {
          printErr('docker: "run" requires at least 1 argument.');
          return;
        }

        const id = genSHA();
        setSimState(prev => ({
          ...prev,
          docker: {
            ...prev.docker,
            containers: [...prev.docker.containers, {
              id,
              name,
              image,
              ports,
              status: 'running'
            }]
          }
        }));

        printOut(id);
        printOut(`Successfully started container '${name}' on host ports ${ports}`);
        return;
      }

      // docker ps
      if (sub === 'ps') {
        printOut('CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS              NAMES');
        simState.docker.containers.forEach(c => {
          printOut(`${c.id.slice(0, 12)}   ${c.image.padEnd(10)} "/docker-entrypoint…"   5 seconds ago   Up 5 seconds   ${c.ports.padEnd(16)} ${c.name}`);
        });
        return;
      }

      // docker images
      if (sub === 'images') {
        printOut('REPOSITORY    TAG       IMAGE ID       CREATED        SIZE');
        simState.docker.images.forEach(img => {
          printOut(`${img.tag.split(':')[0].padEnd(13)} ${img.tag.split(':')[1].padEnd(9)} ${img.id.slice(7, 19).padEnd(14)} ${img.created.padEnd(14)} 142MB`);
        });
        return;
      }

      // docker build
      if (sub === 'build') {
        const tIdx = args.indexOf('-t');
        if (tIdx === -1 || tIdx === args.length - 1) {
          printErr('docker build: requires image tag, e.g. -t devops-mock-app:v1.0');
          return;
        }
        const tag = args[tIdx + 1];

        // Check Dockerfile
        if (simState.fs['Dockerfile'] === undefined) {
          printErr('Cannot build: No Dockerfile found in current directory.');
          return;
        }

        printOut('Sending build context to Docker daemon  2.048kB');
        printOut('Step 1/3 : FROM alpine');
        printOut(' ---> ' + simState.docker.images[2]?.id);
        printOut('Step 2/3 : RUN echo "Hello DevOps!" > /hello.txt');
        printOut(' ---> Running in ' + genSHA());
        printOut(' ---> ' + genSHA());
        printOut('Step 3/3 : CMD cat /hello.txt');
        printOut(' ---> Running in ' + genSHA());
        printOut(' ---> ' + genSHA());
        
        const newImgId = 'sha256:' + genSHA();
        setSimState(prev => ({
          ...prev,
          docker: {
            ...prev.docker,
            images: [...prev.docker.images, { tag, id: newImgId, created: 'Just now' }]
          }
        }));

        printOut(`Successfully built ${newImgId.slice(7, 19)}`);
        printOut(`Successfully tagged ${tag}`);
        return;
      }

      printErr(`docker: '${sub}' is not a simulated docker command.`);
      return;
    }

    // 11. DOCKER COMPOSE
    if (cmd === 'docker-compose' || (cmd === 'docker' && args[1] === 'compose')) {
      const upIdx = args.indexOf('up');
      if (upIdx === -1) {
        printOut('Usage: docker-compose up -d');
        return;
      }

      if (simState.fs['docker-compose.yml'] === undefined) {
        printErr('error: No docker-compose.yml file found.');
        return;
      }

      printOut('Creating network "devops-sandbox_default" with the default driver');
      printOut('Creating volume "devops-sandbox_redis-data" with default driver');
      printOut('Pulling cache (redis)...');
      printOut('Pulling web (nginx)...');
      printOut('Creating devops-sandbox_cache_1 ... done');
      printOut('Creating devops-sandbox_web_1   ... done');

      setSimState(prev => ({
        ...prev,
        docker: {
          ...prev.docker,
          composeActive: true,
          containers: [
            ...prev.docker.containers,
            { id: genSHA(), name: 'devops-sandbox_web_1', image: 'nginx', ports: '8090:80', status: 'running' },
            { id: genSHA(), name: 'devops-sandbox_cache_1', image: 'redis', ports: '6379:6379', status: 'running' }
          ]
        }
      }));
      return;
    }

    // 12. KUBERNETES COMMANDS
    if (cmd === 'kubectl') {
      const action = args[1]?.toLowerCase();
      if (!action) {
        printOut('Usage: kubectl [cluster-info | run | get | expose]');
        return;
      }

      if (action === 'cluster-info') {
        printOut('Kubernetes control plane is running at https://127.0.0.1:6443');
        printOut('CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy');
        if (validatorKey === 'k8s_status') {
          printSuccess('🎯 Kubernetes cluster connectivity simulated successfully!');
          onSuccess(true);
        }
        return;
      }

      if (action === 'run') {
        const podName = args[2];
        const imgIdx = args.find(a => a.startsWith('--image='));
        const image = imgIdx ? imgIdx.split('=')[1] : 'nginx';

        if (!podName) {
          printErr('error: run requires pod name');
          return;
        }

        setSimState(prev => ({
          ...prev,
          k8s: {
            ...prev.k8s,
            pods: [...prev.k8s.pods, { name: podName, image, status: 'Running', age: '1s' }]
          }
        }));
        printOut(`pod/${podName} created`);
        return;
      }

      if (action === 'get') {
        const resource = args[2]?.toLowerCase();
        if (resource === 'pods' || resource === 'pod') {
          printOut('NAME             READY   STATUS    RESTARTS   AGE');
          simState.k8s.pods.forEach(p => {
            printOut(`${p.name.padEnd(16)} 1/1     ${p.status.padEnd(9)} 0          ${p.age}`);
          });
          return;
        }
        if (resource === 'services' || resource === 'svc' || resource === 'service') {
          printOut('NAME                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE');
          printOut('kubernetes           ClusterIP   10.96.0.1        <none>        443/TCP   10d');
          simState.k8s.services.forEach(s => {
            printOut(`${s.name.padEnd(20)} ${s.type.padEnd(11)} ${s.clusterIp.padEnd(16)} <none>        ${s.ports.padEnd(9)} ${s.age}`);
          });
          return;
        }
        printErr(`error: resource type "${resource}" not simulated.`);
        return;
      }

      if (action === 'expose') {
        const type = args[2]; // e.g. pod
        const name = args[3]; // e.g. k8s-nginx-pod
        const nameParam = args.find(a => a.startsWith('--name='));
        const portParam = args.find(a => a.startsWith('--port='));
        const svcTypeParam = args.find(a => a.startsWith('--type='));

        const svcName = nameParam ? nameParam.split('=')[1] : name + '-service';
        const port = portParam ? portParam.split('=')[1] : '80';
        const svcType = svcTypeParam ? svcTypeParam.split('=')[1] : 'ClusterIP';

        if (type !== 'pod' || !name) {
          printErr('kubectl expose: Usage exposes pod, e.g. kubectl expose pod k8s-nginx-pod');
          return;
        }

        // Check if pod exists
        const pod = simState.k8s.pods.find(p => p.name === name);
        if (!pod) {
          printErr(`error: pods "${name}" not found`);
          return;
        }

        setSimState(prev => ({
          ...prev,
          k8s: {
            ...prev.k8s,
            services: [...prev.k8s.services, {
              name: svcName,
              type: svcType,
              clusterIp: '10.96.12.' + Math.floor(Math.random() * 254),
              ports: `${port}/TCP`,
              age: '1s'
            }]
          }
        }));
        printOut(`service/${svcName} exposed`);
        return;
      }

      printErr(`kubectl: '${action}' is not simulated.`);
      return;
    }

    // 13. TERRAFORM COMMANDS
    if (cmd === 'terraform') {
      const sub = args[1]?.toLowerCase();
      if (!sub) {
        printOut('Usage: terraform [init | apply]');
        return;
      }

      if (sub === 'init') {
        printOut('Initializing the backend...');
        printOut('Initializing provider plugins...');
        printOut('- Finding latest version of hashicorp/local...');
        printOut('- Installing hashicorp/local v2.5.1...');
        printOut('Terraform has been successfully initialized!');
        
        setSimState(prev => ({
          ...prev,
          fs: {
            ...prev.fs,
            '.terraform/': 'mock initialization folder'
          }
        }));
        return;
      }

      if (sub === 'apply') {
        if (simState.fs['main.tf'] === undefined) {
          printErr('error: No Terraform configurations (*.tf) found.');
          return;
        }

        printOut('Terraform will perform the following actions:');
        printOut('  # local_file.quest will be created');
        printOut('  + resource "local_file" "quest" {');
        printOut('      + content  = "Terraform was here!"');
        printOut('      + filename = "./tf_quest.txt"');
        printOut('    }');
        printOut('\nPlan: 1 to add, 0 to change, 0 to destroy.');
        printOut('\nApplying changes...');
        printOut('local_file.quest: Creating...');
        printOut('local_file.quest: Creation complete after 0s');
        printOut('\nApply complete! Resources: 1 added, 0 changed, 0 destroyed.');

        setSimState(prev => ({
          ...prev,
          fs: {
            ...prev.fs,
            'tf_quest.txt': 'Terraform was here!',
            'terraform.tfstate': '{}'
          }
        }));
        return;
      }

      printErr(`terraform: '${sub}' is not simulated.`);
      return;
    }

    // 14. PYTHON COMMANDS
    if (cmd === 'python' || cmd === 'python3') {
      const script = args[1];
      if (!script) {
        printOut('Python 3.10.12 (default, simulated CLI console)');
        printOut('Type "exit()" to leave (or just press Enter).');
        return;
      }

      if (simState.fs[script] === undefined) {
        printErr(`python: can't open file '${script}': [Errno 2] No such file or directory`);
        return;
      }

      // Check contents of health_check.py
      if (script === 'health_check.py') {
        const code = simState.fs[script];
        if (code.includes('urllib') || code.includes('requests')) {
          printOut('OK');
          if (validatorKey === 'py_health') {
            printSuccess('🎯 Python healthcheck script executed and returned OK!');
            onSuccess(true);
          }
        } else {
          printOut('FAILED: Missing HTTP libraries or wrong health check logic.');
        }
        return;
      }

      printOut(`Python: simulated script ${script} ran successfully.`);
      return;
    }

    // 15. SCRIPTS EXECUTION
    if (cmdLine === './backup.sh' || cmdLine === '.\\backup.ps1') {
      const scriptName = cmdLine.replace('./', '').replace('.\\', '');
      if (simState.fs[scriptName] === undefined) {
        printErr(`${cmdLine}: command not found (or script does not exist)`);
        return;
      }

      // Execute backup logic
      printOut(`Running automation script ${scriptName}...`);
      printOut('Creating directory: backup_dest');
      printOut('Copying README.md to backup_dest/README.md');
      printOut('Copying quest.txt to backup_dest/quest.txt');
      printOut('Done.');

      setSimState(prev => ({
        ...prev,
        fs: {
          ...prev.fs,
          'backup_dest/README.md': prev.fs['README.md'] || '',
          'backup_dest/quest.txt': prev.fs['quest.txt'] || 'DevOps Quest Complete!'
        }
      }));
      return;
    }

    // 16. NETWORK PING/NET-CONNECTION COMMANDS
    if (cmd === 'test-netconnection' || cmd === 'nc' || cmd === 'curl') {
      if (validatorKey === 'port_scan') {
        printOut('Connection check to localhost:5001 [TCP] succeeded.');
        printSuccess('🎯 Port scan connection verified!');
        onSuccess(true);
        return;
      }
    }

    // 17. VERSION CHECKS FOR CLOUD
    if (cmd === 'aws' || cmd === 'az' || cmd === 'gcloud') {
      if (args[1] === '--version' || args[1] === 'version') {
        if (cmd === 'aws') printOut('aws-cli/2.15.15 Python/3.11.6 Windows/10');
        if (cmd === 'az') printOut('azure-cli 2.57.0');
        if (cmd === 'gcloud') printOut('Google Cloud SDK 465.0.0');
        
        if (validatorKey === 'cloud_cli') {
          printSuccess(`🎯 Cloud CLI version detected!`);
          onSuccess(true);
        }
        return;
      }
    }

    // Default: command not found
    printErr(`command not found: ${cmd}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= history.length) {
          setHistoryIndex(-1);
          setInputVal('');
        } else {
          setHistoryIndex(nextIdx);
          setInputVal(history[nextIdx]);
        }
      }
    }
  };

  return (
    <div className="terminal-simulator-container" onClick={handleTerminalClick}>
      <div className="terminal-simulator-header">
        <div className="terminal-buttons">
          <span className="term-btn term-close"></span>
          <span className="term-btn term-minimize"></span>
          <span className="term-btn term-expand"></span>
        </div>
        <div className="terminal-title">DevOps Simulated Shell: /{simState.currentDir} ({simState.git.initialized ? simState.git.currentBranch : 'no-git'})</div>
        <div style={{ width: '40px' }} />
      </div>

      <div className="terminal-body">
        {logs.map((log, idx) => (
          <div key={idx} className={`terminal-log-line log-${log.type}`}>
            {log.type === 'input' && <span className="term-prompt">➜  /{simState.currentDir} git:({simState.git.initialized ? simState.git.currentBranch : 'no-git'}) $ </span>}
            {log.text}
          </div>
        ))}
        <div ref={logsEndRef} />
        
        <div className="terminal-input-line">
          <span className="term-prompt">➜  /{simState.currentDir} git:({simState.git.initialized ? simState.git.currentBranch : 'no-git'}) $ </span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
