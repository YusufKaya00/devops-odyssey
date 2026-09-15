import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'cloud_cli_identity_region',
    title: 'Cloud CLI Identity and Region Verification',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Verify command-line authorization status and check default region configs.',
    skillOutcomes: [
      'Query authorization states using STS.',
      'Check configured default regions.',
      'Ensure secure CLI settings before deploying infra.'
    ],
    commands: [
      {
        title: 'Query Identity Details',
        explanation: 'get-caller-identity returns credentials information (account ID, ARN identity type) currently active in the CLI session.',
        command: 'aws sts get-caller-identity',
        output: '{\n    "UserId": "AIDASCIRE33YF4ABCD",\n    "Account": "123456789012",\n    "Arn": "arn:aws:iam::123456789012:user/devops-operator"\n}'
      },
      {
        title: 'Query Configured Region',
        explanation: 'Confirming the active region prevents deploying resources to incorrect regional endpoints.',
        command: 'aws configure get region',
        output: 'us-east-1'
      }
    ],
    conceptSummary: "Cloud environments heavily rely on Identity and Access Management (IAM) and regional boundaries. Verifying your CLI identity ensures you are executing commands with the correct permissions and as the intended user.\n\nConfirming the default region prevents the accidental deployment of resources to the wrong geographical location, which can cause latency, compliance, and cost issues.",
    learningObjectives: [
        "Verify active CLI session authentication.",
        "Query configured default cloud regions.",
        "Ensure secure baseline configurations before operating."
    ],
    realWorldScenario: "Before deploying a critical infrastructure update via Terraform, you check your caller identity to ensure you are using the prod-admin role instead of your personal dev account."
  }),
  createQuest({
    id: 'cloud_iam_least_privilege',
    title: 'Least-Privilege IAM Policies',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Model a JSON IAM policy granting read-only access to a specific S3 bucket.',
    skillOutcomes: [
      'Write JSON IAM policy manifests.',
      'Identify target Resource ARNs.',
      'Apply least-privilege principles, avoiding wildcards (*).'
    ],
    commands: [
      {
        title: 'Create IAM Policy',
        explanation: 'Policies should limit action rights (e.g. s3:GetObject) to target resources only, preventing wide administrative exposure.',
        command: 'echo "Version: \'2012-10-17\' Statement: [ { Effect: Allow, Action: [ s3:ListBucket, s3:GetObject ], Resource: [ arn:aws:s3:::prod-assets, arn:aws:s3:::prod-assets/* ] } ]" > s3-policy.json',
        output: 'Wrote s3-policy.json.'
      }
    ],
    conceptSummary: "The Principle of Least Privilege states that a user or service should only be granted the minimum permissions necessary to perform its function. In IAM, this means avoiding wildcard (*) permissions.\n\nExplicitly defining allowed actions and scoping them to specific resource ARNs minimizes the blast radius if credentials are ever compromised.",
    learningObjectives: [
        "Write explicit JSON IAM policies.",
        "Restrict actions to specific Resource ARNs.",
        "Apply least-privilege security principles."
    ],
    realWorldScenario: "A third-party auditing tool needs to read logs from a specific S3 bucket. You create an IAM policy granting only `s3:GetObject` on that exact bucket, denying all other access."
  }),
  createQuest({
    id: 'cloud_object_lifecycle',
    title: 'Object Storage Lifecycle Policies',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Configure bucket lifecycle rules to transition old assets to cold archive storage.',
    skillOutcomes: [
      'Configure object storage lifecycle policies.',
      'Differentiate storage classes (Standard, Glacier).',
      'Optimize object storage costs.'
    ],
    commands: [
      {
        title: 'Define Lifecycle Configuration',
        explanation: 'Lifecycle rules automate moving log files or backups to cheaper archival tiers (Glacier) after periods of inactivity.',
        command: 'echo "Rules: [ { ID: TransitionToGlacier, Status: Enabled, Filter: { Prefix: logs/ }, Transitions: [ { Days: 90, StorageClass: GLACIER } ] } ]" > s3-lifecycle.json',
        output: 'Wrote s3-lifecycle.json.'
      }
    ],
    conceptSummary: "Object storage can become extremely costly if data accumulates indefinitely. Lifecycle policies automate the transition of older, infrequently accessed objects to cheaper storage tiers (like Glacier) or delete them entirely.\n\nThis automated data management is crucial for cost optimization, compliance retention requirements, and efficient storage operations.",
    learningObjectives: [
        "Configure S3 bucket lifecycle rules.",
        "Transition data across storage classes based on age.",
        "Optimize object storage costs automatically."
    ],
    realWorldScenario: "Your application generates 500GB of access logs daily. You implement a lifecycle rule to move logs older than 30 days to cold storage, cutting storage costs by 80%."
  }),
  createQuest({
    id: 'cloud_vpc_subnet_sg',
    title: 'VPC and Network Planning',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Plan virtual networks with public subnets, private subnets, and security groups.',
    skillOutcomes: [
      'Map public and private subnet address boundaries.',
      'Plan Security Groups filtering network ports.',
      'Isolate internal app VM instances from direct internet routes.'
    ],
    commands: [
      {
        title: 'Model Network Plan',
        explanation: 'VPC network planning isolates backend assets. Public subnets hold web ingress; private subnets hold secure applications and databases.',
        command: 'echo "VPC=10.0.0.0/16 public_subnet=10.0.1.0/24 private_subnet=10.0.2.0/24 SG=allow_443_from_any" > vpc-plan.txt',
        output: 'Wrote vpc-plan.txt.'
      }
    ],
    conceptSummary: "Virtual Private Clouds (VPCs) provide isolated network environments. Subnets divide this network; public subnets allow direct internet access, while private subnets block inbound internet traffic to secure backends.\n\nSecurity Groups act as stateful, instance-level firewalls, explicitly allowing necessary traffic (like HTTPS) while dropping everything else, forming a robust defense-in-depth architecture.",
    learningObjectives: [
        "Map public and private subnet boundaries.",
        "Design stateful Security Group rules.",
        "Isolate critical backend services from direct internet access."
    ],
    realWorldScenario: "You are designing the network for a new web app. You place the load balancers in the public subnet and the application servers and databases in the private subnet for security."
  }),
  createQuest({
    id: 'cloud_vm_launch_config',
    title: 'Virtual Machine Launch Configuration',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Model VM compute instance templates detailing sizing and security attributes.',
    skillOutcomes: [
      'Choose compute sizes matching CPU/RAM needs.',
      'Link instances to security groups.',
      'Specify image IDs (AMIs).'
    ],
    commands: [
      {
        title: 'Write Launch Configuration',
        explanation: 'Launch configurations specify the base OS image, size (vCPU/RAM), key pairs, and security profiles when launching VM nodes.',
        command: 'echo "instance_type=t3.medium image_id=ami-123456 security_groups=[allow-web]" > vm-config.conf',
        output: 'Wrote vm-config.conf.'
      }
    ],
    conceptSummary: "Launch configurations serve as templates for creating virtual machines. They define the base Amazon Machine Image (AMI), instance type (CPU/RAM sizing), SSH keys, and associated Security Groups.\n\nBy standardizing these configurations, teams ensure that every instance launched (manually or via Auto Scaling) is identical, secure, and properly sized for its workload.",
    learningObjectives: [
        "Model VM compute instance templates.",
        "Select appropriate instance types for workloads.",
        "Link instances to secure network profiles."
    ],
    realWorldScenario: "You need to scale out the worker nodes for a processing queue. You create a launch configuration specifying a compute-optimized instance type and the standard internal security group."
  }),
  createQuest({
    id: 'cloud_lb_target_group',
    title: 'Load Balancers and Target Groups',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Model Application Load Balancer configurations exposing service target pools.',
    skillOutcomes: [
      'Model Application Load Balancers.',
      'Configure SSL certificate targets.',
      'Link instances to backend target groups.'
    ],
    commands: [
      {
        title: 'Write Load Balancer Config',
        explanation: 'Load balancers sit at network ingress edges, routing requests on port 443 across VM nodes mapped in target groups.',
        command: 'echo "LB_type=application listeners=[port:443] targets=[instance-a,instance-b]" > lb-config.conf',
        output: 'Wrote lb-config.conf.'
      }
    ],
    conceptSummary: "Application Load Balancers (ALBs) distribute incoming application traffic across multiple targets, such as EC2 instances, in multiple Availability Zones. This increases the availability and fault tolerance of your applications.\n\nTarget Groups route requests to registered targets and perform health checks, ensuring traffic is only sent to healthy instances that are ready to process requests.",
    learningObjectives: [
        "Configure Application Load Balancers.",
        "Define routing rules for incoming traffic.",
        "Link compute instances to backend target pools."
    ],
    realWorldScenario: "Traffic to your web app is unevenly overloading a single server. You provision an ALB and a Target Group to distribute the load evenly across three backend servers."
  }),
  createQuest({
    id: 'cloud_db_backup_policy',
    title: 'Database Backup and Retention Policies',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Define snapshot backup windows and retention limits for managed databases.',
    skillOutcomes: [
      'Set automated backup schedules.',
      'Define data retention periods.',
      'Enable final snapshots protecting against accidental drops.'
    ],
    commands: [
      {
        title: 'Configure Backup Policy',
        explanation: 'Managed database policies schedule daily automated snapshots and retain them for recovery needs (retention_period=7days).',
        command: 'echo "backup_window=03:00-04:00 retention_period=7days snapshot_on_delete=true" > db-backup.txt',
        output: 'Wrote db-backup.txt.'
      }
    ],
    conceptSummary: "Managed databases abstract away hardware provisioning, but data protection remains a shared responsibility. Backup policies automate daily snapshots during low-traffic windows.\n\nDefining a retention period ensures you can recover from accidental deletions or corruption up to a certain point in time, while `snapshot_on_delete` safeguards against accidental database destruction.",
    learningObjectives: [
        "Define automated database snapshot schedules.",
        "Configure data retention periods.",
        "Enable safeguards against accidental data loss."
    ],
    realWorldScenario: "A developer accidentally runs a destructive DROP TABLE query in production. Thanks to your 7-day retention policy, you immediately restore the database from the previous night's snapshot."
  }),
  createQuest({
    id: 'cloud_serverless_function',
    title: 'Serverless Function Configuration',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Specify configuration rules for serverless function triggers and timeouts.',
    skillOutcomes: [
      'Understand serverless operational patterns.',
      'Configure execution memory bounds.',
      'Define function handler hooks.'
    ],
    commands: [
      {
        title: 'Configure Function Settings',
        explanation: 'Serverless functions run event-driven blocks, billed only for CPU execution milliseconds. Timeouts prevent infinite run costs.',
        command: 'echo "function_name=process-image memory=512MB timeout=30s handler=index.handler" > serverless.conf',
        output: 'Wrote serverless.conf.'
      }
    ],
    conceptSummary: "Serverless computing abstracts infrastructure management, allowing you to run code in response to events. You only pay for the exact compute time consumed.\n\nConfiguring memory allocation and strict execution timeouts is critical; an infinite loop in a serverless function without a timeout can result in massive, unexpected cloud bills.",
    learningObjectives: [
        "Configure serverless function parameters.",
        "Define memory bounds and execution timeouts.",
        "Understand event-driven operational models."
    ],
    realWorldScenario: "You are deploying an image resizing function. You configure a 512MB memory limit and a strict 30-second timeout to ensure broken uploads don't cause runaway execution costs."
  }),
  createQuest({
    id: 'cloud_logs_metrics',
    title: 'Cloud Audit Logs and Metrics',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Query network traffic logs to identify connection rejects.',
    skillOutcomes: [
      'Search VPC Flow Logs for indicators.',
      'Identify traffic blocked by firewalls.',
      'Filter log events using patterns.'
    ],
    commands: [
      {
        title: 'Query Flow logs',
        explanation: 'VPC Flow Logs record IP traffic passing interfaces. Searching for REJECT reveals traffic blocked by security groups.',
        command: 'aws logs filter-log-events --log-group-name /aws/vpc/flow-logs --filter-pattern "REJECT"',
        output: '{\n    "events": [\n        { "message": "2 123456789012 eni-01a 10.0.1.15 198.51.100.5 443 22 6 20 1200 1621935600 1621935660 REJECT OK" }\n    ]\n}'
      }
    ],
    conceptSummary: "Cloud audit logs (like CloudTrail) and network logs (like VPC Flow Logs) are essential for visibility and security forensics. Flow Logs record IP traffic entering and exiting network interfaces.\n\nQuerying these logs helps identify misconfigured security groups or malicious scanning activity by filtering for REJECT events, providing deep insight into network behavior.",
    learningObjectives: [
        "Query and filter VPC Flow Logs.",
        "Identify blocked network traffic.",
        "Perform network security forensics."
    ],
    realWorldScenario: "A partner company claims they cannot connect to your API. You query the VPC Flow Logs for their IP address, find REJECT events, and realize you forgot to update the Security Group."
  }),
  createQuest({
    id: 'cloud_cost_tags_budget',
    title: 'Cost Tagging and Budget Alerts',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Configure resource tags and budget alerts to isolate department costs.',
    skillOutcomes: [
      'Implement cost allocation tags.',
      'Create budget cost warning thresholds.',
      'Prevent cloud bill shock.'
    ],
    commands: [
      {
        title: 'Create Cost Control Config',
        explanation: 'Cost allocation tags organize billing. Budgets alert teams if estimated monthly spend exceeds specific limits.',
        command: 'echo "tags={ Owner: devops, Environment: production } budget_limit=100USD alert_threshold=80%" > budget.conf',
        output: 'Wrote budget.conf.'
      }
    ],
    conceptSummary: "Cloud scalability can lead to uncontrolled costs (cloud shock) if unmonitored. Resource tagging allocates costs to specific teams, projects, or environments, enabling detailed billing analysis.\n\nBudget alerts monitor actual and forecasted spending, notifying teams when thresholds are breached, ensuring financial accountability and preventing expensive surprises.",
    learningObjectives: [
        "Implement cost allocation tagging strategies.",
        "Configure budget alert thresholds.",
        "Monitor and control cloud expenditures."
    ],
    realWorldScenario: "The monthly cloud bill spiked by 40%. Because you implemented mandatory environment tags, you quickly identify that a staging database was left running over the weekend."
  }),
  createQuest({
    id: 'cloud_well_architected',
    title: 'Well-Architected Framework Checklist',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Analyze resources against the five pillars of the Well-Architected Framework.',
    skillOutcomes: [
      'Recognize five core architectural pillars.',
      'Assess design gaps (single points of failure).',
      'Optimize setups for security and cost efficiency.'
    ],
    commands: [
      {
        title: 'Create Review Checklist',
        explanation: 'Reviewing systems against Operational Excellence, Security, Reliability, Performance, and Cost ensures robust designs.',
        command: 'echo "Pillars: 1.Operational Excellence 2.Security 3.Reliability 4.Performance 5.Cost Optimization" > well-architected.txt',
        output: 'Wrote well-architected.txt.'
      }
    ],
    conceptSummary: "The Well-Architected Framework provides a consistent approach to evaluate cloud architectures against best practices. It comprises pillars like Operational Excellence, Security, Reliability, Performance Efficiency, and Cost Optimization.\n\nRegularly reviewing systems against these pillars helps teams identify high-risk issues, technical debt, and areas for continuous improvement.",
    learningObjectives: [
        "Evaluate architectures using the Well-Architected Framework.",
        "Identify gaps in reliability and security.",
        "Optimize systems for cost and performance."
    ],
    realWorldScenario: "Before a major product launch, you conduct a Well-Architected Review. You discover a single point of failure in the caching layer and remediate it before going live."
  }),
  createQuest({
    id: 'cloud_capstone_service_environment',
    title: 'Capstone: Cloud Infrastructure Triage',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Inspect active identities, verify region targets, and analyze flow logs to isolate cloud connectivity issues.',
    prerequisites: [
      'cloud_cli_identity_region',
      'cloud_logs_metrics',
      'cloud_vpc_subnet_sg'
    ],
    skillOutcomes: [
      'Verify command line authorization status.',
      'Inspect configuration target regions.',
      'Isolate network block faults via flow logs.'
    ],
    commands: [
      {
        title: 'Audit CLI Credentials',
        explanation: 'Check if you are authenticated as the correct IAM user or role.',
        command: 'aws sts get-caller-identity',
        output: '{\n    "UserId": "AIDASCIRE33YF4ABCD",\n    "Account": "123456789012",\n    "Arn": "arn:aws:iam::123456789012:user/devops-operator"\n}'
      },
      {
        title: 'Audit CLI Region Target',
        explanation: 'Verify that the local terminal is targeting the active service region.',
        command: 'aws configure get region',
        output: 'us-east-1'
      },
      {
        title: 'Search Flow logs for Blocked Traffic',
        explanation: 'Check flow logs to confirm if client connection attempts are rejected by firewalls or Security Groups.',
        command: 'aws logs filter-log-events --log-group-name /aws/vpc/flow-logs --filter-pattern "REJECT"',
        output: '{\n    "events": [\n        { "message": "2 123456789012 eni-01a 10.0.1.15 198.51.100.5 443 22 6 20 1200 1621935600 1621935660 REJECT OK" }\n    ]\n}'
      }
    ],
    conceptSummary: "Operating in the cloud requires integrating identity verification, region awareness, and deep network troubleshooting. A secure, functional environment depends on the harmony of IAM and VPC configurations.\n\nThis capstone challenges you to synthesize these concepts by verifying your secure baseline and actively hunting for misconfigurations using network flow logs.",
    learningObjectives: [
        "Audit cloud identity and regional targets.",
        "Troubleshoot network connectivity using flow logs.",
        "Synthesize IAM and network security concepts."
    ],
    realWorldScenario: "You are tasked with debugging a failed deployment. You must verify your IAM permissions, ensure you are in the correct region, and parse flow logs to prove it's a network misconfiguration."
  })
];

