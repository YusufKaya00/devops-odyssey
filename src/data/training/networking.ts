import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'net_osi_diagnostic_map',
    title: 'OSI and TCP/IP Diagnostic Map',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Map common troubleshooting commands to network layers.',
    skillOutcomes: [
      'Explain why network debugging follows layers.',
      'Connect DNS, TCP, TLS, and HTTP to practical checks.',
      'Choose the next diagnostic command from a symptom.'
    ],
    commands: [
      {
        title: 'Create Layer Map',
        explanation: 'Layered thinking keeps network troubleshooting from becoming random guessing. Start from name resolution, then reachability, then encryption, then application response.',
        command: 'echo "DNS -> TCP -> TLS -> HTTP -> APP" > network-map.txt',
        output: 'Wrote network-map.txt.'
      },
      {
        title: 'Review the Map',
        explanation: 'A clear map makes the next command obvious when users report that a service is down.',
        command: 'cat network-map.txt',
        output: 'DNS -> TCP -> TLS -> HTTP -> APP'
      }
    ]
  }),
  createQuest({
    id: 'net_dns_lookup',
    title: 'DNS Lookup and Name Resolution',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Resolve a service name and interpret DNS output.',
    skillOutcomes: [
      'Run a DNS lookup.',
      'Distinguish hostname failure from app failure.',
      'Recognize A record style output.'
    ],
    commands: [
      {
        title: 'Resolve a Hostname',
        explanation: 'If DNS fails, no amount of HTTP debugging will fix the request. Name resolution is often the first layer to check.',
        command: 'nslookup api.internal',
        acceptedCommands: ['dig api.internal'],
        output: 'Name: api.internal\nAddress: 10.0.2.15'
      },
      {
        title: 'Record the Result',
        explanation: 'Writing the resolved target into notes helps compare expected and actual service endpoints.',
        command: 'echo "api.internal=10.0.2.15" > dns-notes.txt',
        output: 'Wrote dns-notes.txt.'
      }
    ]
  }),
  createQuest({
    id: 'net_http_headers',
    title: 'HTTP Headers and Status Codes',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Inspect HTTP response headers without downloading the body.',
    skillOutcomes: [
      'Read status codes from headers.',
      'Identify redirects and content type.',
      'Use curl for lightweight service checks.'
    ],
    commands: [
      {
        title: 'Inspect Headers',
        explanation: 'curl -I asks for headers only. This is fast and safe for checking status, server behavior, cache headers, and redirects.',
        command: 'curl -I https://api.internal/health',
        output: 'HTTP/2 200\ncontent-type: application/json\ncache-control: no-store'
      },
      {
        title: 'Capture Expected Status',
        explanation: 'Recording expected response behavior helps identify regressions during later checks.',
        command: 'echo "health_status=200" > http-check.txt',
        output: 'Wrote http-check.txt.'
      }
    ]
  }),
  createQuest({
    id: 'net_tls_certificate',
    title: 'TLS Certificate Inspection',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Inspect a certificate chain and expiration signal.',
    skillOutcomes: [
      'Explain where TLS fits after TCP.',
      'Recognize certificate subject and expiry.',
      'Diagnose TLS failure separately from HTTP failure.'
    ],
    commands: [
      {
        title: 'Open TLS Handshake',
        explanation: 'openssl s_client is a classic way to inspect TLS from the command line. It shows certificate chain and handshake details.',
        command: 'openssl s_client -connect api.internal:443 -servername api.internal',
        output: 'CONNECTED(00000003)\nsubject=CN=api.internal\nissuer=CN=Internal CA\nVerify return code: 0 (ok)'
      },
      {
        title: 'Document Certificate Owner',
        explanation: 'Operational notes should capture which certificate belongs to which service.',
        command: 'echo "api.internal cert verified" > tls-notes.txt',
        output: 'Wrote tls-notes.txt.'
      }
    ]
  }),
  createQuest({
    id: 'net_ports_sockets',
    title: 'Ports and Listening Sockets',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Find which process is listening on a service port.',
    skillOutcomes: [
      'Inspect listening ports.',
      'Map port numbers to processes.',
      'Recognize port conflict symptoms.'
    ],
    commands: [
      {
        title: 'List Listening TCP Ports',
        explanation: 'ss -tulpn shows services listening for network connections. It is crucial for port conflict and exposure debugging.',
        command: 'ss -tulpn',
        acceptedCommands: ['netstat -tulpn'],
        output: 'LISTEN 0 128 0.0.0.0:80 users:(("nginx",pid=21))\nLISTEN 0 128 127.0.0.1:3000 users:(("node",pid=42))'
      },
      {
        title: 'Record Service Port Mapping',
        explanation: 'Port mapping notes help distinguish public entry points from private app ports.',
        command: 'echo "nginx:80 -> node:3000" > port-map.txt',
        output: 'Wrote port-map.txt.'
      }
    ]
  }),
  createQuest({
    id: 'net_firewall_rules',
    title: 'Firewall Allow and Deny Rules',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Model a narrow firewall rule for HTTPS service traffic.',
    skillOutcomes: [
      'Write explicit source, destination, port, and protocol.',
      'Prefer narrow allow rules.',
      'Explain why broad exposure is risky.'
    ],
    commands: [
      {
        title: 'Write Allow Rule',
        explanation: 'Firewall changes should be explicit. Source, destination, port, and protocol are the minimum reviewable facts.',
        command: 'echo "allow tcp 10.0.0.0/24 -> 10.0.1.10:443" > firewall.rules',
        output: 'Wrote firewall.rules.'
      },
      {
        title: 'Write Default Deny',
        explanation: 'Default deny means traffic must be intentionally allowed instead of accidentally exposed.',
        command: 'echo "deny tcp any -> 10.0.1.10:22" >> firewall.rules',
        output: 'Appended deny rule.'
      },
      {
        title: 'Review Rules',
        explanation: 'Human review catches dangerous patterns like any-to-any access before production.',
        command: 'cat firewall.rules',
        output: 'allow tcp 10.0.0.0/24 -> 10.0.1.10:443\ndeny tcp any -> 10.0.1.10:22'
      }
    ]
  }),
  createQuest({
    id: 'net_cidr_subnets',
    title: 'CIDR and Subnet Planning',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Plan non-overlapping public and private subnets.',
    skillOutcomes: [
      'Explain why subnet overlap is dangerous.',
      'Separate public and private address ranges.',
      'Document network intent.'
    ],
    commands: [
      {
        title: 'Write Subnet Plan',
        explanation: 'Cloud and Kubernetes networking both rely on CIDR planning. Overlapping ranges cause routing surprises.',
        command: 'echo "public=10.0.1.0/24 private=10.0.2.0/24 pods=10.244.0.0/16" > cidr.plan',
        output: 'Wrote cidr.plan.'
      },
      {
        title: 'Review Subnets',
        explanation: 'A simple plan review helps catch overlap before infrastructure is created.',
        command: 'cat cidr.plan',
        output: 'public=10.0.1.0/24 private=10.0.2.0/24 pods=10.244.0.0/16'
      }
    ]
  }),
  createQuest({
    id: 'net_lb_health_checks',
    title: 'Load Balancer Health Checks',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Model health check behavior for two backend targets.',
    skillOutcomes: [
      'Explain why load balancers need health checks.',
      'Identify unhealthy backend targets.',
      'Connect backend health to user-facing availability.'
    ],
    commands: [
      {
        title: 'Create Target List',
        explanation: 'Load balancers route only to healthy targets when configured correctly.',
        command: 'echo "app1:3000 healthy\napp2:3000 unhealthy" > targets.txt',
        output: 'Wrote targets.txt.'
      },
      {
        title: 'Filter Unhealthy Targets',
        explanation: 'During incidents, quickly finding unhealthy targets tells you whether the problem is one instance or the entire service.',
        command: 'grep unhealthy targets.txt',
        output: 'app2:3000 unhealthy'
      },
      {
        title: 'Document Action',
        explanation: 'Operational output should lead to a next action, such as drain, restart, or rollback.',
        command: 'echo "drain app2 and inspect logs" > lb-action.txt',
        output: 'Wrote lb-action.txt.'
      }
    ]
  }),
  createQuest({
    id: 'net_dns_https_failure',
    title: 'Troubleshoot DNS Works but HTTPS Fails',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Diagnose a layered failure where DNS resolves but TLS is broken.',
    skillOutcomes: [
      'Avoid stopping after DNS success.',
      'Check TLS separately from name resolution.',
      'Explain certificate mismatch symptoms.'
    ],
    commands: [
      {
        title: 'Verify DNS',
        explanation: 'DNS success only proves the name maps to an address. It does not prove TCP, TLS, or app health.',
        command: 'nslookup checkout.internal',
        output: 'Name: checkout.internal\nAddress: 10.0.2.44'
      },
      {
        title: 'Check HTTP/TLS',
        explanation: 'The HTTPS request fails because certificate identity does not match the requested hostname.',
        command: 'curl -I https://checkout.internal',
        output: 'curl: (60) SSL: certificate subject name api.internal does not match checkout.internal'
      },
      {
        title: 'Write Root Cause Note',
        explanation: 'Good incident notes name the failing layer and the specific mismatch.',
        command: 'echo "TLS certificate CN mismatch for checkout.internal" > root-cause.txt',
        output: 'Wrote root-cause.txt.'
      }
    ]
  }),
  createQuest({
    id: 'net_exposure_baseline',
    title: 'Network Exposure Baseline',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Identify which ports should be public and which should stay private.',
    skillOutcomes: [
      'Create an exposure inventory.',
      'Flag unsafe public admin ports.',
      'Connect exposure review to security posture.'
    ],
    commands: [
      {
        title: 'Create Exposure Inventory',
        explanation: 'An exposure baseline records what should be reachable from where. Drift in exposure can become a security incident.',
        command: 'echo "public:443\nprivate:3000\nadmin:22" > exposure.txt',
        output: 'Wrote exposure.txt.'
      },
      {
        title: 'Flag Admin Port',
        explanation: 'SSH or admin ports should usually be private, bastion-protected, or VPN-only.',
        command: 'grep admin exposure.txt',
        output: 'admin:22'
      },
      {
        title: 'Write Remediation',
        explanation: 'Security review should end with a concrete remediation, not just a finding.',
        command: 'echo "restrict admin:22 to VPN CIDR" > exposure-action.txt',
        output: 'Wrote exposure-action.txt.'
      }
    ]
  }),
  createQuest({
    id: 'net_service_path_capstone',
    title: 'Capstone: Diagnose Client to Backend Path',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Use DNS, ports, TLS, HTTP, and backend health evidence to isolate a service outage.',
    prerequisites: [
      'net_dns_lookup',
      'net_http_headers',
      'net_tls_certificate',
      'net_ports_sockets',
      'net_lb_health_checks'
    ],
    skillOutcomes: [
      'Follow a layered troubleshooting path.',
      'Collect evidence from multiple network checks.',
      'Name the failing component and next action.'
    ],
    commands: [
      {
        title: 'Check DNS Layer',
        explanation: 'The service name resolves, so the outage is not at the DNS layer.',
        command: 'nslookup shop.example.internal',
        output: 'Name: shop.example.internal\nAddress: 10.0.10.20'
      },
      {
        title: 'Check Public HTTPS',
        explanation: 'HTTP returns a 502, which usually means a proxy or load balancer cannot reach a healthy backend.',
        command: 'curl -I https://shop.example.internal',
        output: 'HTTP/2 502\nserver: nginx'
      },
      {
        title: 'Check Listening Ports',
        explanation: 'The proxy is listening publicly, so the next layer is backend target health.',
        command: 'ss -tulpn',
        output: 'LISTEN 0 128 0.0.0.0:443 users:(("nginx",pid=21))\nLISTEN 0 128 127.0.0.1:3000 users:(("node",pid=42))'
      },
      {
        title: 'Inspect Backend Health',
        explanation: 'The load balancer has no healthy targets, explaining the 502 response.',
        command: 'cat targets.txt',
        output: 'app1:3000 unhealthy\napp2:3000 unhealthy'
      },
      {
        title: 'Write Incident Summary',
        explanation: 'The final summary should identify the failing layer and the next recovery step.',
        command: 'echo "DNS ok, TLS ok, proxy ok, all backends unhealthy; rollback app release" > network-incident.txt',
        output: 'Wrote network-incident.txt.'
      }
    ]
  })
];

