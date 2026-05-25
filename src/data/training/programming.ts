import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'prog_cli_exit_codes',
    title: 'Python CLI Exit Codes and Streams',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Write a CLI script that prints useful output and exits correctly for automation.',
    skillOutcomes: [
      'Explain why CI jobs care about exit codes.',
      'Separate normal output from error output.',
      'Run a Python script as an operational command.'
    ],
    commands: [
      {
        title: 'Create a CLI Script',
        explanation: 'Automation scripts should behave like real command-line tools: clear output, deterministic exit status, and no hidden manual steps.',
        command: 'echo "import sys; print(\'deploy check ok\'); sys.exit(0)" > check_deploy.py',
        output: 'Wrote check_deploy.py.',
        commonMistakes: [
          {
            commandPattern: 'exit 1',
            feedback: 'Exit code 1 marks the job as failed. This first check should model a successful command.'
          }
        ]
      },
      {
        title: 'Run the Script',
        explanation: 'A zero exit code means a shell, CI runner, or scheduler can treat the script as successful.',
        command: 'python check_deploy.py',
        acceptedCommands: ['python3 check_deploy.py'],
        output: 'deploy check ok'
      },
      {
        title: 'Inspect the Exit Code',
        explanation: 'Operators often check the previous command result before continuing in a script.',
        command: 'echo $?',
        output: '0'
      }
    ],
    localValidatorKey: 'py_health'
  }),
  createQuest({
    id: 'prog_log_parser',
    title: 'Parse Deployment Logs',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Count failed deployment events from a mock log file.',
    skillOutcomes: [
      'Read a text file from Python.',
      'Extract an operational signal from logs.',
      'Print a small result that another tool can consume.'
    ],
    commands: [
      {
        title: 'Create a Deployment Log',
        explanation: 'Logs are raw operational evidence. Before dashboards and alerts, you need to be comfortable reducing text into signal.',
        command: 'echo "INFO deploy started\nERROR health check failed\nINFO rollback started" > deploy.log',
        output: 'Wrote deploy.log with three events.'
      },
      {
        title: 'Write an Error Counter',
        explanation: 'This parser uses the simplest useful pattern: read text, search for a marker, and print a count.',
        command: 'echo "print(open(\'deploy.log\').read().count(\'ERROR\'))" > parse_logs.py',
        output: 'Wrote parse_logs.py.'
      },
      {
        title: 'Run the Parser',
        explanation: 'A numeric output can become a CI gate, alert threshold, or incident report field.',
        command: 'python parse_logs.py',
        acceptedCommands: ['python3 parse_logs.py'],
        output: '1'
      }
    ]
  }),
  createQuest({
    id: 'prog_json_health_report',
    title: 'Generate a JSON Health Report',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Emit structured JSON that a pipeline or monitoring tool can parse.',
    skillOutcomes: [
      'Use JSON as a machine-readable automation boundary.',
      'Represent service status with stable keys.',
      'Avoid free-form output when another tool needs the result.'
    ],
    commands: [
      {
        title: 'Write the JSON Producer',
        explanation: 'Structured output is easier to pass between scripts, CI jobs, dashboards, and incident tools.',
        command: 'echo "import json; print(json.dumps({\'service\':\'api\',\'status\':\'ok\',\'latency_ms\':42}))" > health_report.py',
        output: 'Wrote health_report.py.'
      },
      {
        title: 'Run the Health Report',
        explanation: 'The script prints one JSON object with predictable keys.',
        command: 'python health_report.py',
        acceptedCommands: ['python3 health_report.py'],
        output: '{"service": "api", "status": "ok", "latency_ms": 42}'
      }
    ]
  }),
  createQuest({
    id: 'prog_yaml_validator',
    title: 'Validate a YAML-like Config',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Catch a missing deployment key before a bad config reaches a pipeline.',
    skillOutcomes: [
      'Treat config validation as a deployment safety gate.',
      'Fail fast when required keys are absent.',
      'Explain why validation belongs before apply/deploy steps.'
    ],
    commands: [
      {
        title: 'Create a Config File',
        explanation: 'Config files are production inputs. A small typo can change ports, images, or credentials.',
        command: 'echo "service: api\nreplicas: 3\nimage: api:v1" > deploy.yml',
        output: 'Wrote deploy.yml.'
      },
      {
        title: 'Write the Validator',
        explanation: 'This mock validator checks for required keys. Real projects might use schemas, pydantic, kubeconform, or policy-as-code.',
        command: 'echo "text=open(\'deploy.yml\').read(); required=[\'service:\',\'replicas:\',\'image:\']; missing=[k for k in required if k not in text]; print(\'valid\' if not missing else missing)" > validate_config.py',
        output: 'Wrote validate_config.py.',
        commonMistakes: [
          {
            commandPattern: 'cat deploy.yml',
            feedback: 'Reading the config is useful, but this step needs an automated validation script.'
          }
        ]
      },
      {
        title: 'Run Validation',
        explanation: 'A good validation step produces a simple pass/fail signal before infrastructure or deploy commands run.',
        command: 'python validate_config.py',
        acceptedCommands: ['python3 validate_config.py'],
        output: 'valid'
      }
    ]
  }),
  createQuest({
    id: 'prog_http_retry_checker',
    title: 'HTTP Health Check with Timeout and Retry',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Model a health checker that retries transient failures without hanging forever.',
    skillOutcomes: [
      'Explain why network automation needs timeouts.',
      'Use retry attempts deliberately.',
      'Return a clear status for CI or monitoring.'
    ],
    commands: [
      {
        title: 'Write the Health Checker',
        explanation: 'HTTP checks without timeouts can hang CI jobs and incident scripts. Retry helps with transient network faults, but it must be bounded.',
        command: 'echo "for attempt in range(1,4): print(f\'attempt {attempt}: 200 OK\'); break" > http_check.py',
        output: 'Wrote http_check.py.'
      },
      {
        title: 'Run the Checker',
        explanation: 'The output shows the first successful attempt. In a real script you would use urllib or requests with timeout values.',
        command: 'python http_check.py',
        acceptedCommands: ['python3 http_check.py'],
        output: 'attempt 1: 200 OK'
      }
    ]
  }),
  createQuest({
    id: 'prog_config_drift',
    title: 'Detect Configuration Drift',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Compare desired and actual configuration values.',
    skillOutcomes: [
      'Define desired state and actual state.',
      'Detect drift before it becomes an outage.',
      'Print remediation-friendly output.'
    ],
    commands: [
      {
        title: 'Create Desired Config',
        explanation: 'Desired state is what source control says the system should look like.',
        command: 'echo "replicas=3\nversion=v2" > desired.conf',
        output: 'Wrote desired.conf.'
      },
      {
        title: 'Create Actual Config',
        explanation: 'Actual state is what is really running. Drift exists when actual differs from desired.',
        command: 'echo "replicas=2\nversion=v2" > actual.conf',
        output: 'Wrote actual.conf.'
      },
      {
        title: 'Write Drift Detector',
        explanation: 'A drift detector gives operators a targeted mismatch instead of vague symptoms.',
        command: 'echo "d=open(\'desired.conf\').read().splitlines(); a=open(\'actual.conf\').read().splitlines(); print([x for x in d if x not in a])" > drift.py',
        output: 'Wrote drift.py.'
      },
      {
        title: 'Run Drift Detector',
        explanation: 'The output identifies the desired line that is missing from actual state.',
        command: 'python drift.py',
        acceptedCommands: ['python3 drift.py'],
        output: "['replicas=3']"
      }
    ]
  }),
  createQuest({
    id: 'prog_concurrent_checker',
    title: 'Concurrent Endpoint Checker',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Model checking multiple service endpoints without serial delay.',
    skillOutcomes: [
      'Explain when concurrency helps operations scripts.',
      'Represent per-service status.',
      'Avoid hiding partial failures.'
    ],
    commands: [
      {
        title: 'Create Endpoint List',
        explanation: 'Operational checks often run against multiple services, clusters, or regions.',
        command: 'echo "api\nworker\nfrontend" > services.txt',
        output: 'Wrote services.txt.'
      },
      {
        title: 'Write Concurrent Checker',
        explanation: 'This simulation prints concurrent-style results. A real implementation might use asyncio or a thread pool.',
        command: 'echo "for svc in open(\'services.txt\'): print(svc.strip()+\': ok\')" > check_many.py',
        output: 'Wrote check_many.py.'
      },
      {
        title: 'Run Multi-Service Check',
        explanation: 'The important behavior is per-service output. One failure should not erase visibility into other services.',
        command: 'python check_many.py',
        acceptedCommands: ['python3 check_many.py'],
        output: 'api: ok\nworker: ok\nfrontend: ok'
      }
    ]
  }),
  createQuest({
    id: 'prog_deploy_report',
    title: 'Build a Deployment Report',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Combine version, test, and runtime evidence into one release report.',
    skillOutcomes: [
      'Gather evidence from multiple files.',
      'Produce a release summary for humans and automation.',
      'Explain why release reports improve auditability.'
    ],
    commands: [
      {
        title: 'Create Release Inputs',
        explanation: 'Real release decisions use many signals: version, tests, image, target, and previous incidents.',
        command: 'echo "version=v1.4.0" > version.txt',
        output: 'Wrote version.txt.'
      },
      {
        title: 'Create Test Result',
        explanation: 'A release report should include verification status, not just version numbers.',
        command: 'echo "tests=passed" > tests.txt',
        output: 'Wrote tests.txt.'
      },
      {
        title: 'Write Report Builder',
        explanation: 'The script joins evidence into one concise deployment summary.',
        command: 'echo "print(open(\'version.txt\').read().strip()+\' \'+open(\'tests.txt\').read().strip())" > deploy_report.py',
        output: 'Wrote deploy_report.py.'
      },
      {
        title: 'Generate Report',
        explanation: 'This output is suitable for a pipeline log, release note, or deployment approval summary.',
        command: 'python deploy_report.py',
        acceptedCommands: ['python3 deploy_report.py'],
        output: 'version=v1.4.0 tests=passed'
      }
    ]
  }),
  createQuest({
    id: 'prog_script_unit_tests',
    title: 'Unit Test an Automation Function',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Write a tiny test for automation logic before trusting it in CI.',
    skillOutcomes: [
      'Separate reusable logic from script entrypoints.',
      'Write a focused test for operational behavior.',
      'Use tests as confidence for future refactors.'
    ],
    commands: [
      {
        title: 'Create Automation Logic',
        explanation: 'Testable automation keeps logic in functions. Entry-point code can then call those functions.',
        command: 'echo "def is_healthy(code): return code == 200" > healthlib.py',
        output: 'Wrote healthlib.py.'
      },
      {
        title: 'Write a Unit Test',
        explanation: 'This test captures the behavior that a 200 response is healthy and a 500 response is not.',
        command: 'echo "from healthlib import is_healthy\nassert is_healthy(200)\nassert not is_healthy(500)\nprint(\'tests passed\')" > test_healthlib.py',
        output: 'Wrote test_healthlib.py.',
        commonMistakes: [
          {
            commandPattern: 'python healthlib.py',
            feedback: 'Running the library alone does not prove behavior. Run the test file.'
          }
        ]
      },
      {
        title: 'Run the Test',
        explanation: 'A small test now protects this automation function from future accidental changes.',
        command: 'python test_healthlib.py',
        acceptedCommands: ['python3 test_healthlib.py'],
        output: 'tests passed'
      }
    ]
  }),
  createQuest({
    id: 'prog_incident_triage_capstone',
    title: 'Capstone: Mini Incident Triage Tool',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Build a script that combines logs, health, and drift evidence into one incident summary.',
    prerequisites: [
      'prog_log_parser',
      'prog_json_health_report',
      'prog_config_drift',
      'prog_deploy_report'
    ],
    skillOutcomes: [
      'Combine multiple operational signals.',
      'Prioritize incident evidence.',
      'Create a concise triage summary.'
    ],
    commands: [
      {
        title: 'Create Incident Log',
        explanation: 'The capstone starts with evidence from a failing production-like deployment.',
        command: 'echo "ERROR api 500\nERROR api 500\nINFO rollback queued" > incident.log',
        output: 'Wrote incident.log.'
      },
      {
        title: 'Create Runtime State',
        explanation: 'Incident tools should combine log evidence with runtime facts.',
        command: 'echo "service=api status=degraded desired=3 actual=2" > runtime.state',
        output: 'Wrote runtime.state.'
      },
      {
        title: 'Write Triage Script',
        explanation: 'A triage script should summarize impact and next action without hiding the raw signal.',
        command: 'echo "errors=open(\'incident.log\').read().count(\'ERROR\'); state=open(\'runtime.state\').read(); print(f\'errors={errors} {state} action=rollback-and-scale\')" > triage.py',
        output: 'Wrote triage.py.'
      },
      {
        title: 'Run Triage',
        explanation: 'The summary includes error count, degraded status, replica drift, and a suggested action.',
        command: 'python triage.py',
        acceptedCommands: ['python3 triage.py'],
        output: 'errors=2 service=api status=degraded desired=3 actual=2 action=rollback-and-scale'
      }
    ]
  })
];

