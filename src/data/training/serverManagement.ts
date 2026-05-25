import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'server_nginx_static',
    title: 'NGINX Static Site Configuration',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Configure a basic NGINX server block to serve a static website.',
    skillOutcomes: [
      'Write an NGINX server block configuration.',
      'Configure listen port and root directory.',
      'Validate configuration syntax using NGINX test command.'
    ],
    commands: [
      {
        title: 'Create Static Site Configuration',
        explanation: 'NGINX server blocks define site configurations. A static site needs a listen port, root directory, and default index files.',
        command: 'echo "server { listen 80; root /var/www/html; index index.html; }" > nginx-static.conf',
        output: 'Wrote nginx-static.conf.'
      },
      {
        title: 'Validate Configuration Syntax',
        explanation: 'Always test NGINX configuration syntax before applying it to prevent server crashes.',
        command: 'nginx -t -c nginx-static.conf',
        output: 'nginx: the configuration file nginx-static.conf syntax is ok\nnginx: configuration file nginx-static.conf test is successful'
      }
    ]
  }),
  createQuest({
    id: 'server_reverse_proxy',
    title: 'Reverse Proxy to Application Server',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Configure NGINX to proxy requests on port 80 to a backend running on port 3000.',
    skillOutcomes: [
      'Understand reverse proxy concepts.',
      'Configure proxy_pass directives.',
      'Map external requests to internal application ports.'
    ],
    commands: [
      {
        title: 'Configure Reverse Proxy',
        explanation: 'A reverse proxy accepts client requests, forwards them to a backend server, and returns the response.',
        command: 'echo "server { listen 80; location / { proxy_pass http://127.0.0.1:3000; } }" > nginx-proxy.conf',
        output: 'Wrote nginx-proxy.conf.'
      },
      {
        title: 'Validate Proxy Configuration',
        explanation: 'Ensure the proxy_pass syntax and location matching are correct.',
        command: 'nginx -t -c nginx-proxy.conf',
        output: 'nginx: the configuration file nginx-proxy.conf syntax is ok\nnginx: configuration file nginx-proxy.conf test is successful'
      }
    ]
  }),
  createQuest({
    id: 'server_upstream_lb',
    title: 'Upstream Load Balancing',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Configure an upstream block to round-robin requests between multiple backend hosts.',
    skillOutcomes: [
      'Define upstream server pools in NGINX.',
      'Configure load-balanced proxying.',
      'Distribute traffic across multiple application instances.'
    ],
    commands: [
      {
        title: 'Create Upstream Pool Configuration',
        explanation: 'An upstream block defines a group of servers that NGINX can distribute traffic to, enabling load balancing.',
        command: 'echo "upstream backend_hosts { server 10.0.1.5:3000; server 10.0.1.6:3000; } server { listen 80; location / { proxy_pass http://backend_hosts; } }" > nginx-lb.conf',
        output: 'Wrote nginx-lb.conf.'
      },
      {
        title: 'Validate Upstream Configuration',
        explanation: 'Check that the upstream block name matches the proxy_pass target.',
        command: 'nginx -t -c nginx-lb.conf',
        output: 'nginx: the configuration file nginx-lb.conf syntax is ok\nnginx: configuration file nginx-lb.conf test is successful'
      }
    ]
  }),
  createQuest({
    id: 'server_cache_compression',
    title: 'Cache Headers and Gzip Compression',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Enable gzip compression and configure browser cache control headers in NGINX.',
    skillOutcomes: [
      'Configure gzip compression to reduce transfer sizes.',
      'Define caching headers for static assets.',
      'Improve website performance and decrease load times.'
    ],
    commands: [
      {
        title: 'Enable Compression and Caching',
        explanation: 'Enabling gzip reduces bandwidth usage, and expires headers tell browsers to cache resources locally.',
        command: 'echo "gzip on; gzip_types text/plain application/json; expires 1d; add_header Cache-Control public;" > nginx-perf.conf',
        output: 'Wrote nginx-perf.conf.'
      },
      {
        title: 'Verify Performance Configuration',
        explanation: 'Verify that gzip syntax and cache header formatting are correct.',
        command: 'nginx -t -c nginx-perf.conf',
        output: 'nginx: the configuration file nginx-perf.conf syntax is ok\nnginx: configuration file nginx-perf.conf test is successful'
      }
    ]
  }),
  createQuest({
    id: 'server_log_reading',
    title: 'Log Formats and Log Analysis',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Analyze NGINX access logs to identify response anomalies.',
    skillOutcomes: [
      'Locate and inspect NGINX log directories.',
      'Filter access logs for error codes.',
      'Deduce application errors from response status codes.'
    ],
    commands: [
      {
        title: 'View Access Logs',
        explanation: 'The access log records every request processed by the server. Inspecting the latest logs is key during incidents.',
        command: 'tail -n 10 /var/log/nginx/access.log',
        output: '127.0.0.1 - - [25/May/2026:12:00:01] "GET / HTTP/1.1" 200 612\n127.0.0.1 - - [25/May/2026:12:00:05] "POST /api HTTP/1.1" 500 24\n127.0.0.1 - - [25/May/2026:12:00:10] "GET /static/logo.png HTTP/1.1" 304 0'
      },
      {
        title: 'Filter Internal Server Errors',
        explanation: 'Searching logs for HTTP status code 500 helps isolate API or application failures.',
        command: 'grep " 500 " /var/log/nginx/access.log',
        output: '127.0.0.1 - - [25/May/2026:12:00:05] "POST /api HTTP/1.1" 500 24'
      }
    ]
  }),
  createQuest({
    id: 'server_reload_restart',
    title: 'Service Reload vs Restart',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Apply server configurations using reloads, and understand when restarts are needed.',
    skillOutcomes: [
      'Contrast systemd reload vs restart.',
      'Apply NGINX changes gracefully with zero downtime.',
      'Describe service state lifecycle.'
    ],
    commands: [
      {
        title: 'Reload NGINX Config',
        explanation: 'Reloading prompts NGINX to spin up new workers with the new config while existing workers finish active client connections gracefully.',
        command: 'systemctl reload nginx',
        output: 'Nginx service configuration reloaded successfully (graceful transition).'
      },
      {
        title: 'Verify Service Status',
        explanation: 'Check if NGINX is active and active workers are running without faults.',
        command: 'systemctl status nginx',
        output: '● nginx.service - A high performance web server\n   Active: active (running) since Mon 2026-05-25 10:00:00 UTC\n   Process: 1042 ExecReload=/usr/sbin/nginx -g daemon on; master_process on; -s reload (code=exited, status=0/SUCCESS)'
      }
    ]
  }),
  createQuest({
    id: 'server_blue_green',
    title: 'Blue/Green Upstream Switching',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Deploy a green release upstream and switch NGINX routing from blue to green.',
    skillOutcomes: [
      'Model a blue/green deployment config.',
      'Switch upstream servers in NGINX config.',
      'Trigger graceful reload to apply routing changes.'
    ],
    commands: [
      {
        title: 'Update Upstream Target',
        explanation: 'In blue/green deployments, traffic is shifted from the old environment (blue) to the new environment (green) at the router/load balancer layer.',
        command: 'echo "upstream backend { server 10.0.1.20:3000; }" > nginx-bluegreen.conf',
        output: 'Wrote nginx-bluegreen.conf.'
      },
      {
        title: 'Apply Graceful Switch',
        explanation: 'Reloading the configuration shifts all incoming requests immediately to the green environment with no downtime.',
        command: 'systemctl reload nginx',
        output: 'Nginx service configuration reloaded successfully (graceful transition).'
      }
    ]
  }),
  createQuest({
    id: 'server_rate_limit_hardening',
    title: 'Rate Limiting and Hardening',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Configure NGINX rate limiting to secure a backend endpoint against brute-force attacks.',
    skillOutcomes: [
      'Define a rate limit zone based on client IP.',
      'Apply rate limits to sensitive locations.',
      'Explain how rate limits protect service reliability.'
    ],
    commands: [
      {
        title: 'Create Rate Limit Configuration',
        explanation: 'A rate limiting zone allocates shared memory (one:10m) to track client IPs and limit their request rate (e.g., 1 request per second).',
        command: 'echo "limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;" > nginx-limit.conf',
        output: 'Wrote nginx-limit.conf.'
      },
      {
        title: 'Validate Rate Limit Syntax',
        explanation: 'Test the rate-limiting configuration to ensure zone mapping is valid.',
        command: 'nginx -t -c nginx-limit.conf',
        output: 'nginx: the configuration file nginx-limit.conf syntax is ok\nnginx: configuration file nginx-limit.conf test is successful'
      }
    ]
  }),
  createQuest({
    id: 'server_cert_renewal',
    title: 'TLS Certificate Renewal',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Test SSL/TLS certificate renewal using Certbot command-line utilities.',
    skillOutcomes: [
      'Verify TLS certificate status.',
      'Run dry-run certificate renewal.',
      'Understand automated cron renewal hooks.'
    ],
    commands: [
      {
        title: 'Execute Certbot Dry Run',
        explanation: 'Certbot connects to Let\'s Encrypt to renew certificates. Running a dry-run tests domain validation paths without hitting rate limits.',
        command: 'certbot renew --dry-run',
        output: 'Processing /etc/letsencrypt/renewal/api.internal.conf\nSimulating renewal of an existing cert...\nCongratulations, all simulated renewals succeeded!'
      }
    ]
  }),
  createQuest({
    id: 'server_proxy_capstone',
    title: 'Capstone: Fix a Broken Reverse Proxy Rollout',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Diagnose NGINX reverse proxy returning 502, fix the configuration file, and reload services.',
    prerequisites: [
      'server_reverse_proxy',
      'server_log_reading',
      'server_reload_restart'
    ],
    skillOutcomes: [
      'Diagnose bad upstream reverse proxy configurations.',
      'Correct application target port details.',
      'Verify syntax and reload configuration to restore services.'
    ],
    commands: [
      {
        title: 'Inspect Current Configuration',
        explanation: 'When clients receive HTTP 502 Bad Gateway, inspect the NGINX configuration site definitions first to verify where NGINX is routing requests.',
        command: 'cat /etc/nginx/sites-available/default',
        output: 'server {\n    listen 80;\n    location / {\n        proxy_pass http://127.0.0.1:3999; # app runs on 3000!\n    }\n}'
      },
      {
        title: 'Correct Application Proxy Target',
        explanation: 'Write the corrected location proxy configuration block mapping requests to the true port 3000.',
        command: 'echo "server { listen 80; location / { proxy_pass http://127.0.0.1:3000; } }" > /etc/nginx/sites-available/default',
        output: 'Wrote /etc/nginx/sites-available/default.'
      },
      {
        title: 'Validate Corrected Configuration',
        explanation: 'Confirm NGINX syntax is correct after manual modification.',
        command: 'nginx -t',
        output: 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful'
      },
      {
        title: 'Reload Web Server Configuration',
        explanation: 'Reload NGINX to apply the config. Requests will route to port 3000, bringing the site back online.',
        command: 'systemctl reload nginx',
        output: 'Nginx service configuration reloaded successfully (graceful transition).'
      }
    ]
  })
];

