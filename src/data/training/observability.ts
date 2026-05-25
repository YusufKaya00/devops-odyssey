import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'obs_signals_metrics_logs_traces',
    title: 'The Three Pillars of Observability',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Record definitions and use-cases for metrics, logs, and trace signals.',
    skillOutcomes: [
      'Contrast metrics, logs, and traces.',
      'Identify when to use each observability signal.',
      'Explain how correlation connects signals together.'
    ],
    commands: [
      {
        title: 'Define Observability Pillars',
        explanation: 'Metrics show trends (numbers), logs show specific events (text), and traces show request flows (context) across systems.',
        command: 'echo "metrics=numeric values, logs=discrete events, traces=request paths" > pillars.txt',
        output: 'Wrote pillars.txt.'
      }
    ]
  }),
  createQuest({
    id: 'obs_prometheus_scrape',
    title: 'Prometheus Scrape Configuration',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Configure a Prometheus configuration file to scrape metrics from an application target.',
    skillOutcomes: [
      'Write Prometheus scrape jobs.',
      'Configure metrics paths and ports.',
      'Validate configuration files with promtool.'
    ],
    commands: [
      {
        title: 'Create Scrape Configuration',
        explanation: 'Prometheus pulls (scrapes) metrics periodically from target HTTP endpoints exposing values in standard formats.',
        command: 'echo "scrape_configs: - job_name: app, scrape_interval: 5s, static_configs: [ { targets: [localhost:3000] } ]" > prometheus.yml',
        output: 'Wrote prometheus.yml.'
      },
      {
        title: 'Validate Config File',
        explanation: 'Use promtool check config to ensure formatting and configuration fields are correct.',
        command: 'promtool check config prometheus.yml',
        output: 'Checking prometheus.yml\n  SUCCESS: 0 rule files found'
      }
    ]
  }),
  createQuest({
    id: 'obs_promql_queries',
    title: 'Writing PromQL Queries',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Write PromQL query scripts to calculate application transaction rates.',
    skillOutcomes: [
      'Use rate() to measure request speed.',
      'Apply filters using label matches.',
      'Calculate error ratios and percentage thresholds.'
    ],
    commands: [
      {
        title: 'Write Rate Query',
        explanation: 'rate() calculates the per-second average rate of increase of a counter over a specified time window (e.g. 5 minutes).',
        command: 'echo "rate(http_requests_total[5m])" > queries.promql',
        output: 'Wrote queries.promql.'
      }
    ]
  }),
  createQuest({
    id: 'obs_alert_rule',
    title: 'Alert Rule Design',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Define alert rules checking error rate metrics and validate rule syntax.',
    skillOutcomes: [
      'Write Prometheus Alerting rules.',
      'Define thresholds and duration clauses.',
      'Validate rules files with promtool.'
    ],
    commands: [
      {
        title: 'Define Alert Rule',
        explanation: 'Alert rules define conditions that trigger notifications when thresholds are breached for a duration (for: 2m).',
        command: 'echo "alert: HighErrorRate, expr: job:request_errors:rate5m > 0.05, for: 2m" > alert.rules',
        output: 'Wrote alert.rules.'
      },
      {
        title: 'Validate Rules File',
        explanation: 'Ensure the alerting syntax and mathematical expressions are valid.',
        command: 'promtool check rules alert.rules',
        output: 'Checking alert.rules\n  SUCCESS: 1 rules found'
      }
    ]
  }),
  createQuest({
    id: 'obs_grafana_dashboard',
    title: 'Grafana Dashboard Definitions',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Model a Grafana dashboard panel layout configuration using JSON.',
    skillOutcomes: [
      'Understand dashboard configuration schemas.',
      'Define time-series panel queries.',
      'Implement variables for dynamic filtering.'
    ],
    commands: [
      {
        title: 'Model Dashboard Panel',
        explanation: 'Grafana dashboards can be declared as JSON files, making them version-controlled and reproducible (Dashboard-as-Code).',
        command: 'echo "{ \\"panels\\": [ { \\"type\\": \\"timeseries\\", \\"title\\": \\"HTTP Rate\\", \\"targets\\": [ { \\"expr\\": \\"rate(http_requests_total[1m])\\" } ] } ] }" > dashboard.json',
        output: 'Wrote dashboard.json.'
      }
    ]
  }),
  createQuest({
    id: 'obs_log_correlation',
    title: 'Log Query and Correlation',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Trace correlation context IDs across log files to debug microservice paths.',
    skillOutcomes: [
      'Locate transaction trace identifiers.',
      'Query log streams using CLI tools.',
      'Isolate backend dependency faults.'
    ],
    commands: [
      {
        title: 'Search Trace Logs',
        explanation: 'Injecting trace_ids into log statements allows tracking a single request across multiple microservices.',
        command: 'grep "trace_id=abc-123" app.log',
        output: '2026-05-25T12:00:01 INFO gateway trace_id=abc-123 Proxying request to backend\n2026-05-25T12:00:02 ERROR backend trace_id=abc-123 Connection timeout on database'
      }
    ]
  }),
  createQuest({
    id: 'obs_slo_error_budget',
    title: 'SLIs, SLOs, and Error Budgets',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Formulate SLI success metrics and compute error budget allocations.',
    skillOutcomes: [
      'Define Service Level Indicators (SLIs).',
      'Commit to Service Level Objectives (SLOs).',
      'Describe error budget depletion rates.'
    ],
    commands: [
      {
        title: 'Write SLI/SLO Target',
        explanation: 'An SLO sets the target level of reliability (99.9%). The remaining 0.1% is the error budget: acceptable downtime used to deploy features.',
        command: 'echo "SLI=success_requests/total_requests SLO=99.9% error_budget=0.1%" > slo.txt',
        output: 'Wrote slo.txt.'
      }
    ]
  }),
  createQuest({
    id: 'obs_alert_routing',
    title: 'Alert Routing configurations',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Configure Alertmanager rules to dispatch alerts by severity to target groups.',
    skillOutcomes: [
      'Configure Alertmanager receivers.',
      'Route notifications based on severity.',
      'Implement alert inhibition and deduplication.'
    ],
    commands: [
      {
        title: 'Define Route Configuration',
        explanation: 'Alertmanager groups, deduplicates, and routes alerts to integrations like PagerDuty, Slack, or email.',
        command: 'echo "route: { receiver: pagerduty, matchers: [ severity=critical ] }" > alertmanager.yml',
        output: 'Wrote alertmanager.yml.'
      }
    ]
  }),
  createQuest({
    id: 'obs_runbook',
    title: 'Incident Response Runbooks',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Write a step-by-step incident response runbook for critical service failures.',
    skillOutcomes: [
      'Document immediate triage actions.',
      'Identify critical service verification checks.',
      'Provide clear rollback decision trees.'
    ],
    commands: [
      {
        title: 'Write Runbook Guide',
        explanation: 'Runbooks reduce MTTR (Mean Time to Resolution) by providing operators with step-by-step instructions when alerts trigger.',
        command: 'echo "# Runbook: HighErrorRate\n1. Inspect app container logs.\n2. Verify database connection status.\n3. Roll back if deployment just occurred." > runbook.md',
        output: 'Wrote runbook.md.'
      }
    ]
  }),
  createQuest({
    id: 'obs_dashboard_improvement',
    title: 'Post-Incident Dashboard Refinement',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Update dashboard panel definitions to add infrastructure resource gauges.',
    skillOutcomes: [
      'Refine panel PromQL query targets.',
      'Add system metrics (CPU/RAM) alongside application metrics.',
      'Improve panel visualization layouts.'
    ],
    commands: [
      {
        title: 'Append CPU Utilization Panel',
        explanation: 'Incidents reveal visibility gaps. Adding CPU gauge panels helps correlate request latency with host constraints.',
        command: 'echo "expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\'idle\'}[5m])) * 100)" >> dashboard.json',
        output: 'Appended panel config.'
      }
    ]
  }),
  createQuest({
    id: 'obs_capstone_error_investigation',
    title: 'Capstone: Incident Investigation and Resolution',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Audit system alert status, inspect application logs to isolate errors, and check recovery runbooks to restore systems.',
    prerequisites: [
      'obs_alert_rule',
      'obs_log_correlation',
      'obs_runbook'
    ],
    skillOutcomes: [
      'Follow a structured alert triage procedure.',
      'Correlate errors from logs and metrics.',
      'Perform guided recovery actions using runbooks.'
    ],
    commands: [
      {
        title: 'Audit Triggered Alert Rules',
        explanation: 'Inspect active alerts to check which service is violating SLO metrics.',
        command: 'promtool check rules alert.rules',
        output: 'Checking alert.rules\n  SUCCESS: 1 rules found'
      },
      {
        title: 'Inspect Application Error Logs',
        explanation: 'Filter error logs to find exception stack traces and isolate database connection failures.',
        command: 'grep " 500 " app.log',
        output: '2026-05-25T12:00:02 ERROR backend trace_id=abc-123 Connection timeout on database'
      },
      {
        title: 'Examine Recovery Runbook',
        explanation: 'Open the service runbook to review immediate verification and recovery actions.',
        command: 'cat runbook.md',
        output: '# Runbook: HighErrorRate\n1. Inspect app container logs.\n2. Verify database connection status.\n3. Roll back if deployment just occurred.'
      }
    ]
  })
];