export const networkingModule = createModule({
  id: 4,
  title: 'Networking & Security',
  icon: 'shield',
  description: 'Understand DNS, ports, HTTP, TLS, firewalls, and secure service exposure.',
  detailedInfo: 'Networking knowledge lets DevOps engineers diagnose traffic paths from users to services and protect exposed systems. This module trains layered troubleshooting from DNS through backend health.',
  outcomes: [
    'Trace failures across DNS, TCP, TLS, HTTP, and backend health.',
    'Model firewall and subnet rules.',
    'Identify unsafe network exposure.',
    'Produce incident-quality network evidence.'
  ],
  resources: [
    { name: 'How DNS Works', url: 'https://howdns.works/', free: true },
    { name: 'How HTTPS Works', url: 'https://howhttps.works/', free: true },
    { name: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Networking and Security', [
    {
      question: 'Why debug networking in layers?',
      options: ['It isolates the failing stage instead of guessing', 'It makes commands slower', 'It removes DNS', 'It replaces application logs'],
      answerIndex: 0,
      explanation: 'Layered checks reveal whether failure is DNS, TCP, TLS, HTTP, proxy, or backend health.'
    },
    {
      question: 'What does successful DNS resolution prove?',
      options: ['Only that the name maps to an address', 'That HTTP is healthy', 'That TLS is valid', 'That the app has no bugs'],
      answerIndex: 0,
      explanation: 'DNS success does not prove reachability, TLS, or application response.'
    },
    {
      question: 'Why use curl -I?',
      options: ['To inspect response headers without downloading the body', 'To edit firewall rules', 'To create a subnet', 'To list processes'],
      answerIndex: 0,
      explanation: 'Headers reveal status codes, redirects, content type, and proxy behavior quickly.'
    },
    {
      question: 'What does a TLS certificate name mismatch usually mean?',
      options: ['The certificate identity does not match the requested hostname', 'The disk is full', 'The process is stopped', 'The subnet is too large'],
      answerIndex: 0,
      explanation: 'TLS verifies that the certificate is valid for the hostname being requested.'
    },
    {
      question: 'What does ss -tulpn help identify?',
      options: ['Listening ports and processes', 'Git branches', 'Terraform resources', 'Docker image layers only'],
      answerIndex: 0,
      explanation: 'Socket inspection maps network ports to listening processes.'
    },
    {
      question: 'What is the safest firewall posture?',
      options: ['Default deny with narrow allow rules', 'Allow all traffic', 'Expose admin ports publicly', 'Skip source ranges'],
      answerIndex: 0,
      explanation: 'Narrow explicit allow rules reduce accidental exposure.'
    },
    {
      question: 'Why avoid overlapping CIDR ranges?',
      options: ['They cause routing ambiguity', 'They improve DNS', 'They create certificates', 'They reduce logs'],
      answerIndex: 0,
      explanation: 'Overlapping networks make it unclear where traffic should route.'
    },
    {
      question: 'What does HTTP 502 from a proxy often suggest?',
      options: ['The proxy cannot reach a healthy backend', 'DNS always failed', 'The client has no IP', 'The firewall is definitely open'],
      answerIndex: 0,
      explanation: 'A bad gateway response often points to upstream/backend connectivity or health problems.'
    }
  ])
});

