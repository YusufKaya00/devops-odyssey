import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'cicd_pipeline_anatomy',
    title: 'Pipeline Anatomy: Triggers and Jobs',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Define a basic workflow pipeline triggered by repository push events.',
    skillOutcomes: [
      'Understand pipeline configuration structures.',
      'Configure triggers using on: push.',
      'Define jobs and runner environments.'
    ],
    commands: [
      {
        title: 'Create Pipeline File',
        explanation: 'Workflows reside in .github/workflows/ directory in YAML format. Triggers define when actions start running.',
        command: 'echo "on: [push] jobs: build: { runs-on: ubuntu-latest, steps: [ { name: Hello, run: echo hello } ] }" > workflow.yml',
        output: 'Wrote workflow.yml.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_build_stage',
    title: 'Pipeline Build Stage',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Append compilation and code build steps to the pipeline.',
    skillOutcomes: [
      'Define build steps in YAML.',
      'Restore packages before building.',
      'Generate static build artifacts.'
    ],
    commands: [
      {
        title: 'Append Build Steps',
        explanation: 'Before deploying, code must be compiled and dependencies retrieved to check if the app builds.',
        command: 'echo "run: npm ci && npm run build" >> workflow.yml',
        output: 'Appended build command.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_test_gate',
    title: 'Test Gates and Failures',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Integrate test runners to intercept and block broken builds.',
    skillOutcomes: [
      'Configure test gates inside pipelines.',
      'Understand exit codes blocking subsequent stages.',
      'Read failing test logs.'
    ],
    commands: [
      {
        title: 'Add Test Script Target',
        explanation: 'Integrating testing commands ensures that commits breaking unit tests fail the runner instantly, halting deployment.',
        command: 'echo "run: npm test" >> workflow.yml',
        output: 'Appended test command.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_artifacts',
    title: 'Artifact Upload and Download',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Persist built binaries and packages using workflow artifacts.',
    skillOutcomes: [
      'Persist compiled assets across stages.',
      'Use upload-artifact configurations.',
      'Download artifacts for deployment tasks.'
    ],
    commands: [
      {
        title: 'Add Artifact Upload Step',
        explanation: 'Virtual environments wipe out after job completion. Uploading artifacts stores files (like dist directories) securely for deployment jobs.',
        command: 'echo "uses: actions/upload-artifact@v4 with: { name: dist, path: dist/ }" >> workflow.yml',
        output: 'Appended artifact upload.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_dependency_cache',
    title: 'Caching Build Dependencies',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Implement dependency caches to accelerate step execution times.',
    skillOutcomes: [
      'Configure build cache targets.',
      'Create dynamic cache keys.',
      'Reduce pipeline network bandwidth and runtime costs.'
    ],
    commands: [
      {
        title: 'Configure Dependency Cache',
        explanation: 'Caching node_modules prevents the pipeline from downloading packages from scratch on every run, saving minutes.',
        command: 'echo "uses: actions/cache@v4 with: { path: ~/.npm, key: npm-cache }" >> workflow.yml',
        output: 'Appended cache config.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_env_secrets',
    title: 'Environment Secrets Handling',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Reference sensitive API credentials securely inside pipeline builds.',
    skillOutcomes: [
      'Map environment secrets safely.',
      'Understand GitHub Secrets context references.',
      'Prevent logging tokens to console output.'
    ],
    commands: [
      {
        title: 'Inject Pipeline Secret',
        explanation: 'Access secrets stored in repository settings using double curly-braces syntax, preventing exposure in source code.',
        command: 'echo "env: { DB_PASS: ${{ secrets.DB_PASS }} }" >> workflow.yml',
        output: 'Appended secret reference.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_matrix_jobs',
    title: 'Parallel Matrix Strategies',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Execute validation playbooks across multiple runtime environments in parallel.',
    skillOutcomes: [
      'Configure matrix strategies.',
      'Define multi-version testing rules.',
      'Understand parallel execution paths.'
    ],
    commands: [
      {
        title: 'Define Version Matrix',
        explanation: 'Matrix strategies automatically trigger parallel job instantiations for each parameter (e.g. testing Node 18, 20, and 22).',
        command: 'echo "strategy: { matrix: { node-version: [18, 20, 22] } }" >> workflow.yml',
        output: 'Appended matrix config.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_manual_approval',
    title: 'Manual Approval Gates',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Enable deployment protection rules to block pipeline releases until manual reviews pass.',
    skillOutcomes: [
      'Configure protected environments.',
      'Add manual approval gate rules.',
      'Verify release security approvals.'
    ],
    commands: [
      {
        title: 'Link Environment Protection',
        explanation: 'Binding jobs to an environment (like production) prompts the pipeline engine to hold execution until human reviewers click approve.',
        command: 'echo "environment: production" >> workflow.yml',
        output: 'Appended environment environment.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_staging_deploy',
    title: 'Deployment to Staging',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Trigger automated deployment steps targeting staging servers.',
    skillOutcomes: [
      'Configure staging release steps.',
      'Automate target server uploads.',
      'Verify post-deploy health.'
    ],
    commands: [
      {
        title: 'Append Staging Deploy Command',
        explanation: 'Deploying automatically to staging enables continuous delivery verification before production approval checks.',
        command: 'echo "run: npm run deploy:staging" >> workflow.yml',
        output: 'Appended deployment script.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_rollback',
    title: 'Rollback Workflows',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Implement automatic redial-back plans to re-deploy previous versions if verification checks fail.',
    skillOutcomes: [
      'Implement deployment rollbacks.',
      'Listen to exit codes to trigger rollbacks.',
      'Expose version tracking values.'
    ],
    commands: [
      {
        title: 'Add Rollback Trigger',
        explanation: 'If integration checks fail in production, trigger a rollback script immediately to restore service uptime.',
        command: 'echo "run: npm run deploy:rollback" >> workflow.yml',
        output: 'Appended rollback script.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_security_scan',
    title: 'Security Scanning Gate',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Add security vulnerability testing tools into integration loops.',
    skillOutcomes: [
      'Configure static application security checks (SAST).',
      'Intercept builds containing high vulnerability scores.',
      'Build compliance rules in delivery pipelines.'
    ],
    commands: [
      {
        title: 'Add Security Scan Step',
        explanation: 'Scanning dependencies for CVE vulnerabilities prevents deploying unsecure modules to servers.',
        command: 'echo "run: npm run security-scan" >> workflow.yml',
        output: 'Appended security scan.'
      }
    ]
  }),
  createQuest({
    id: 'cicd_capstone_full_pipeline',
    title: 'Capstone: End-to-End Pipeline Delivery',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Assemble, commit, and verify a complete pipeline configuration encompassing building, testing, scanning, and deploying.',
    prerequisites: [
      'cicd_pipeline_anatomy',
      'cicd_test_gate',
      'cicd_artifacts',
      'cicd_env_secrets'
    ],
    skillOutcomes: [
      'Design comprehensive multi-stage delivery systems.',
      'Safeguard keys and credentials across runners.',
      'Implement validation gates protecting deployment endpoints.'
    ],
    commands: [
      {
        title: 'Read Pipeline Manifest',
        explanation: 'Verify that build, test, upload, and environment references are configured correctly.',
        command: 'cat workflow.yml',
        output: 'on: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test\n      - run: npm run security-scan\n      - run: npm run deploy:staging\n        env:\n          DB_PASS: ${{ secrets.DB_PASS }}'
      },
      {
        title: 'Add Workflow to Repository',
        explanation: 'Stage the workflow manifest files to prepare commits.',
        command: 'git add workflow.yml',
        output: 'Staged workflow.yml.'
      },
      {
        title: 'Commit and Deploy',
        explanation: 'Committing the code triggers the pipeline runner immediately to verify deployment gates.',
        command: 'git commit -m "ci: deploy automated pipeline"',
        output: '[main abc1234] ci: deploy automated pipeline\n 1 file changed, 14 insertions(+)'
      }
    ]
  })
];

export const cicdModule = createModule({
  id: 9,
  title: 'CI/CD Pipelines',
  icon: 'git-commit',
  description: 'Build safe delivery pipelines with tests, artifacts, secrets, approvals, and rollback.',
  detailedInfo: 'CI/CD automates verification and delivery so changes move through repeatable gates.',
  outcomes: [
    'Design build, test, scan, artifact, deploy, and rollback stages.',
    'Read failed job logs.',
    'Use secrets and environments safely.',
    'Build matrix tests and manual verification gates.'
  ],
  resources: [
    { name: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', free: true }
  ],
  quests,
  quiz: createConceptQuiz('CI/CD', [
    {
      question: 'What is the primary goal of Continuous Integration (CI)?',
      options: [
        'To frequently merge and automatically test code changes in a shared repository',
        'To write documentation',
        'To manually host static websites',
        'To register domain names'
      ],
      answerIndex: 0,
      explanation: 'CI focuses on automating testing and builds on commit push events, ensuring changes do not break main branches.'
    },
    {
      question: 'How do pipeline artifacts differ from build caches?',
      options: [
        'Artifacts store build outputs for deployment; caches speed up builds by storing intermediate dependencies',
        'Artifacts are encrypted secrets',
        'Caches are only for databases',
        'Artifacts are deleted on every commit push'
      ],
      answerIndex: 0,
      explanation: 'Caches persist dependency files (like npm packages) between runs to save time. Artifacts hold the actual compilation output.'
    },
    {
      question: 'Where should database passwords and API tokens be referenced in workflow files?',
      options: [
        'Referenced from environment secrets contexts (e.g. ${{ secrets.TOKEN }}), never written in plain text',
        'Hardcoded in the run command',
        'Exposed in build artifacts',
        'Written in the README.md'
      ],
      answerIndex: 0,
      explanation: 'Credentials must reside in secret managers or encrypted repository secrets, dynamically fetched by runner processes.'
    },
    {
      question: 'What does a matrix build strategy allow?',
      options: [
        'Executing tests against multiple version and runtime environments in parallel jobs',
        'Encrypting the source code files',
        'Bypassing manual review approvals',
        'Merging git conflicts automatically'
      ],
      answerIndex: 0,
      explanation: 'Matrix arrays prompt the runner engine to scale jobs horizontally, verifying compliance across multiple version profiles.'
    },
    {
      question: 'What happens if a test command returns exit code 1 inside a build pipeline?',
      options: [
        'The job fails immediately and blocks subsequent deploy stages',
        'The pipeline ignores it and proceeds',
        'The repository is deleted',
        'The server automatically restarts'
      ],
      answerIndex: 0,
      explanation: 'Non-zero exit codes represent failures. The running steps halt, preventing buggy builds from reaching servers.'
    },
    {
      question: 'Why configure manual approval gates for production environments?',
      options: [
        'To verify release schedules and check checklist compliance before applying modifications',
        'To make builds faster',
        'To bypass unit testing requirements',
        'To encrypt log outputs'
      ],
      answerIndex: 0,
      explanation: 'Human validation checks ensure business readiness, risk scoring, and security reviews before deploying changes.'
    },
    {
      question: 'What does a deployment rollback workflow do?',
      options: [
        'Automatically re-deploys the previous stable release version if verification health checks fail',
        'Deletes the Git repository history',
        'Restarts the developers local machine',
        'Builds a new docker image version'
      ],
      answerIndex: 0,
      explanation: 'Rollbacks restore system operations rapidly during bad releases by switching traffic back to the prior clean build.'
    },
    {
      question: 'What is SAST (Static Application Security Testing) inside a pipeline?',
      options: [
        'Scanning source code for vulnerabilities and security flaws before compiling',
        'Testing physical server power',
        'Checking DNS name resolution speeds',
        'Running penetration checks on the live site'
      ],
      answerIndex: 0,
      explanation: 'SAST tools check source code structures for security vulnerabilities and secrets leaks prior to package builds.'
    }
  ])
});
