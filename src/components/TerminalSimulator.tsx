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
    'README.md': '# DevOps Sandbox\nUse this directory to perform your quest tasks, run commands, and practice configurations.\n',
    'targets.txt': 'app1:3000 healthy\napp2:3000 unhealthy',
    '/etc/nginx/sites-available/default': 'server {\n    listen 80;\n    location / {\n        proxy_pass http://127.0.0.1:3999; # app runs on 3000!\n    }\n}',
    '/var/log/nginx/access.log': '127.0.0.1 - - [25/May/2026:12:00:01] "GET / HTTP/1.1" 200 612\n127.0.0.1 - - [25/May/2026:12:00:05] "POST /api HTTP/1.1" 500 24\n127.0.0.1 - - [25/May/2026:12:00:10] "GET /static/logo.png HTTP/1.1" 304 0'
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
        const nameIndex = args.indexOf('--name');
        const containerName = nameIndex !== -1 ? args[nameIndex + 1] : 'web';
        const pIndex = args.indexOf('-p');
        const containerPorts = pIndex !== -1 ? args[pIndex + 1] : '8080:80';
        const img = args[args.length - 1];
        setSimState(prev => ({
          ...prev,
          docker: {
            ...prev.docker,
            containers: [...prev.docker.containers, {
              id: genSHA(),
              name: containerName,
              image: img,
              ports: containerPorts,
              status: 'running'
            }]
          }
        }));
      } else if (sub === 'build') {
        const tIndex = args.indexOf('-t');
        const imgTag = tIndex !== -1 ? args[tIndex + 1] : 'my-app:v1.0';
        setSimState(prev => ({
          ...prev,
          docker: {
            ...prev.docker,
            images: [...prev.docker.images, { tag: imgTag, id: 'sha256:' + genSHA(), created: 'Just now' }]
          }
        }));
      }
    } else if (cmd === 'docker-compose' || cmd === 'docker-compose.yml') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'up' || sub === 'restart') {
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
      }
    } else if (cmd === 'kubectl') {
      const action = args[1]?.toLowerCase();
      if (action === 'run') {
        const name = args[2];
        const imgArg = args.find(a => a.startsWith('--image='));
        const image = imgArg ? imgArg.split('=')[1] : 'nginx';
        setSimState(prev => ({
          ...prev,
          k8s: {
            ...prev.k8s,
            pods: [...prev.k8s.pods, { name, image, status: 'Running', age: '1s' }]
          }
        }));
      } else if (action === 'create' && args[2]?.toLowerCase() === 'deployment') {
        const name = args[3];
        const imgArg = args.find(a => a.startsWith('--image='));
        const image = imgArg ? imgArg.split('=')[1] : 'nginx';
        const repArg = args.find(a => a.startsWith('--replicas='));
        const replicas = repArg ? parseInt(repArg.split('=')[1], 10) : 1;
        setSimState(prev => ({
          ...prev,
          k8s: {
            ...prev.k8s,
            pods: [
              ...prev.k8s.pods,
              ...Array.from({ length: replicas }).map(() => ({
                name: `${name}-${genSHA()}`,
                image,
                status: 'Running',
                age: '1s'
              }))
            ]
          }
        }));
      } else if (action === 'expose') {
        const deployName = args[2];
        const typeArg = args.find(a => a.startsWith('--type='));
        const type = typeArg ? typeArg.split('=')[1] : 'ClusterIP';
        const portArg = args.find(a => a.startsWith('--port='));
        const port = portArg ? portArg.split('=')[1] : '80';
        setSimState(prev => ({
          ...prev,
          k8s: {
            ...prev.k8s,
            services: [...prev.k8s.services, {
              name: deployName,
              type,
              clusterIp: '10.96.14.88',
              ports: `${port}:${type === 'NodePort' ? '31245' : port}/TCP`,
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
    } else if (cmdLine.includes('>') || cmdLine.includes('>>')) {
      const isAppend = cmdLine.includes('>>');
      const delimiter = isAppend ? '>>' : '>';
      const parts = cmdLine.split(delimiter);
      const echoPart = parts[0].trim();
      const file = parts[parts.length - 1].trim();
      
      let content = 'Simulated file contents.';
      if (echoPart.toLowerCase().startsWith('echo ')) {
        let text = echoPart.slice(5).trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
          text = text.slice(1, -1);
        }
        content = text.replace(/\\n/g, '\n');
      }

      setSimState(prev => {
        const oldContent = prev.fs[file] || '';
        const newContent = isAppend ? (oldContent ? oldContent + '\n' + content : content) : content;
        return {
          ...prev,
          fs: { ...prev.fs, [file]: newContent }
        };
      });
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

    if (cmdLine.includes('>') || cmdLine.includes('>>')) {
      const isAppend = cmdLine.includes('>>');
      const delimiter = isAppend ? '>>' : '>';
      const parts = cmdLine.split(delimiter);
      const echoPart = parts[0].trim();
      const file = parts[parts.length - 1].trim();
      
      let content = 'Simulated file contents.';
      if (echoPart.toLowerCase().startsWith('echo ')) {
        let text = echoPart.slice(5).trim();
        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
          text = text.slice(1, -1);
        }
        content = text.replace(/\\n/g, '\n');
      }

      setSimState(prev => {
        const oldContent = prev.fs[file] || '';
        const newContent = isAppend ? (oldContent ? oldContent + '\n' + content : content) : content;
        return {
          ...prev,
          fs: { ...prev.fs, [file]: newContent }
        };
      });
      printOut(isAppend ? 'Appended to file.' : `Wrote ${file}.`);
      return;
    }

    if (cmd === 'echo') {
      let text = cmdLine.slice(5).trim();
      if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
        text = text.slice(1, -1);
      }
      printOut(text.replace(/\\n/g, '\n'));
      return;
    }

    if (cmd === 'nslookup' || cmd === 'dig') {
      const target = args[1] || 'api.internal';
      if (target.includes('checkout.internal')) {
        printOut('Server:         127.0.0.53\nAddress:        127.0.0.53#53\n\nNon-authoritative answer:\nName:   checkout.internal\nAddress: 10.0.2.44');
      } else if (target.includes('shop.example.internal')) {
        printOut('Server:         127.0.0.53\nAddress:        127.0.0.53#53\n\nNon-authoritative answer:\nName:   shop.example.internal\nAddress: 10.0.10.20');
      } else {
        printOut(`Server:         127.0.0.53\nAddress:        127.0.0.53#53\n\nNon-authoritative answer:\nName:   ${target}\nAddress: 10.0.2.15`);
      }
      return;
    }

    if (cmd === 'curl') {
      const target = args.find(a => a.startsWith('http') || a.includes('internal') || a.includes('example'));
      if (target) {
        if (target.includes('checkout.internal')) {
          printErr('curl: (60) SSL: certificate subject name api.internal does not match checkout.internal');
        } else if (target.includes('shop.example.internal')) {
          printOut('HTTP/2 502\nserver: nginx\ndate: Mon, 25 May 2026 22:45:53 GMT\ncontent-length: 150\ncontent-type: text/html');
        } else if (target.includes('api.internal/health')) {
          printOut('HTTP/2 200\ncontent-type: application/json\ncache-control: no-store\n\n{"status":"healthy"}');
        } else {
          printOut('HTTP/2 200 OK\nContent-Type: text/html\nServer: nginx');
        }
      } else {
        printErr('curl: try "curl -I https://api.internal/health"');
      }
      return;
    }

    if (cmd === 'openssl') {
      if (cmdLine.includes('s_client')) {
        printOut('CONNECTED(00000003)\ndepth=0 CN = api.internal\nverify error:num=20:unable to get local issuer certificate\nverify return:1\n---\nCertificate chain\n 0 s:CN = api.internal\n   i:CN = Internal CA\n---\nsubject=CN=api.internal\nissuer=CN=Internal CA\n---\nNo client certificate CA names sent\n---\nSSL handshake has read 1240 bytes and written 340 bytes\nVerification: OK');
      } else {
        printOut('openssl mock utility. For TLS inspection, use: openssl s_client -connect <host>:<port>');
      }
      return;
    }

    if (cmd === 'ss' || cmd === 'netstat') {
      printOut('LISTEN 0 128 0.0.0.0:80 users:(("nginx",pid=21))\nLISTEN 0 128 0.0.0.0:443 users:(("nginx",pid=21))\nLISTEN 0 128 127.0.0.1:3000 users:(("node",pid=42))');
      return;
    }

    if (cmd === 'grep') {
      const pattern = args[1]?.replace(/['"]/g, '');
      const file = args[2];
      if (!pattern || !file) {
        printErr('Usage: grep <pattern> <filename>');
        return;
      }
      const fileContent = simState.fs[file];
      if (fileContent !== undefined) {
        const lines = fileContent.split('\n');
        const matched = lines.filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
        if (matched.length > 0) {
          printOut(matched.join('\n'));
        }
      } else {
        printErr(`grep: ${file}: No such file or directory`);
      }
      return;
    }

    if (cmd === 'nginx') {
      const isTest = args.includes('-t');
      if (isTest) {
        const cIndex = args.indexOf('-c');
        const confFile = cIndex !== -1 ? args[cIndex + 1] : '/etc/nginx/nginx.conf';
        printOut(`nginx: the configuration file ${confFile} syntax is ok\nnginx: configuration file ${confFile} test is successful`);
      } else {
        printOut('nginx: daemon running in background.');
      }
      return;
    }

    if (cmd === 'systemctl') {
      const sub = args[1]?.toLowerCase();
      const service = args[2]?.toLowerCase();
      if (sub === 'reload' && service === 'nginx') {
        printOut('Nginx service configuration reloaded successfully (graceful transition).');
      } else if (sub === 'status' && service === 'nginx') {
        printOut('● nginx.service - A high performance web server\n   Active: active (running) since Mon 2026-05-25 10:00:00 UTC\n   Process: 1042 ExecReload=/usr/sbin/nginx -g daemon on; master_process on; -s reload (code=exited, status=0/SUCCESS)');
      } else if (sub === 'restart' && service === 'nginx') {
        printOut('Nginx service restarted successfully.');
      } else {
        printOut(`systemctl: service "${service}" action "${sub}" succeeded.`);
      }
      return;
    }

    if (cmd === 'certbot') {
      if (args.includes('renew')) {
        printOut('Processing /etc/letsencrypt/renewal/api.internal.conf\nSimulating renewal of an existing cert...\nCongratulations, all simulated renewals succeeded!');
      } else {
        printOut('Certbot utility. Use "certbot renew --dry-run" to test SSL/TLS renewal.');
      }
      return;
    }

    if (cmd === 'tail') {
      const nIndex = args.indexOf('-n');
      const linesToRead = nIndex !== -1 ? parseInt(args[nIndex + 1], 10) : 10;
      const file = args[args.length - 1];
      const fileContent = simState.fs[file];
      if (fileContent !== undefined) {
        const lines = fileContent.split('\n');
        const sliced = lines.slice(-linesToRead);
        printOut(sliced.join('\n'));
      } else {
        printErr(`tail: cannot open '${file}': No such file or directory`);
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

    if (cmd === 'docker') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'ps') {
        printOut('CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS              NAMES');
        simState.docker.containers.forEach(c => {
          printOut(`${c.id.slice(0,12)}   ${c.image.padEnd(10)} "/docker-entrypoint…"   5s ago   Up 5s   ${c.ports.padEnd(16)} ${c.name}`);
        });
        if (simState.docker.containers.length === 0) {
          printOut('No running containers.');
        }
        return;
      }
      if (sub === 'images') {
        printOut('REPOSITORY    TAG       IMAGE ID       CREATED        SIZE');
        simState.docker.images.forEach(img => {
          printOut(`${img.tag.split(':')[0].padEnd(13)} ${img.tag.split(':')[1].padEnd(9)} ${img.id.slice(7, 19).padEnd(14)} ${img.created.padEnd(14)} 142MB`);
        });
        return;
      }
      if (sub === 'inspect') {
        const target = args[2] || 'web';
        printOut(`[\n  {\n    "Id": "e92a83cf8d1b",\n    "Name": "/${target}",\n    "State": { "Status": "running" },\n    "NetworkSettings": { "IPAddress": "172.17.0.2" }\n  }\n]`);
        return;
      }
      if (sub === 'volume') {
        const volSub = args[2]?.toLowerCase();
        if (volSub === 'create') {
          printOut(args[3] || 'data-volume');
        } else {
          printOut('data-volume');
        }
        return;
      }
      if (sub === 'network') {
        const netSub = args[2]?.toLowerCase();
        if (netSub === 'create') {
          printOut('d8c89bfa2128');
        } else {
          printOut('my-net');
        }
        return;
      }
      if (sub === 'logs') {
        const target = args[2] || 'web';
        if (target.includes('proxy')) {
          printOut('nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)\nweb-proxy exited with code 1');
        } else {
          printOut('172.17.0.1 - - [25/May/2026:12:30:10] "GET / HTTP/1.1" 200 612\n172.17.0.1 - - [25/May/2026:12:30:15] "GET /non-existent HTTP/1.1" 404 153');
        }
        return;
      }
      if (sub === 'exec') {
        printOut('50x.html\nindex.html');
        return;
      }
      if (sub === 'tag') {
        printOut('Tagged image.');
        return;
      }
      if (sub === 'push') {
        printOut('The push refers to repository [registry.internal/my-app]\naefd02b8d234: Pushed\n96317b9b1d31: Layer already exists\nv1.0: digest: sha256:7f14b6 size: 948');
        return;
      }
      printOut(`docker command "${sub}" executed.`);
      return;
    }

    if (cmd === 'docker-compose') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'up') {
        printOut('Creating network "sandbox_default" with the default driver\nCreating sandbox_db_1  ... done\nCreating sandbox_web_1 ... done');
      } else if (sub === 'restart') {
        printOut('Restarting sandbox_web-proxy_1 ... done\nRestarting sandbox_db_1        ... done');
      } else {
        printOut(`docker-compose command "${sub}" completed.`);
      }
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

    if (cmd === 'terraform') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'init') {
        printOut('Initializing the backend...\nInitializing provider plugins...\n- Finding latest version of hashicorp/local...\n- Installing hashicorp/local v2.5.1...\nTerraform has been successfully initialized!');
      } else if (sub === 'fmt') {
        printOut('Reformatted main.tf');
      } else if (sub === 'validate') {
        printOut('Success! The configuration is valid.');
      } else if (sub === 'plan') {
        printOut('Terraform will perform the following actions:\n  # local_file.quest will be created\n  + resource "local_file" "quest" {\n      + content  = "Terraform was here!"\n      + filename = "./tf_quest.txt"\n    }\nPlan: 1 to add, 0 to change, 0 to destroy.');
      } else if (sub === 'apply') {
        printOut('local_file.quest: Creating...\nlocal_file.quest: Creation complete after 0s\nApply complete! Resources: 1 added, 0 changed, 0 destroyed.');
      } else if (sub === 'state') {
        const stateSub = args[2]?.toLowerCase();
        if (stateSub === 'list') {
          printOut('local_file.quest');
        } else {
          printOut('local_file.quest');
        }
      } else if (sub === 'import') {
        printOut('Import successful!\nResources imported: 1');
      } else {
        printOut(`terraform command "${sub}" completed.`);
      }
      return;
    }

    if (cmd === 'ansible-inventory') {
      printOut('[web]\nweb1 ansible_host=10.0.1.10');
      return;
    }

    if (cmd === 'ansible-playbook') {
      printOut('PLAY [web] *********************************************************************\n\nTASK [Gathering Facts] *********************************************************\nok: [web1]\n\nTASK [debug] *******************************************************************\nok: [web1] => {\n    "msg": "hello"\n}\n\nPLAY RECAP *********************************************************************\nweb1                       : ok=2    changed=0    unreachable=0    failed=0');
      return;
    }

    if (cmd === 'helm') {
      const sub = args[1]?.toLowerCase();
      const release = args[2];
      if (sub === 'install') {
        printOut(`NAME: ${release}\nLAST DEPLOYED: Mon May 25 14:00:00 2026\nNAMESPACE: default\nSTATUS: deployed\nREVISION: 1`);
      } else if (sub === 'upgrade') {
        printOut(`NAME: ${release}\nLAST DEPLOYED: Mon May 25 14:01:00 2026\nNAMESPACE: default\nSTATUS: deployed\nREVISION: 2`);
      } else if (sub === 'rollback') {
        printOut(`Rollback release ${release} to revision ${args[3] || '1'} completed.`);
      } else {
        printOut(`Helm release "${release}" command "${sub}" completed.`);
      }
      return;
    }

    if (cmd === 'promtool') {
      const sub = args[1]?.toLowerCase();
      if (sub === 'check') {
        printOut('Checking alerts.yml\n  SUCCESS: 1 rules found');
      } else {
        printOut('promtool checking succeeded.');
      }
      return;
    }

    if (cmd === 'promql') {
      printOut('Element                                   Value\nhttp_requests_total{status="500"}          142\nhttp_requests_total{status="200"}          12405');
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