export const cloudModule = createModule({
  id: 11,
  title: 'Cloud Provider',
  icon: 'cloud',
  description: 'Operate IAM, networking, compute, storage, managed services, cost, and reliability in cloud environments.',
  detailedInfo: 'Cloud providers expose infrastructure through APIs, identity boundaries, managed services, and global networks.',
  outcomes: [
    'Apply least-privilege IAM thinking.',
    'Design basic cloud networks and service environments.',
    'Connect cost, security, and reliability practices.',
    'Examine audit flow logs and budget alerts.'
  ],
  resources: [
    { name: 'AWS Well-Architected', url: 'https://aws.amazon.com/architecture/well-architected/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Cloud', [
    {
      question: 'What information does aws sts get-caller-identity return?',
      options: [
        'The Account ID, User ARN, and active credential identifier',
        'A list of running VM instances',
        'Database credentials in plain text',
        'The monthly billing estimate'
      ],
      answerIndex: 0,
      explanation: 'get-caller-identity is the standard STS command verifying active CLI session authentication details.'
    },
    {
      question: 'What is the core rule of IAM least-privilege policy design?',
      options: [
        'Grant only the minimum required access rights to specific resource scopes, avoiding wildcards',
        'Grant full admin access to all developers to speed up work',
        'Never use JSON formatting',
        'Allow all IP addresses to access databases'
      ],
      answerIndex: 0,
      explanation: 'Least-privilege minimizes blast radius by explicitly listing allowable actions and limiting them to specific ARNs.'
    },
    {
      question: 'Why implement object storage bucket lifecycle policies?',
      options: [
        'To optimize costs by archiving old files automatically to cheaper storage classes',
        'To delete files to save local computer disk space',
        'To run VM CPU threads in parallel',
        'To map DNS domain names'
      ],
      answerIndex: 0,
      explanation: 'Lifecycle policies automate moves to archive classes (like Glacier) or delete temporary logs, saving substantial costs.'
    },
    {
      question: 'What is the purpose of public vs private subnets in a VPC?',
      options: [
        'Public subnets route traffic to the internet; private subnets have no direct routes, protecting backends',
        'Public subnets are free; private subnets cost money',
        'Private subnets do not use IP addresses',
        'Public subnets only support VM compute nodes'
      ],
      answerIndex: 0,
      explanation: 'Public subnets route externally via internet gateways. Private subnets shelter critical hosts, using NAT gateways for egress.'
    },
    {
      question: 'What does a budget alert help prevent in cloud administration?',
      options: [
        'Surprise billing by notifying teams when usage or cost estimates cross threshold warnings',
        'Server CPU spikes',
        'Git branch merge conflicts',
        'Docker container network crashes'
      ],
      answerIndex: 0,
      explanation: 'Budgets warn administrators via email or chat when cost forecasts cross percentage levels (e.g. 80% limit).'
    },
    {
      question: 'What are VPC Flow Logs?',
      options: [
        'Audit histories of IP packets passing network interfaces, useful for reachability debugging',
        'Logs showing developer CLI keystrokes',
        'Database query execution outputs',
        'Git commit history graphs'
      ],
      answerIndex: 0,
      explanation: 'Flow logs record traffic metrics, showing source, destination, port, and whether traffic was ACCEPT or REJECT.'
    },
    {
      question: 'How do Security Groups differ from Network ACLs (NACLs)?',
      options: [
        'Security Groups are stateful firewalls at instance levels; NACLs are stateless firewalls at subnet levels',
        'Security Groups do not support TCP protocol rules',
        'NACLs are only for object storage bucket access control',
        'Security Groups are managed by developers local computers'
      ],
      answerIndex: 0,
      explanation: 'Security groups monitor target VM sockets statefully. Subnet Network ACLs screen packets stateless routing.'
    },
    {
      question: 'Which of the following represents a pillar of the AWS Well-Architected Framework?',
      options: [
        'Reliability',
        'Declarative Yaml Syntax',
        'Command Line Version Control',
        'Virtual Machine Sizing'
      ],
      answerIndex: 0,
      explanation: 'Reliability is one of the five framework pillars, emphasizing high availability and fault-tolerant architectures.'
    }
  ]),
  keyConcepts: [
    {
      "title": "Least Privilege",
      "description": "Granting only necessary permissions.",
      "icon": "🔐"
    },
    {
      "title": "VPC & Subnets",
      "description": "Isolated networks and routing bounds.",
      "icon": "🌐"
    },
    {
      "title": "Lifecycle Policies",
      "description": "Automating data storage tiers.",
      "icon": "♻️"
    },
    {
      "title": "Serverless",
      "description": "Event-driven, pay-per-use computing.",
      "icon": "⚡"
    },
    {
      "title": "Cost Allocation",
      "description": "Tagging resources for financial tracking.",
      "icon": "💵"
    },
    {
      "title": "Well-Architected",
      "description": "Best practices framework for the cloud.",
      "icon": "🏛️"
    }
  ],
  commandCheatSheet: [
    {
      "command": "aws sts get-caller-identity",
      "description": "Check active IAM user/role authentication."
    },
    {
      "command": "aws configure get region",
      "description": "Check default target region."
    },
    {
      "command": "aws logs filter-log-events",
      "description": "Search CloudWatch log streams."
    }
  ],
  learningPath: "Start by securing your cloud identity and IAM policies. Progress through core networking and compute patterns, finishing with cost optimization and architectural reviews.",
  modulePrerequisites: [
    "Basic networking concepts.",
    "Command line basics."
  ]
});
