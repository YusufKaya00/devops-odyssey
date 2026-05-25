import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'linux_paths_filesystem',
    title: 'Filesystem Navigation and Path Discipline',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Practice the path commands used before touching any server file.',
    skillOutcomes: [
      'Identify the current directory before making changes.',
      'List files safely.',
      'Read a file without modifying it.'
    ],
    commands: [
      {
        title: 'Print Working Directory',
        explanation: 'Before editing configs or scripts on a server, confirm where you are. Many incidents start with a command run in the wrong directory.',
        command: 'pwd',
        output: '/devops-sandbox'
      },
      {
        title: 'List Directory Contents',
        explanation: 'ls gives a quick inventory of available files. Operators use it before reading or editing config.',
        command: 'ls',
        acceptedCommands: ['dir'],
        output: 'README.md\napp.conf\nscripts/'
      },
      {
        title: 'Read the README',
        explanation: 'cat is a read-only inspection command. Read before changing.',
        command: 'cat README.md',
        output: '# DevOps Sandbox\nUse this directory to perform your quest tasks, run commands, and practice configurations.'
      }
    ]
  }),
  createQuest({
    id: 'linux_permissions_deep',
    title: 'Permissions, Ownership, and Executable Bits',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Make a script executable and explain the permission string.',
    skillOutcomes: [
      'Read rwx permission bits.',
      'Use chmod intentionally.',
      'Understand why scripts fail with permission denied.'
    ],
    commands: [
      {
        title: 'Create a Script',
        explanation: 'New script files are often not executable by default. That is a safety feature.',
        command: 'echo "echo checks ok" > run_check.sh',
        output: 'Wrote run_check.sh.'
      },
      {
        title: 'Inspect Permissions',
        explanation: 'The first column in ls -l shows file type and read/write/execute permissions for owner, group, and others.',
        command: 'ls -l run_check.sh',
        output: '-rw-r--r-- 1 student devops 15 May 25 17:00 run_check.sh'
      },
      {
        title: 'Grant Execute Permission',
        explanation: 'chmod 755 grants owner read/write/execute and group/others read/execute. That is common for runnable scripts.',
        command: 'chmod 755 run_check.sh',
        acceptedCommands: ['chmod +x run_check.sh'],
        output: 'Updated permissions for run_check.sh.'
      },
      {
        title: 'Run the Script',
        explanation: 'Executing the script confirms both the permission bit and the script contents.',
        command: './run_check.sh',
        output: 'checks ok'
      }
    ],
    localValidatorKey: 'linux_permissions'
  }),
  createQuest({
    id: 'linux_process_triage',
    title: 'Process Triage',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Inspect running processes and identify the application service.',
    skillOutcomes: [
      'Read process lists.',
      'Find service commands.',
      'Recognize CPU and memory clues.'
    ],
    commands: [
      {
        title: 'List Processes',
        explanation: 'ps aux is a common first look during server triage. It shows process owner, PID, CPU, memory, and command.',
        command: 'ps aux',
        output: 'USER       PID %CPU %MEM COMMAND\nroot         1  0.0  0.1 init\nstudent     42  1.2  2.4 node server.js\nstudent     77  0.3  1.1 python worker.py'
      },
      {
        title: 'Filter for Node',
        explanation: 'Combining ps with grep narrows the process list to the service you are investigating.',
        command: 'ps aux | grep node',
        output: 'student     42  1.2  2.4 node server.js'
      }
    ]
  }),
  createQuest({
    id: 'linux_disk_memory',
    title: 'Disk and Memory Triage',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Use capacity commands to identify resource pressure.',
    skillOutcomes: [
      'Inspect filesystem capacity.',
      'Find large directories.',
      'Read memory availability signals.'
    ],
    commands: [
      {
        title: 'Check Filesystem Capacity',
        explanation: 'df -h shows mounted filesystems and how full they are. Full disks can break logs, databases, package installs, and deployments.',
        command: 'df -h',
        output: 'Filesystem Size Used Avail Use%\n/dev/sda1 40G 36G 4G 90%'
      },
      {
        title: 'Find Directory Usage',
        explanation: 'du helps find which directory is consuming space. Operators often start with /var/log, app data, and build caches.',
        command: 'du -sh /var/log',
        output: '3.2G /var/log'
      },
      {
        title: 'Check Memory',
        explanation: 'free -m shows available memory and swap. Low available memory can cause restarts or OOM kills.',
        command: 'free -m',
        output: 'Mem:  total 3950 used 2100 free 600 available 1400\nSwap: total 2048 used 0 free 2048'
      }
    ]
  }),
  createQuest({
    id: 'linux_text_pipeline',
    title: 'Text Pipelines for Log Evidence',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Extract useful evidence from access logs with shell tools.',
    skillOutcomes: [
      'Use grep to find error lines.',
      'Use sort and uniq to summarize repeated events.',
      'Build a small incident evidence pipeline.'
    ],
    commands: [
      {
        title: 'Create Access Log',
        explanation: 'Logs are operational evidence. Pipelines let you reduce thousands of lines into one useful signal.',
        command: 'echo "GET / 200\nGET /admin 403\nPOST /deploy 500\nPOST /deploy 500" > access.log',
        output: 'Wrote access.log.'
      },
      {
        title: 'Find Server Errors',
        explanation: 'grep 500 isolates failed requests that likely need investigation.',
        command: 'grep 500 access.log',
        output: 'POST /deploy 500\nPOST /deploy 500'
      },
      {
        title: 'Summarize Repeated Failures',
        explanation: 'sort and uniq -c reveal repeated failure patterns, which are more useful than a raw stream.',
        command: 'grep 500 access.log | sort | uniq -c',
        output: '2 POST /deploy 500'
      }
    ]
  }),
  createQuest({
    id: 'linux_bash_strict_mode',
    title: 'Bash Strict Mode Script',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Write a safer shell script that fails early and clearly.',
    skillOutcomes: [
      'Use set -euo pipefail.',
      'Accept script arguments.',
      'Explain why silent shell failures are dangerous.'
    ],
    commands: [
      {
        title: 'Write Strict Script',
        explanation: 'set -euo pipefail makes many shell mistakes fail early instead of continuing with bad assumptions.',
        command: 'echo "set -euo pipefail\necho deploying ${1:-staging}" > deploy.sh',
        output: 'Wrote deploy.sh.'
      },
      {
        title: 'Make Script Executable',
        explanation: 'Operational scripts need explicit execute permissions.',
        command: 'chmod +x deploy.sh',
        output: 'Updated permissions for deploy.sh.'
      },
      {
        title: 'Run with an Argument',
        explanation: 'Arguments make scripts reusable across environments while keeping behavior explicit.',
        command: './deploy.sh production',
        output: 'deploying production'
      }
    ]
  }),
  createQuest({
    id: 'linux_cron_logs',
    title: 'Cron Scheduling and Log Output',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Model a scheduled backup job with explicit logging.',
    skillOutcomes: [
      'Read cron timing syntax.',
      'Redirect job output to logs.',
      'Explain why scheduled jobs need observable output.'
    ],
    commands: [
      {
        title: 'Write Cron Entry',
        explanation: 'Cron jobs should include schedule, command, and log redirection so failures are visible later.',
        command: 'echo "*/5 * * * * /opt/backup.sh >> /var/log/backup.log 2>&1" > backup.cron',
        output: 'Wrote backup.cron.'
      },
      {
        title: 'Review Cron Entry',
        explanation: 'This job runs every five minutes and appends both stdout and stderr to the same log.',
        command: 'cat backup.cron',
        output: '*/5 * * * * /opt/backup.sh >> /var/log/backup.log 2>&1'
      }
    ]
  }),
  createQuest({
    id: 'linux_systemd_unit',
    title: 'Systemd Unit Anatomy',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Create and inspect a minimal service unit.',
    skillOutcomes: [
      'Identify Unit, Service, and Install sections.',
      'Read service status output.',
      'Understand restart policy basics.'
    ],
    commands: [
      {
        title: 'Write Service Unit',
        explanation: 'Systemd units define how long-running services start, restart, and integrate with boot targets.',
        command: 'echo "[Unit]\nDescription=Demo API\n[Service]\nExecStart=/usr/bin/node /srv/api.js\nRestart=always\n[Install]\nWantedBy=multi-user.target" > api.service',
        output: 'Wrote api.service.'
      },
      {
        title: 'Inspect Service Unit',
        explanation: 'Review service files before enabling them; one wrong ExecStart path can prevent startup.',
        command: 'cat api.service',
        output: '[Unit]\nDescription=Demo API\n[Service]\nExecStart=/usr/bin/node /srv/api.js\nRestart=always\n[Install]\nWantedBy=multi-user.target'
      },
      {
        title: 'Check Service Status',
        explanation: 'systemctl status summarizes active state and recent logs, making it a central service triage command.',
        command: 'systemctl status api.service',
        output: 'api.service - Demo API\n   Loaded: loaded\n   Active: active (running)\n Main PID: 42 (node)'
      }
    ]
  }),
  createQuest({
    id: 'linux_ssh_keys',
    title: 'SSH Key and Remote Command Pattern',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Model safe SSH key usage and a read-only remote check.',
    skillOutcomes: [
      'Explain key-based access.',
      'Avoid copying private keys into repos.',
      'Run remote inspection commands safely.'
    ],
    commands: [
      {
        title: 'Create Public Key Placeholder',
        explanation: 'Only public keys belong in authorized_keys. Private keys must stay secret and protected.',
        command: 'echo "ssh-ed25519 AAAAC3NzaDemo student@workstation" > id_ed25519.pub',
        output: 'Wrote id_ed25519.pub.'
      },
      {
        title: 'Append Authorized Key',
        explanation: 'authorized_keys grants access to accounts. Treat edits as sensitive security changes.',
        command: 'cat id_ed25519.pub >> authorized_keys',
        output: 'Appended public key to authorized_keys.'
      },
      {
        title: 'Run Remote Inspection',
        explanation: 'A safe first remote command is read-only, such as hostname or uptime, before making changes.',
        command: 'ssh ops@server hostname',
        output: 'prod-api-01'
      }
    ]
  }),
  createQuest({
    id: 'linux_backup_restore',
    title: 'Backup and Restore with Verification',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Create a backup, restore it, and verify the restored content.',
    skillOutcomes: [
      'Treat restore verification as part of backup work.',
      'Use archives for repeatable backup artifacts.',
      'Explain why untested backups are only assumptions.'
    ],
    commands: [
      {
        title: 'Create Data File',
        explanation: 'A backup exercise needs known content so restore verification is meaningful.',
        command: 'echo "customer_count=42" > data.txt',
        output: 'Wrote data.txt.'
      },
      {
        title: 'Create Archive',
        explanation: 'tar archives files into a portable backup artifact.',
        command: 'tar -czf backup.tar.gz data.txt',
        output: 'Created backup.tar.gz.'
      },
      {
        title: 'Restore Archive',
        explanation: 'Backups are not proven until the restore path works.',
        command: 'tar -xzf backup.tar.gz',
        output: 'Restored data.txt.'
      },
      {
        title: 'Verify Restored Data',
        explanation: 'Verification closes the loop: the restored data matches the expected operational value.',
        command: 'cat data.txt',
        output: 'customer_count=42'
      }
    ],
    localValidatorKey: 'bash_backup'
  }),
  createQuest({
    id: 'linux_failure_modes',
    title: 'Troubleshoot Permission, Port, and Disk Failures',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Read symptoms and select the right Linux inspection command.',
    skillOutcomes: [
      'Map symptoms to commands.',
      'Separate permission failures from port conflicts.',
      'Use disk checks before chasing application bugs.'
    ],
    commands: [
      {
        title: 'Inspect Permission Failure',
        explanation: 'Permission denied errors should lead you to ls -l and ownership checks before code changes.',
        command: 'ls -l deploy.sh',
        output: '-rw-r--r-- 1 student devops 31 May 25 17:30 deploy.sh'
      },
      {
        title: 'Inspect Port Usage',
        explanation: 'Address already in use usually means another process is listening on the same port.',
        command: 'ss -tulpn',
        acceptedCommands: ['netstat -tulpn'],
        output: 'LISTEN 0 128 0.0.0.0:3000 users:(("node",pid=42))'
      },
      {
        title: 'Inspect Disk Pressure',
        explanation: 'Disk-full errors can surface as app write failures, database errors, or broken deployments.',
        command: 'df -h',
        output: 'Filesystem Size Used Avail Use%\n/dev/sda1 40G 39G 1G 98%'
      }
    ]
  }),
  createQuest({
    id: 'linux_service_capstone',
    title: 'Capstone: Recover a Failing Linux Service',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Use status, logs, permissions, and restart commands to recover a failing service.',
    prerequisites: [
      'linux_permissions_deep',
      'linux_process_triage',
      'linux_disk_memory',
      'linux_systemd_unit'
    ],
    skillOutcomes: [
      'Diagnose a failed service using evidence.',
      'Fix executable permissions.',
      'Restart and verify service recovery.'
    ],
    commands: [
      {
        title: 'Check Service Status',
        explanation: 'Start with service state. It tells you whether the process is running, failed, or repeatedly restarting.',
        command: 'systemctl status api.service',
        output: 'api.service - Demo API\n   Loaded: loaded\n   Active: failed\n  Process: 42 ExecStart=/srv/start-api.sh\n  Error: Permission denied'
      },
      {
        title: 'Read Service Logs',
        explanation: 'journalctl shows recent service logs. Here it confirms the failure is permission-related, not network or code.',
        command: 'journalctl -u api.service -n 20',
        output: 'api.service: Failed to execute /srv/start-api.sh: Permission denied'
      },
      {
        title: 'Fix Script Permissions',
        explanation: 'The service cannot execute its startup script. Grant execute permission before restarting.',
        command: 'chmod +x /srv/start-api.sh',
        output: 'Updated permissions for /srv/start-api.sh.'
      },
      {
        title: 'Restart the Service',
        explanation: 'Restart only after the suspected root cause has been fixed.',
        command: 'systemctl restart api.service',
        output: 'Restarted api.service.'
      },
      {
        title: 'Verify Recovery',
        explanation: 'Never stop at restart. Check the service state after the action.',
        command: 'systemctl status api.service',
        output: 'api.service - Demo API\n   Loaded: loaded\n   Active: active (running)\n Main PID: 108 (node)'
      }
    ]
  })
];

