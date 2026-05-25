import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'sw_sdlc_release_flow',
    title: 'SDLC Models and Release Flow',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Document the sequential phases of the Software Development Life Cycle.',
    skillOutcomes: [
      'Describe standard SDLC lifecycle phases.',
      'Explain continuous feedback loops in DevOps.',
      'Identify operational transition gates.'
    ],
    commands: [
      {
        title: 'Define SDLC Phases',
        explanation: 'Continuous integration and continuous deployment bridge development and operations, creating a unified lifecycle.',
        command: 'echo "Plan -> Code -> Build -> Test -> Release -> Deploy -> Operate -> Monitor" > sdlc-phases.txt',
        output: 'Wrote sdlc-phases.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_scrum_backlog',
    title: 'Backlog Modeling and Scrum Boards',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Create a ticket entry inside the product sprint backlog.',
    skillOutcomes: [
      'Write clear feature request tickets.',
      'Define sprint priority states.',
      'Understand scrum backlog processes.'
    ],
    commands: [
      {
        title: 'Create User Story Ticket',
        explanation: 'Sprint backlogs capture tasks that must be accomplished during the sprint iteration, detailing description and priority.',
        command: 'echo "ID: TICKET-101 Summary: Implement SSO login Priority: High" > backlog.ticket',
        output: 'Wrote backlog.ticket.'
      }
    ]
  }),
  createQuest({
    id: 'sw_acceptance_criteria',
    title: 'User Story Acceptance Criteria',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Formulate user story acceptance checks using Given-When-Then patterns.',
    skillOutcomes: [
      'Write clear given-when-then scenarios.',
      'Define boundary conditions for testers.',
      'Translate business requirements into software checks.'
    ],
    commands: [
      {
        title: 'Write Acceptance Criteria',
        explanation: 'Given-When-Then criteria clarify the exact conditions under which a feature is marked complete.',
        command: 'echo "Given user has registered credentials When they login Then access token is returned" > criteria.txt',
        output: 'Wrote criteria.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_branching_pr_review',
    title: 'Pull Requests and Review Checklists',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Model code review checklists to ensure security and compliance gates are met.',
    skillOutcomes: [
      'Design review checklist guidelines.',
      'Explain how peer review boosts quality.',
      'Intercept credential commits before merges.'
    ],
    commands: [
      {
        title: 'Write Review Checklist',
        explanation: 'Review checklists ensure basic standards (tests, formatting, security scanning) are met before merges.',
        command: 'echo "Checklist: 1.Tests pass 2.No plain credentials 3.Clean git commits" > pr-checklist.txt',
        output: 'Wrote pr-checklist.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_test_strategy',
    title: 'Unit, Integration, and E2E Test Strategy',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Document testing hierarchies distinguishing isolated code unit testing from full system checks.',
    skillOutcomes: [
      'Differentiate unit, integration, and E2E checks.',
      'Design testing pyramids.',
      'Verify target boundary limits.'
    ],
    commands: [
      {
        title: 'Define Testing Layers',
        explanation: 'Unit tests run fast in isolation. Integration checks mock interactions. End-to-end checks run browsers to test paths.',
        command: 'echo "layers: { unit: fast isolated, integration: service bindings, e2e: full flow browser }" > test-strategy.txt',
        output: 'Wrote test-strategy.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_release_checklist',
    title: 'Pre-Flight Release Checklists',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Create a pre-flight checklist detailing deployment preparation steps.',
    skillOutcomes: [
      'Write operational pre-flight checks.',
      'Assess release rollback readiness.',
      'Coordinate dependency configurations.'
    ],
    commands: [
      {
        title: 'Write Release Checklist',
        explanation: 'Release checklists verify operational states (database migrations, backups, changelogs) to ensure stable releases.',
        command: 'echo "1.Review DB migrations 2.Verify rollbacks 3.Update changelog" > release-checklist.txt',
        output: 'Wrote release-checklist.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_change_risk_score',
    title: 'Change Risk Evaluation',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Calculate operational risk scoring for change management requests.',
    skillOutcomes: [
      'Identify change scope categories.',
      'Determine rollback plan availability.',
      'Formulate risk scores.'
    ],
    commands: [
      {
        title: 'Analyze Change Risk',
        explanation: 'Change management scores risks to coordinate deployment speed and auditing depth (e.g. low risk = automatic release).',
        command: 'echo "impact=high backup_rollback=verified score=lowrisk" > risk-analysis.txt',
        output: 'Wrote risk-analysis.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_incident_postmortem',
    title: 'Incident Postmortems',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Create a blameless postmortem incident report detailing timelines and preventative actions.',
    skillOutcomes: [
      'Understand blameless postmortem values.',
      'Trace incident event timelines.',
      'Identify systemic preventions.'
    ],
    commands: [
      {
        title: 'Draft Postmortem Report',
        explanation: 'Postmortems detail incidents chronologically, focusing on systemic fixes instead of pointing fingers.',
        command: 'echo "Timeline: 12:00 outage, 12:05 rollback\nRoot Cause: DB timeout\nAction Item: Set query limits" > postmortem.md',
        output: 'Wrote postmortem.md.'
      }
    ]
  }),
  createQuest({
    id: 'sw_dora_metrics',
    title: 'Calculating DORA Metrics',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Define the four core DORA metrics used to evaluate software delivery speed and stability.',
    skillOutcomes: [
      'Identify DORA metrics.',
      'Measure deployment speeds.',
      'Track failure rates and recovery averages.'
    ],
    commands: [
      {
        title: 'Define DORA Metrics',
        explanation: 'DORA monitors Deployment Frequency, Lead Time, Mean Time to Restore, and Change Failure Rate to evaluate engineering health.',
        command: 'echo "DF=Deployment Frequency, LT=Lead Time for Changes, MTTR=Mean Time to Restore, CFR=Change Failure Rate" > dora.txt',
        output: 'Wrote dora.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_team_topology_handoff',
    title: 'Team Topologies and Self-Service API',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Model clean working boundaries separating Platform enablement from Feature delivery teams.',
    skillOutcomes: [
      'Differentiate team topology roles.',
      'Expose platforms as self-service APIs.',
      'Reduce handoff bottlenecks.'
    ],
    commands: [
      {
        title: 'Model Team Interaction',
        explanation: 'Feature teams build products independently by consuming APIs, tools, and platforms provided by platform engineering.',
        command: 'echo "pattern=Platform provides self-service APIs; Stream-aligned builds features" > topology.txt',
        output: 'Wrote topology.txt.'
      }
    ]
  }),
  createQuest({
    id: 'sw_capstone_change_lifecycle',
    title: 'Capstone: End-to-End Release Lifecycle',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Verify backlog tickets, review peer code check criteria, and validate DORA definitions before deployment.',
    prerequisites: [
      'sw_scrum_backlog',
      'sw_branching_pr_review',
      'sw_dora_metrics'
    ],
    skillOutcomes: [
      'Trace changes from backlog to commit rules.',
      'Apply review checklist guidelines.',
      'Verify delivery metrics configurations.'
    ],
    commands: [
      {
        title: 'Verify Backlog User Story',
        explanation: 'Review the story ticket to confirm requirements and acceptance parameters.',
        command: 'cat backlog.ticket',
        output: 'ID: TICKET-101 Summary: Implement SSO login Priority: High'
      },
      {
        title: 'Verify PR Checklist Rules',
        explanation: 'Ensure the review rules enforce compliance tests and scanning checks.',
        command: 'cat pr-checklist.txt',
        output: 'Checklist: 1.Tests pass 2.No plain credentials 3.Clean git commits'
      },
      {
        title: 'Audit DORA Metrics Definitions',
        explanation: 'Ensure DORA metric tracking is active to record release performance outcomes.',
        command: 'cat dora.txt',
        output: 'DF=Deployment Frequency, LT=Lead Time for Changes, MTTR=Mean Time to Restore, CFR=Change Failure Rate'
      }
    ]
  })
];

export const softwarePracticesModule = createModule({
  id: 12,
  title: 'Software Engineering Practices',
  icon: 'users',
  description: 'Connect DevOps work to SDLC, agile flow, tests, releases, incidents, and delivery metrics.',
  detailedInfo: 'DevOps is a socio-technical practice: tooling only works when teams can plan, review, release, observe, and improve together.',
  outcomes: [
    'Model delivery flow from backlog to release.',
    'Use tests and reviews as quality gates.',
    'Learn from incidents and measure delivery performance.',
    'Map team topologies and calculate DORA metrics.'
  ],
  resources: [
    { name: 'What is Scrum?', url: 'https://www.atlassian.com/agile/scrum', free: true },
    { name: 'DORA', url: 'https://dora.dev/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Software Engineering Practices', [
    {
      question: 'What is the goal of Agile backlog grooming?',
      options: [
        'To prioritize, detail, and estimate user stories to prepare them for upcoming sprints',
        'To write code directly',
        'To delete old backup files',
        'To configure firewall rules'
      ],
      answerIndex: 0,
      explanation: 'Grooming clarifies requirements, estimates complexity, and prioritizes user stories so sprint backlogs are ready.'
    },
    {
      question: 'Why utilize Given-When-Then patterns in acceptance criteria?',
      options: [
        'To provide clear context, trigger actions, and expected outcomes for testing',
        'To compile code faster',
        'To automate git branch merges',
        'To restrict access keys'
      ],
      answerIndex: 0,
      explanation: 'This format structures scenarios clearly: Given (setup state), When (action trigger), and Then (expected change).'
    },
    {
      question: 'What does a Pull Request (PR) review checklist ensure?',
      options: [
        'That code meets quality, testing, security, and credentials standards before merging',
        'That the database restarts automatically',
        'That the release checklist is deleted',
        'That domain names resolve'
      ],
      answerIndex: 0,
      explanation: 'Checklists standardize review steps, preventing security flaws, credentials exposure, and missing tests.'
    },
    {
      question: 'How do unit tests differ from integration tests in DevOps?',
      options: [
        'Unit tests verify isolated functions; integration tests check bindings between components or services',
        'Unit tests are only run by managers',
        'Integration tests do not use code',
        'Unit tests require live databases'
      ],
      answerIndex: 0,
      explanation: 'Unit tests run fast in memory. Integration tests check if modules (like APIs and DBs) interact correctly.'
    },
    {
      question: 'What does DORA measure with Deployment Frequency?',
      options: [
        'How often code is successfully released to production',
        'How fast developers type code',
        'The size of docker images',
        'The number of open PR reviews'
      ],
      answerIndex: 0,
      explanation: 'Deployment Frequency measures velocity, showing how often value is shipped to production systems.'
    },
    {
      question: 'What is Change Failure Rate (CFR) in DORA?',
      options: [
        'The percentage of production deployments that result in incident downtime or require rollbacks',
        'The number of failed compiler builds',
        'The cost of running serverless functions',
        'The time to review backlog items'
      ],
      answerIndex: 0,
      explanation: 'CFR measures release stability: the ratio of releases triggering incidents or requiring quick hotfixes/rollbacks.'
    },
    {
      question: 'What is a blameless postmortem?',
      options: [
        'An incident review focus on finding systemic fixes rather than blaming individuals',
        'A document kept secret from clients',
        'An automated testing runner',
        'A database backup deletion script'
      ],
      answerIndex: 0,
      explanation: 'Blameless culture encourages reporting issues honestly to fix processes, avoiding fear and hiding mistakes.'
    },
    {
      question: 'In Team Topologies, what is a Stream-aligned team?',
      options: [
        'A team aligned to a continuous flow of business work, delivering end-to-end features directly to users',
        'A group managing database backups only',
        'A team responsible for security policies',
        'A platform team providing tool APIs'
      ],
      answerIndex: 0,
      explanation: 'Stream-aligned teams are cross-functional groups shipping customer-facing features directly without handoff blockages.'
    }
  ])
});
