import React, { useState, useEffect, useRef } from 'react';
import type { InteractiveStep } from '../data/roadmapData';

interface TerminalSimulatorProps {
  questId: string;
  validatorKey: string;
  interactiveSteps: InteractiveStep[];
  completedSteps: string[]; // e.g. ["git_reflog:0", "git_reflog:1"]
  onStepComplete: (stepIndex: number) => void;
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

const createInitialState = (validatorKey: string): SimState => {
  if (validatorKey === 'git_init') {
    return INITIAL_STATE;
  }

  return {
    ...INITIAL_STATE,
    git: {
      initialized: true,
      currentBranch: 'main',
      branches: { main: 'aed1d1a' },
      staged: [],
      commits: [
        { sha: 'aed1d1a', msg: 'First commit', files: { ...INITIAL_STATE.fs } }
      ],
      reflog: [
        { action: 'commit: First commit', sha: 'aed1d1a' }
      ]
    }
  };
};

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  questId,
  validatorKey,
  interactiveSteps,
  completedSteps,
  onStepComplete
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [logs, setLogs] = useState<{ type: 'input' | 'output' | 'error' | 'success'; text: string }[]>(() => [
    { type: 'output', text: '=== DevOps Odyssey Interactive Simulator CLI ===' },
    { type: 'output', text: `Active Quest: ${questId}. Type "help" to see commands.` },
    { type: 'output', text: '---------------------------------------------------' }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [simState, setSimState] = useState<SimState>(() => createInitialState(validatorKey));

  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine current active sub-step index based on completedSteps array
  const getActiveStepIdx = () => {
    if (!interactiveSteps || interactiveSteps.length === 0) return 0;
    for (let i = 0; i < interactiveSteps.length; i++) {
      if (!completedSteps.includes(`${validatorKey}:${i}`)) {
        return i;
      }
    }
    return interactiveSteps.length; // All completed
  };

  const activeStepIdx = getActiveStepIdx();
  const allStepsCompleted = activeStepIdx >= interactiveSteps.length;

  // Focus terminal input on click
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Generate short SHA
  const genSHA = () => Math.random().toString(16).substring(2, 9);
  const printOut = (text: string) => setLogs(prev => [...prev, { type: 'output', text }]);
  const printErr = (text: string) => setLogs(prev => [...prev, { type: 'error', text }]);
  const printSuccess = (text: string) => setLogs(prev => [...prev, { type: 'success', text }]);

  // Check if typed command matches expected command
  const checkCommandTrigger = (typed: string) => {
    if (allStepsCompleted) return false;
    
    const target = interactiveSteps[activeStepIdx];
    
    // Clean string helper (remove quotes, trim whitespace, ignore case)
    const clean = (s: string) => s.toLowerCase().trim().replace(/['"`]/g, '').replace(/\s+/g, ' ');
    
    const acceptedCommands = [target.expectedCommand, ...(target.acceptedCommands || [])];

    if (acceptedCommands.some(command => clean(typed) === clean(command))) {
      // Execute side-effect updates to local simState based on the command
      applyStateSideEffects(typed);
      
      // Print the expected mock output
      printOut(target.mockOutput);
      printSuccess(`✓ Correct: completed Step "${target.title}"!`);
      
      // Callback to save progress in Supabase
      onStepComplete(activeStepIdx);
      return true;
    }
    return false;
  };

  // Apply visual simulation updates to filesystem, git, docker, k8s states
  const applyStateSideEffects = (cmdLine: string) => {
    const args = cmdLine.split(/\s+/);
    const cmd = args[0].toLowerCase();

    if (cmd === 'git') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'init') {
        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            initialized: true,
            reflog: [...prev.git.reflog, { action: 'init: Created empty Git repository', sha: '0000000' }]
          }
        }));
      } else if (sub === 'add') {
        const file = args[2];
        const files = file === '.' || file === '*' ? Object.keys(simState.fs) : [file];
        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            staged: [...prev.git.staged, ...files.filter(f => !prev.git.staged.includes(f))]
          }
        }));
      } else if (sub === 'commit') {
        const sha = genSHA();
        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            staged: [],
            commits: [...prev.git.commits, { sha, msg: 'Simulated Commit', files: { ...prev.fs } }],
            branches: { ...prev.git.branches, [prev.git.currentBranch]: sha },
            reflog: [...prev.git.reflog, { action: 'commit: Simulated Commit', sha }]
          }
        }));
      } else if (sub === 'checkout' || sub === 'switch') {
        const isB = args[2] === '-b';
        const isC = args[2] === '-c';
        const target = isB || isC ? args[3] : args[2];
        if (target) {
          setSimState(prev => ({
            ...prev,
            git: {
              ...prev.git,
              currentBranch: target,
              branches: { ...prev.git.branches, [target]: prev.git.branches[prev.git.currentBranch] || '' },
              reflog: [...prev.git.reflog, { action: `checkout: moving to ${target}`, sha: prev.git.branches[prev.git.currentBranch] || '0000000' }]
            }
          }));
        }
      } else if (sub === 'merge') {
        const targetBranch = args[2] || 'feature-devops';
        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            branches: { ...prev.git.branches, [prev.git.currentBranch]: prev.git.branches[targetBranch] || prev.git.branches[prev.git.currentBranch] || '' },
            reflog: [...prev.git.reflog, { action: `merge ${targetBranch}`, sha: prev.git.branches[targetBranch] || '4ab3e1c' }]
          }
        }));
      } else if (sub === 'reset') {
        const sha = prevCommitSHA();
        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            branches: { ...prev.git.branches, [prev.git.currentBranch]: sha },
            reflog: [...prev.git.reflog, { action: 'reset: moving to HEAD~1', sha }]
          }
        }));
      } else if (sub === 'branch' && args[2] === 'recovery-branch') {
        const targetSHA = args[3] || '9ef4b1a';
        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            branches: { ...prev.git.branches, 'recovery-branch': targetSHA }
          }
        }));
      } else if (sub === 'tag') {
        setSimState(prev => ({
          ...prev,
          git: {
            ...prev.git,
            reflog: [...prev.git.reflog, { action: `tag: ${args[2] || 'v1.0.0'}`, sha: prev.git.branches[prev.git.currentBranch] || '4ab3e1c' }]
          }
        }));
      }
    } else if (cmd === 'docker') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'run') {
        setSimState(prev => ({
          ...prev,
          docker: {
            ...prev.docker,
            containers: [...prev.docker.containers, {
              id: genSHA(),
              name: 'devops-nginx-sandbox',
              image: 'nginx',
              ports: '8085:80',
              status: 'running'
            }]
          }
        }));
      } else if (sub === 'build') {
        setSimState(prev => ({
          ...prev,
          docker: {
            ...prev.docker,
            images: [...prev.docker.images, { tag: 'devops-mock-app:v1.0', id: 'sha256:' + genSHA(), created: 'Just now' }]
          }
        }));
      }
    } else if (cmd === 'docker-compose') {
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
    } else if (cmd === 'kubectl') {
      const action = args[1]?.toLowerCase();
      if (action === 'run') {
        const name = args[2];
        setSimState(prev => ({
          ...prev,
          k8s: {
            ...prev.k8s,
            pods: [...prev.k8s.pods, { name, image: 'nginx', status: 'Running', age: '1s' }]
          }
        }));
      } else if (action === 'expose') {
        setSimState(prev => ({
          ...prev,
          k8s: {
            ...prev.k8s,
            services: [...prev.k8s.services, {
              name: 'k8s-nginx-service',
              type: 'ClusterIP',
              clusterIp: '10.96.12.45',
              ports: '80/TCP',
              age: '1s'
            }]
          }
        }));
      }
    } else if (cmd === 'terraform') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'apply') {
        setSimState(prev => ({
          ...prev,
          fs: {
            ...prev.fs,
            'tf_quest.txt': 'Terraform was here!'
          }
        }));
      }
    } else if (cmdLine.includes('run_check.sh') && cmdLine.includes('chmod')) {
      setSimState(prev => ({
        ...prev,
        permissions: { ...prev.permissions, 'run_check.sh': 'rwxr-xr-x' }
      }));
    } else if (cmdLine.includes('>')) {
      const parts = cmdLine.split('>');
      const file = parts[parts.length - 1].trim();
      setSimState(prev => ({
        ...prev,
        fs: { ...prev.fs, [file]: 'Simulated file contents.' }
      }));
    }
  };

  const prevCommitSHA = () => {
    if (simState.git.commits.length > 1) {
      return simState.git.commits[simState.git.commits.length - 2].sha;
    }
    return '4ab3e1c';
  };

  const handleCommand = (rawLine: string) => {
    const cmdLine = rawLine.trim();
    if (!cmdLine) return;

    // Log the input
    setLogs(prev => [...prev, { type: 'input', text: cmdLine }]);
    setHistory(prev => [...prev, cmdLine]);
    setHistoryIndex(-1);

    // 1. Check if the command is the expected target command for active sub-step
    const triggered = checkCommandTrigger(cmdLine);
    if (triggered) {
      return;
    }

    // 2. Otherwise run it as a normal simulated CLI command
    const args = cmdLine.split(/\s+/);
    const cmd = args[0].toLowerCase();

    // General Help
    if (cmd === 'help') {
      printOut('Simulator Sandbox Utilities:');
      printOut('  General: ls, cd, pwd, cat, clear, help');
      printOut('  Git: git init, git status, git add, git commit, git log, git reflog, git branch, git checkout, git reset');
      printOut('  Docker: docker run, docker ps, docker images, docker build, docker-compose');
      printOut('  Kubernetes: kubectl cluster-info, kubectl run, kubectl get, kubectl expose');
      printOut('  Terraform: terraform init, terraform apply');
      return;
    }

    if (cmd === 'clear' || cmd === 'cls') {
      setLogs([]);
      return;
    }

    if (cmd === 'pwd') {
      printOut(`/${simState.currentDir}`);
      return;
    }

    if (cmd === 'ls' || cmd === 'dir') {
      const files = Object.keys(simState.fs);
      files.forEach(f => {
        const isExec = simState.permissions[f]?.includes('x') || f.endsWith('.sh') || f.endsWith('.ps1');
        printOut(`${isExec ? '* ' : '  '}${f}`);
      });
      return;
    }

    if (cmd === 'cat') {
      const file = args[1];
      if (simState.fs[file] !== undefined) {
        printOut(simState.fs[file]);
      } else {
        printErr(`cat: ${file || ''}: No such file or directory`);
      }
      return;
    }

    // Git Sandbox fallback
    if (cmd === 'git') {
      const sub = args[1]?.toLowerCase();
      if (!simState.git.initialized && sub !== 'init') {
        printErr('fatal: not a git repository (or any of the parent directories): .git');
        return;
      }
      if (sub === 'init') {
        setSimState(prev => ({ ...prev, git: { ...prev.git, initialized: true } }));
        printOut('Reinitialized empty Git repository in /workspace/devops-sandbox/.git/');
        return;
      }
      if (sub === 'status') {
        printOut(`On branch ${simState.git.currentBranch}`);
        printOut('nothing to commit, working tree clean');
        return;
      }
      if (sub === 'log') {
        printOut('commit 4ab3e1c (HEAD -> main)\nAuthor: DevOps Practitioner <student@devops.odyssey>\nDate: Just now\n\n    Add files\n');
        return;
      }
      if (sub === 'reflog') {
        printOut('4ab3e1c HEAD@{0}: commit: Add files');
        return;
      }
      if (sub === 'branch') {
        printOut(`* ${simState.git.currentBranch}`);
        return;
      }
      printOut(`git command "${sub}" completed.`);
      return;
    }

    // Docker fallback
    if (cmd === 'docker') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'ps') {
        printOut('CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS              NAMES');
        simState.docker.containers.forEach(c => {
          printOut(`${c.id.slice(0,12)}   ${c.image.padEnd(10)} "/docker-entrypoint…"   5s ago   Up 5s   ${c.ports.padEnd(16)} ${c.name}`);
        });
        return;
      }
      if (sub === 'images') {
        printOut('REPOSITORY    TAG       IMAGE ID       CREATED        SIZE');
        simState.docker.images.forEach(img => {
          printOut(`${img.tag.split(':')[0].padEnd(13)} ${img.tag.split(':')[1].padEnd(9)} ${img.id.slice(7, 19).padEnd(14)} ${img.created.padEnd(14)} 142MB`);
        });
        return;
      }
      printOut(`docker command "${sub}" executed.`);
      return;
    }

    // Kubernetes fallback
    if (cmd === 'kubectl') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'get') {
        const resource = args[2]?.toLowerCase();
        if (resource === 'pods' || resource === 'pod') {
          if (simState.k8s.pods.length === 0) {
            printOut('No resources found in default namespace.');
          } else {
            printOut('NAME             READY   STATUS    RESTARTS   AGE');
            simState.k8s.pods.forEach(p => {
              printOut(`${p.name.padEnd(16)} 1/1     ${p.status.padEnd(9)} 0          ${p.age}`);
            });
          }
          return;
        }
        if (resource === 'svc' || resource === 'services') {
          printOut('NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE');
          printOut('kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   1d');
          simState.k8s.services.forEach(s => {
            printOut(`${s.name.padEnd(12)} ${s.type.padEnd(11)} ${s.clusterIp.padEnd(12)} <none>        ${s.ports.padEnd(9)} ${s.age}`);
          });
          return;
        }
      }
      printOut(`kubectl command "${sub}" executed.`);
      return;
    }

    // Default error
    printErr(`command not found or incorrect for this step: ${cmd}. Expected: "${interactiveSteps[activeStepIdx]?.expectedCommand || ''}"`);
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
        
        {!allStepsCompleted && (
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
        )}
      </div>
    </div>
  );
};