export const linuxModule = createModule({
  id: 3,
  title: 'Linux & Scripting',
  icon: 'terminal',
  description: 'Operate Linux systems and automate routine administration tasks.',
  detailedInfo: 'Linux is the runtime foundation for most servers, containers, CI runners, and Kubernetes nodes. This module trains the inspection habits behind real operations: paths, permissions, processes, disk, logs, services, scheduling, SSH, backups, and recovery.',
  outcomes: [
    'Inspect files, processes, permissions, logs, and services.',
    'Use shell pipelines for operational investigation.',
    'Automate repeatable administration tasks safely.',
    'Recover a failing service using evidence instead of guessing.'
  ],
  resources: [
    { name: 'Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/', free: true },
    { name: 'Linux Command Handbook', url: 'https://www.freecodecamp.org/news/the-linux-commands-handbook/', free: true },
    { name: 'systemd Documentation', url: 'https://www.freedesktop.org/wiki/Software/systemd/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Linux and Scripting', [
    {
      question: 'Why should you run pwd before changing files on a server?',
      options: ['To confirm command location and avoid editing the wrong path', 'To restart services', 'To compress logs', 'To change permissions automatically'],
      answerIndex: 0,
      explanation: 'Knowing the current directory prevents accidental edits in the wrong part of the filesystem.'
    },
    {
      question: 'What does the x bit allow on a script?',
      options: ['Reading only', 'Execution', 'DNS lookup', 'Disk compression'],
      answerIndex: 1,
      explanation: 'Execute permission is required to run a file as a program or script.'
    },
    {
      question: 'What is a common first command for service process triage?',
      options: ['ps aux', 'git tag', 'terraform apply', 'docker push'],
      answerIndex: 0,
      explanation: 'ps aux shows running processes and their resource usage.'
    },
    {
      question: 'Why is df -h useful during incidents?',
      options: ['It shows filesystem capacity in human-readable units', 'It creates SSH keys', 'It edits Nginx config', 'It runs unit tests'],
      answerIndex: 0,
      explanation: 'Disk pressure can break logs, databases, deployments, and package operations.'
    },
    {
      question: 'What does set -euo pipefail improve?',
      options: ['Shell script failure behavior', 'Git remote URLs', 'Kubernetes replica count', 'Cloud billing tags'],
      answerIndex: 0,
      explanation: 'Strict mode helps scripts fail earlier when commands, variables, or pipelines fail.'
    },
    {
      question: 'Why should cron jobs redirect logs?',
      options: ['So scheduled failures can be investigated later', 'So they never run', 'So they become Docker images', 'So Git ignores them'],
      answerIndex: 0,
      explanation: 'Scheduled jobs often run unattended; logs are how you know what happened.'
    },
    {
      question: 'What command family is central for systemd service state?',
      options: ['systemctl and journalctl', 'git fetch and git push', 'aws s3api', 'npm install'],
      answerIndex: 0,
      explanation: 'systemctl shows service state; journalctl shows service logs.'
    },
    {
      question: 'What proves a backup is trustworthy?',
      options: ['A verified restore', 'A filename alone', 'A large archive size', 'A cron comment'],
      answerIndex: 0,
      explanation: 'Backups are only assumptions until restore and verification succeed.'
    }
  ])
});