export const serverManagementModule = createModule({
  id: 5,
  title: 'Server Management',
  icon: 'server',
  description: 'Operate web servers, reverse proxies, logs, reloads, and rollout safety.',
  detailedInfo: 'Server management connects application runtime, proxy configuration, logging, performance, and reliability practices.',
  outcomes: [
    'Configure reverse proxies and upstreams.',
    'Read web server logs during incidents.',
    'Reload and roll out configuration safely.',
    'Set up rate limits and TLS certificates.'
  ],
  resources: [
    { name: 'The NGINX Handbook', url: 'https://www.freecodecamp.org/news/the-nginx-handbook/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Server Management', [
    {
      question: 'What is the main purpose of a reverse proxy?',
      options: ['To accept client requests and forward them to a backend server', 'To compile code', 'To manage database tables', 'To generate SSH keys'],
      answerIndex: 0,
      explanation: 'A reverse proxy sits in front of backend servers, receiving requests and proxying them to internal resources.'
    },
    {
      question: 'Why validate configuration with nginx -t before reloading?',
      options: ['To prevent server crashes from invalid syntax', 'To make the website load faster', 'To renew certificates automatically', 'To enable debug mode'],
      answerIndex: 0,
      explanation: 'Running a configuration test checks for syntax errors that could cause service downtime if reloaded or restarted.'
    },
    {
      question: 'What does systemctl reload do compared to systemctl restart?',
      options: [
        'Reload reads the config gracefully without stopping active connections; restart stops and starts the service',
        'Reload deletes current configurations',
        'Restart preserves active connections and runs a dry run',
        'Reload is only for databases'
      ],
      answerIndex: 0,
      explanation: 'Reload triggers a graceful configuration refresh, whereas restart causes a hard stop and start of the service.'
    },
    {
      question: 'Which block in NGINX configuration handles load balancing servers?',
      options: ['upstream', 'server_name', 'location', 'http2'],
      answerIndex: 0,
      explanation: 'The upstream directive defines pools of servers that can be referenced in proxy_pass blocks to achieve load balancing.'
    },
    {
      question: 'What does NGINX return if it cannot reach your backend upstream?',
      options: ['502 Bad Gateway', '200 OK', '404 Not Found', '401 Unauthorized'],
      answerIndex: 0,
      explanation: 'An HTTP 502 indicates that NGINX is proxying requests to a port or socket that is down or not responding.'
    },
    {
      question: 'What does Certbot help automate in server management?',
      options: ['TLS/SSL certificate renewal', 'Database backups', 'Static site builds', 'Nginx load balancing configurations'],
      answerIndex: 0,
      explanation: 'Certbot interacts with Let\'s Encrypt to request, validate, configure, and renew TLS certificates.'
    },
    {
      question: 'Why configure NGINX rate limiting?',
      options: ['To protect endpoints from DDoS and brute force attacks', 'To reduce image sizes', 'To compress text responses', 'To limit access to SSH keys'],
      answerIndex: 0,
      explanation: 'Rate limiting controls incoming traffic, preventing specific IPs from overwhelming servers or brute forcing endpoints.'
    },
    {
      question: 'What does the gzip directive in NGINX accomplish?',
      options: ['Compresses responses to reduce bandwidth and speed up delivery', 'Encrypts log files', 'Limits concurrent connections', 'Creates a secure tunnel'],
      answerIndex: 0,
      explanation: 'gzip compression reduces file transfer size (HTML, JS, CSS, JSON), improving performance over the network.'
    }
  ])
});