export const programmingModule = createModule({
  id: 2,
  title: 'Programming Language',
  icon: 'code',
  description: 'Write reliable automation scripts for DevOps workflows.',
  detailedInfo: 'DevOps engineers use programming to automate checks, parse logs, call APIs, generate reports, and build operational tools. This module uses Python-style simulations because Python is common in operations, CI, cloud automation, and incident tooling.',
  outcomes: [
    'Write CLI scripts with useful output and exit behavior.',
    'Parse logs and structured files.',
    'Build small automation tools that can run inside CI/CD.',
    'Test automation logic before depending on it in delivery systems.'
  ],
  resources: [
    { name: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com/', free: true },
    { name: 'Python Crash Course', url: 'https://ehmatthes.github.io/pcc/', free: true },
    { name: 'Go by Example', url: 'https://gobyexample.com/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Programming for DevOps', [
    {
      question: 'Why do automation scripts need meaningful exit codes?',
      options: ['CI and schedulers use exit codes to decide success or failure', 'Exit codes only change text color', 'They are required only on Windows', 'They replace logs entirely'],
      answerIndex: 0,
      explanation: 'Exit code 0 normally means success; non-zero tells callers that the automation failed.'
    },
    {
      question: 'Which output style is best when another tool must parse the result?',
      options: ['Random prose', 'A screenshot', 'Stable structured data such as JSON', 'Only emojis'],
      answerIndex: 2,
      explanation: 'Stable keys and values make downstream automation reliable.'
    },
    {
      question: 'Why should HTTP automation use timeouts?',
      options: ['To make scripts slower', 'To prevent commands from hanging forever', 'To skip DNS', 'To hide failures'],
      answerIndex: 1,
      explanation: 'Timeouts bound failure time and keep CI or incident scripts responsive.'
    },
    {
      question: 'What is configuration drift?',
      options: ['When actual state differs from desired state', 'When a script prints JSON', 'When a branch is merged', 'When logs rotate'],
      answerIndex: 0,
      explanation: 'Drift means the running system no longer matches the source-controlled or declared desired state.'
    },
    {
      question: 'Why test automation functions?',
      options: ['To slow down releases', 'To prove behavior and protect future changes', 'To avoid writing functions', 'To remove exit codes'],
      answerIndex: 1,
      explanation: 'Tests turn operational assumptions into executable checks.'
    },
    {
      question: 'What should a triage tool optimize for during an incident?',
      options: ['Long decorative output', 'Clear evidence and next action', 'Hiding partial failures', 'Manual copy-paste only'],
      answerIndex: 1,
      explanation: 'Incident tooling should reduce time to understand impact and choose the next safe step.'
    },
    {
      question: 'When is concurrency useful in DevOps scripts?',
      options: ['When checking many independent services or regions', 'When there is only one local file', 'When output order must be secret', 'Never'],
      answerIndex: 0,
      explanation: 'Concurrent checks reduce wait time for independent network or service probes.'
    },
    {
      question: 'What makes a deployment report useful?',
      options: ['It combines version, test, and runtime evidence', 'It contains no verification', 'It is only a filename', 'It deletes logs'],
      answerIndex: 0,
      explanation: 'A release report should summarize the evidence used to decide whether a deployment is safe.'
    }
  ])
});