export const observabilityModule = createModule({
  id: 10,
  title: 'Monitoring & Observability',
  icon: 'activity',
  description: 'Use metrics, logs, traces, SLOs, alerts, dashboards, and runbooks.',
  detailedInfo: 'Observability turns system behavior into evidence for debugging, reliability, and incident response.',
  outcomes: [
    'Write useful alert rules.',
    'Use metrics and logs to investigate incidents.',
    'Connect SLOs and error budgets to release decisions.',
    'Build runbooks and route alerts dynamically.'
  ],
  resources: [
    { name: 'Prometheus Docs', url: 'https://prometheus.io/docs/introduction/overview/', free: true },
    { name: 'Grafana Tutorials', url: 'https://grafana.com/tutorials/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Observability', [
    {
      question: 'What are the three pillars of observability?',
      options: [
        'Metrics, Logs, and Traces',
        'HTML, CSS, and JavaScript',
        'Terraform, Ansible, and Helm',
        'DNS, TCP, and TLS'
      ],
      answerIndex: 0,
      explanation: 'Metrics provide numerical trends, logs provide event history, and traces provide request context.'
    },
    {
      question: 'Why validate alerting configurations with promtool?',
      options: [
        'To detect PromQL syntax and alerting configuration errors before deployment',
        'To run the application tests',
        'To start web servers',
        'To create a Grafana account'
      ],
      answerIndex: 0,
      explanation: 'promtool checks file structures and math expressions, avoiding silent alert engine failures.'
    },
    {
      question: 'What is the function of rate() in PromQL?',
      options: [
        'Calculates the per-second average rate of increase of a counter over a time range',
        'Calculates database index sizes',
        'Measures memory usage averages',
        'Deletes old log files'
      ],
      answerIndex: 0,
      explanation: 'rate() calculates the rate of change of counter metrics over a given historical window.'
    },
    {
      question: 'What does a Service Level Objective (SLO) specify?',
      options: [
        'A target reliability level for a service, representing a goal for uptime or performance',
        'A list of support email addresses',
        'A database partition style',
        'An environment credentials token'
      ],
      answerIndex: 0,
      explanation: 'An SLO defines the target reliability percentage (e.g. 99.9% successful requests) agreed upon by teams.'
    },
    {
      question: 'What is an error budget?',
      options: [
        'The acceptable rate of service failure (100% - SLO), allowing development teams to take release risks',
        'The cost of licensing monitoring tools',
        'The total amount of CPU limit errors',
        'The backup storage size limit'
      ],
      answerIndex: 0,
      explanation: 'The error budget is the allowable downtime or failure rate. Depleting it pauses releases to focus on reliability.'
    },
    {
      question: 'Why include trace_ids inside logs across microservices?',
      options: [
        'To correlate and track a single request flow across multiple service nodes during debugs',
        'To encrypt the logs files',
        'To allocate CPU limits',
        'To speed up static page loading'
      ],
      answerIndex: 0,
      explanation: 'Trace IDs link related logs across systems, allowing developers to see the exact execution path of a transaction.'
    },
    {
      question: 'What does Alertmanager do with raw alerts from Prometheus?',
      options: [
        'Groups, deduplicates, and routes alerts to integration endpoints like Slack or PagerDuty',
        'Deletes alerts containing errors',
        'Plots charts on the screen',
        'Compiles docker images'
      ],
      answerIndex: 0,
      explanation: 'Alertmanager manages alerts lifecycle, routing notifications to target on-call schedules and silencing alerts.'
    },
    {
      question: 'What is a recovery runbook?',
      options: [
        'A step-by-step guide explaining actions to diagnose and resolve an alert condition',
        'A document listing team salary budgets',
        'An automated deployment script',
        'A database backups schedule'
      ],
      answerIndex: 0,
      explanation: 'Runbooks provide instant instructions for responding to alerts, reducing MTTR and operator panic.'
    }
  ])
});
