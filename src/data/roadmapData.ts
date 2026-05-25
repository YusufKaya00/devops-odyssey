export interface Quest {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  objective: string;
  stepsWindows: string[];
  stepsLinux: string[];
  verificationCommand: string;
  validatorKey: string; // Used by local Express server to know how to check it
  hint?: string;
}

export interface ResourceLink {
  name: string;
  url: string;
  free: boolean;
}

export interface ModuleData {
  id: number;
  title: string;
  icon: string;
  description: string;
  detailedInfo: string;
  resources: ResourceLink[];
  quests: Quest[];
}

export interface BookData {
  title: string;
  author: string;
  description: string;
  link: string;
}

export interface ToolData {
  category: string;
  tools: string[];
}

export const roadmapModules: ModuleData[] = [
  {
    id: 1,
    title: "Git & Version Control",
    icon: "git-branch",
    description: "Learn Git commands, branching, merging, and collaboration patterns.",
    detailedInfo: "All DevOps resources, application code, and infrastructure configurations are managed in Git. Git is a source code management tool used to track changes and collaborate.",
    resources: [
      { name: "Pro Git Book", url: "https://git-scm.com/book/en/v2", free: true },
      { name: "Learn Git by Atlassian", url: "https://www.atlassian.com/git", free: true },
      { name: "Learn Git Branching (Interactive)", url: "https://learngitbranching.js.org/", free: true },
      { name: "Git Command Explorer", url: "https://gitexplorer.com/", free: true }
    ],
    quests: [
      {
        id: "git_init",
        title: "Initialize Sandbox Repo",
        difficulty: "Beginner",
        objective: "Create a directory called 'devops-sandbox' in your project root, initialize it as a Git repository, and commit your first file.",
        stepsWindows: [
          "Open your terminal and navigate to the project directory.",
          "Create a directory: 'mkdir devops-sandbox'",
          "Enter directory: 'cd devops-sandbox'",
          "Initialize Git: 'git init'",
          "Create a file README.md: 'New-Item README.md -Value \"# DevOps Sandbox\"'",
          "Add and commit: 'git add README.md' and 'git commit -m \"First commit\"'"
        ],
        stepsLinux: [
          "Open your terminal and navigate to the project directory.",
          "Create a directory: 'mkdir devops-sandbox'",
          "Enter directory: 'cd devops-sandbox'",
          "Initialize Git: 'git init'",
          "Create a file README.md: 'echo \"# DevOps Sandbox\" > README.md'",
          "Add and commit: 'git add README.md' and 'git commit -m \"First commit\"'"
        ],
        verificationCommand: "Checks if 'devops-sandbox/.git' exists and has at least one commit.",
        validatorKey: "git_init",
        hint: "Make sure git is installed on your computer. Run 'git --version' to check."
      },
      {
        id: "git_branch",
        title: "Branching & Merging",
        difficulty: "Intermediate",
        objective: "Create a branch named 'feature-devops', add a file, commit it, and verify that the branch exists.",
        stepsWindows: [
          "Navigate to the sandbox directory: 'cd devops-sandbox'",
          "Create and checkout branch: 'git checkout -b feature-devops'",
          "Create file quest.txt: 'New-Item quest.txt -Value \"DevOps Quest Complete!\"'",
          "Add and commit: 'git add quest.txt' and 'git commit -m \"Add quest file\"'"
        ],
        stepsLinux: [
          "Navigate to the sandbox directory: 'cd devops-sandbox'",
          "Create and checkout branch: 'git checkout -b feature-devops'",
          "Create file quest.txt: 'echo \"DevOps Quest Complete!\" > quest.txt'",
          "Add and commit: 'git add quest.txt' and 'git commit -m \"Add quest file\"'"
        ],
        verificationCommand: "Checks if the branch 'feature-devops' exists in 'devops-sandbox'.",
        validatorKey: "git_branch",
        hint: "Use 'git branch' to view all your local branches."
      },
      {
        id: "git_reflog",
        title: "Git Reflog Recovery",
        difficulty: "Advanced",
        objective: "Learn to recover a deleted commit or branch using git reflog. You will simulate committing a temporary file, deleting it via a hard reset, and then recovering it by finding its SHA in the reflog.",
        stepsWindows: [
          "Enter your git sandbox: 'cd devops-sandbox'",
          "Create a temporary file: 'New-Item temp.txt -Value \"Oops, deleted!\"'",
          "Stage and commit: 'git add temp.txt' and 'git commit -m \"Temp commit to delete\"'",
          "Reset HEAD to discard it: 'git reset --hard HEAD~1'",
          "Find your deleted commit's SHA using: 'git reflog'",
          "Recover the deleted commit to a new branch: 'git branch recovery-branch <deleted-SHA>'"
        ],
        stepsLinux: [
          "Enter your git sandbox: 'cd devops-sandbox'",
          "Create a temporary file: 'echo \"Oops, deleted!\" > temp.txt'",
          "Stage and commit: 'git add temp.txt' and 'git commit -m \"Temp commit to delete\"'",
          "Reset HEAD to discard it: 'git reset --hard HEAD~1'",
          "Find your deleted commit's SHA using: 'git reflog'",
          "Recover the deleted commit to a new branch: 'git branch recovery-branch <deleted-SHA>'"
        ],
        verificationCommand: "Verifies if the branch 'recovery-branch' exists in 'devops-sandbox' and contains the restored commit.",
        validatorKey: "git_reflog",
        hint: "Run 'git reflog' to list all HEAD movements. Look for the commit message 'Temp commit to delete' and copy its 7-character hash."
      }
    ]
  },
  {
    id: 2,
    title: "Programming Language",
    icon: "code",
    description: "Learn Python, Go, or JavaScript to write automation scripts.",
    detailedInfo: "DevOps engineers write automation scripts, tools, and Kubernetes operators. Knowing Python or Go is crucial for scripting tasks and automating infrastructure.",
    resources: [
      { name: "Automate the Boring Stuff with Python", url: "https://automatetheboringstuff.com/", free: true },
      { name: "Eloquent JavaScript", url: "https://eloquentjavascript.net/", free: true },
      { name: "Go by Example", url: "https://gobyexample.com/", free: true }
    ],
    quests: [
      {
        id: "py_health",
        title: "Create Python Healthcheck",
        difficulty: "Beginner",
        objective: "Write a python script in 'devops-sandbox' named 'health_check.py' that performs a check on a URL.",
        stepsWindows: [
          "Create a file 'health_check.py' inside the 'devops-sandbox' directory.",
          "Write the code to query a URL: 'New-Item health_check.py -Value \"import urllib.request; response = urllib.request.urlopen(\\'https://httpbin.org/status/200\\'); print(\\'OK\\' if response.getcode() == 200 else \\'FAILED\\')\"'",
          "Run the python script: 'python health_check.py'"
        ],
        stepsLinux: [
          "Create a file 'health_check.py' inside the 'devops-sandbox' directory.",
          "Write the code to query a URL: 'echo \"import urllib.request; response = urllib.request.urlopen(\\'https://httpbin.org/status/200\\'); print(\\'OK\\' if response.getcode() == 200 else \\'FAILED\\')\" > health_check.py'",
          "Run the python script: 'python3 health_check.py'"
        ],
        verificationCommand: "Checks if 'health_check.py' exists in 'devops-sandbox' and contains Python import and fetch code.",
        validatorKey: "py_health",
        hint: "Use python's built-in urllib if requests is not installed, e.g., 'import urllib.request; response = urllib.request.urlopen(\"https://httpbin.org/status/200\"); print(\"OK\" if response.getcode() == 200 else \"FAILED\")'"
      }
    ]
  },
  {
    id: 3,
    title: "Linux & Scripting",
    icon: "terminal",
    description: "Make yourself comfortable with Linux/Unix OS and Bash scripting.",
    detailedInfo: "Since most servers run Linux, you need to understand system paths, permissions, processes, and scripting (Bash/Powershell) to automate administrative tasks.",
    resources: [
      { name: "Shell Scripting Tutorial", url: "https://www.shellscript.sh/", free: true },
      { name: "Linux Command Handbook", url: "https://www.freecodecamp.org/news/the-linux-commands-handbook/", free: true },
      { name: "Bash Reference Manual", url: "https://www.gnu.org/software/bash/manual/", free: true }
    ],
    quests: [
      {
        id: "bash_backup",
        title: "Automate File Backup",
        difficulty: "Intermediate",
        objective: "Create a backup script in 'devops-sandbox' that copies files to a backup directory.",
        stepsWindows: [
          "Create a PowerShell script 'backup.ps1' inside 'devops-sandbox'.",
          "Add code to check and copy files: 'New-Item backup.ps1 -Value \"if (-not (Test-Path backup_dest)) { New-Item -ItemType Directory -Path backup_dest }; Copy-Item README.md, quest.txt -Destination backup_dest\"'",
          "Run the script in PowerShell: '.\\backup.ps1'"
        ],
        stepsLinux: [
          "Create a Bash script 'backup.sh' inside 'devops-sandbox'.",
          "Add code to check and copy files: 'echo -e \"#!/bin/bash\\nmkdir -p backup_dest\\ncp README.md quest.txt backup_dest/\" > backup.sh'",
          "Make the script executable: 'chmod +x backup.sh'",
          "Run the script in Bash: './backup.sh'"
        ],
        verificationCommand: "Checks if 'backup_dest/README.md' and 'backup_dest/quest.txt' are successfully copied.",
        validatorKey: "bash_backup",
        hint: "Make sure you execute the script so it creates the target backup folder and copies the files."
      },
      {
        id: "linux_permissions",
        title: "File Permissions & Security",
        difficulty: "Beginner",
        objective: "Create a shell script (or powershell script on Windows) and configure its permissions to make it executable by the owner.",
        stepsWindows: [
          "Create a file named 'run_check.ps1' in 'devops-sandbox'.",
          "Add code: 'New-Item run_check.ps1 -Value \"Write-Host \\'Checks Completed\\'\"'",
          "Run script with bypass execution policy: 'powershell -ExecutionPolicy Bypass -File .\\run_check.ps1'"
        ],
        stepsLinux: [
          "Create a file named 'run_check.sh' in 'devops-sandbox'.",
          "Add code: 'echo -e \"#!/bin/bash\\necho \\'Checks Completed\\'\" > run_check.sh'",
          "Grant executable permission to the script: 'chmod 755 run_check.sh'",
          "Execute the script: './run_check.sh'"
        ],
        verificationCommand: "Checks if the file 'run_check.sh' (or 'run_check.ps1' on Windows) exists and is executable/has content.",
        validatorKey: "linux_permissions",
        hint: "On Linux, run 'chmod +x run_check.sh' or 'chmod 755 run_check.sh'. On Windows, verify you can run it via PowerShell script arguments."
      }
    ]
  },
  {
    id: 4,
    title: "Networking & Security",
    icon: "shield",
    description: "Understand protocols, ports, DNS, firewalls, and HTTPS.",
    detailedInfo: "Networking allows servers to communicate. You must understand the OSI model, DNS resolution, port binding, IP subnets, and SSL/TLS certificates to troubleshoot connectivity.",
    resources: [
      { name: "OSI Model Explained", url: "https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/", free: true },
      { name: "How DNS Works (Comic)", url: "https://howdns.works/", free: true },
      { name: "How HTTPS Works (Comic)", url: "https://howhttps.works/", free: true }
    ],
    quests: [
      {
        id: "port_scan",
        title: "Verify Service Port",
        difficulty: "Beginner",
        objective: "Verify that a port is actively listening. We will test if our DevOps Dashboard backend (port 5001) is active and running.",
        stepsWindows: [
          "Ensure your dev server is active ('npm run dev').",
          "Test connectivity on port 5001: 'Test-NetConnection -Port 5001 -ComputerName localhost'",
          "Click Verify Quest to complete."
        ],
        stepsLinux: [
          "Ensure your dev server is active ('npm run dev').",
          "Test connectivity on port 5001: 'nc -zv localhost 5001' or 'curl -I http://localhost:5001/api/health'",
          "Click Verify Quest to complete."
        ],
        verificationCommand: "Verifies if the server can bind and ping port 5001 locally.",
        validatorKey: "port_scan",
        hint: "This server runs on port 5001 by default. As long as you run this simulator site locally via 'npm run dev', this task will verify!"
      }
    ]
  },
  {
    id: 5,
    title: "Server Management",
    icon: "server",
    description: "Learn web servers (Nginx, Apache), caching, proxies, and load balancers.",
    detailedInfo: "Web servers host application endpoints. Reverse proxies route traffic, handle SSL termination, cache responses, and load balance requests across backend instances.",
    resources: [
      { name: "The NGINX Handbook", url: "https://www.freecodecamp.org/news/the-nginx-handbook/", free: true },
      { name: "What is a Reverse Proxy?", url: "https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/", free: true },
      { name: "What is Load Balancing?", url: "https://www.cloudflare.com/learning/performance/what-is-load-balancing/", free: true }
    ],
    quests: [
      {
        id: "nginx_config",
        title: "Nginx Mock Config",
        difficulty: "Intermediate",
        objective: "Write a mock Nginx configuration file simulating a reverse proxy setup to port 3000.",
        stepsWindows: [
          "Create Nginx file in 'devops-sandbox': 'New-Item nginx.conf -Value \"server { listen 80; location / { proxy_pass http://localhost:3000; } }\"'",
          "Verify file exists in the directory."
        ],
        stepsLinux: [
          "Create Nginx file in 'devops-sandbox': 'echo \"server { listen 80; location / { proxy_pass http://localhost:3000; } }\" > nginx.conf'",
          "Verify file exists in the directory."
        ],
        verificationCommand: "Parses 'nginx.conf' to ensure it contains 'listen 80', 'location /', and 'proxy_pass http://localhost:3000'.",
        validatorKey: "nginx_config",
        hint: "A standard block looks like: server { listen 80; location / { proxy_pass http://localhost:3000; } }"
      }
    ]
  },
  {
    id: 6,
    title: "Containers (Docker)",
    icon: "package",
    description: "Package applications in Docker containers, configure networking and volumes.",
    detailedInfo: "Containers sandbox applications with their dependencies. Docker allows packaging, distribution, and running containerized services reliably across environments.",
    resources: [
      { name: "Docker Crash Course by TechWorld with Nana", url: "https://www.youtube.com/watch?v=pg19Z8LL06w", free: true },
      { name: "Docker Tutorial for Beginners", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", free: true },
      { name: "Docker Compose Tutorial", url: "https://www.youtube.com/watch?v=SXwC9fSwct8", free: true }
    ],
    quests: [
      {
        id: "docker_run",
        title: "Run Nginx Container",
        difficulty: "Beginner",
        objective: "Launch a standard Nginx container named 'devops-nginx-sandbox' running on port 8085.",
        stepsWindows: [
          "Ensure Docker Desktop is running.",
          "Run container in PowerShell: 'docker run -d --name devops-nginx-sandbox -p 8085:80 nginx'",
          "Open your browser and navigate to 'http://localhost:8085' to check it."
        ],
        stepsLinux: [
          "Ensure the Docker service is running: 'sudo systemctl start docker'",
          "Run container in terminal: 'sudo docker run -d --name devops-nginx-sandbox -p 8085:80 nginx'",
          "Open your browser and navigate to 'http://localhost:8085' to check it."
        ],
        verificationCommand: "Queries the local Docker daemon to see if a container named 'devops-nginx-sandbox' is running.",
        validatorKey: "docker_run",
        hint: "If the container already exists and is stopped, run 'docker start devops-nginx-sandbox' or delete it using 'docker rm -f devops-nginx-sandbox' before running."
      },
      {
        id: "docker_compose",
        title: "Docker Compose Application",
        difficulty: "Intermediate",
        objective: "Write a docker-compose.yml file that launches an Nginx server and a Redis container, and start it.",
        stepsWindows: [
          "Create a file 'docker-compose.yml' in 'devops-sandbox'.",
          "Define 'web' service (image nginx, ports 8090:80) and 'cache' service (image redis).",
          "Start compose stack: 'docker-compose up -d'"
        ],
        stepsLinux: [
          "Create a file 'docker-compose.yml' in 'devops-sandbox'.",
          "Define 'web' service (image nginx, ports 8090:80) and 'cache' service (image redis).",
          "Start compose stack: 'sudo docker compose up -d'"
        ],
        verificationCommand: "Verifies if the docker-compose.yml file exists and if the containers are active.",
        validatorKey: "docker_compose",
        hint: "Ensure the compose configuration defines service web and cache, and run 'docker-compose up -d' inside the 'devops-sandbox' folder."
      },
      {
        id: "docker_build",
        title: "Build Custom Docker Image",
        difficulty: "Intermediate",
        objective: "Write a Dockerfile using alpine as a base, add a mock greeting file, and build it into a tagged image 'devops-mock-app:v1.0'.",
        stepsWindows: [
          "Create a file 'Dockerfile' in 'devops-sandbox'.",
          "Add image instructions: 'New-Item Dockerfile -Value \"FROM alpine`nRUN echo \\'Hello DevOps!\\' > /hello.txt`nCMD cat /hello.txt\"'",
          "Build image using Docker CLI: 'docker build -t devops-mock-app:v1.0 .'"
        ],
        stepsLinux: [
          "Create a file 'Dockerfile' in 'devops-sandbox'.",
          "Add image instructions: 'echo -e \"FROM alpine\\nRUN echo \\'Hello DevOps!\\' > /hello.txt\\nCMD cat /hello.txt\" > Dockerfile'",
          "Build image using Docker CLI: 'sudo docker build -t devops-mock-app:v1.0 .'"
        ],
        verificationCommand: "Queries the local Docker engine to check if image 'devops-mock-app:v1.0' exists.",
        validatorKey: "docker_build",
        hint: "Make sure your Docker daemon is active. Run 'docker images' to list all local images and verify it was created."
      }
    ]
  },
  {
    id: 7,
    title: "Container Orchestration",
    icon: "box",
    description: "Manage scale, networking, and deployment with Kubernetes.",
    detailedInfo: "Kubernetes orchestrates fleets of containers, automating scale, self-healing, rolling updates, and internal service discovery.",
    resources: [
      { name: "Kubernetes Crash Course by TechWorld with Nana", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", free: true },
      { name: "Kubernetes Learning Path - Microsoft", url: "https://azure.microsoft.com/en-us/resources/kubernetes-learning-path/", free: true }
    ],
    quests: [
      {
        id: "k8s_status",
        title: "Check Cluster Access",
        difficulty: "Beginner",
        objective: "Verify that you have kubectl configured and can connect to a local cluster (e.g. Docker Desktop, Minikube, or Kind).",
        stepsWindows: [
          "Ensure your local Kubernetes engine (Docker Desktop K8s/Minikube) is enabled.",
          "Check connection in terminal: 'kubectl cluster-info'",
          "Confirm context matches your local cluster."
        ],
        stepsLinux: [
          "Ensure your local Kubernetes engine (Minikube/MicroK8s/Kind) is started.",
          "Check connection in terminal: 'kubectl cluster-info'",
          "Confirm context matches your local cluster."
        ],
        verificationCommand: "Executes 'kubectl cluster-info' to test connection to the API server.",
        validatorKey: "k8s_status",
        hint: "Docker Desktop has a built-in Kubernetes option you can enable in settings, which is easiest for Windows users."
      },
      {
        id: "k8s_deploy",
        title: "Deploy Nginx Pod",
        difficulty: "Intermediate",
        objective: "Create a simple Kubernetes Pod definition or command to deploy Nginx named 'k8s-nginx-pod'.",
        stepsWindows: [
          "Deploy Nginx pod: 'kubectl run k8s-nginx-pod --image=nginx'",
          "Verify status is running: 'kubectl get pods'"
        ],
        stepsLinux: [
          "Deploy Nginx pod: 'kubectl run k8s-nginx-pod --image=nginx'",
          "Verify status is running: 'kubectl get pods'"
        ],
        verificationCommand: "Runs 'kubectl get pod k8s-nginx-pod' to verify its existence and running state.",
        validatorKey: "k8s_deploy",
        hint: "Check pod status using 'kubectl get pods'."
      },
      {
        id: "k8s_service",
        title: "Expose Pod with Kubernetes Service",
        difficulty: "Intermediate",
        objective: "Expose your running 'k8s-nginx-pod' to network traffic by creating a ClusterIP Service named 'k8s-nginx-service' on port 80.",
        stepsWindows: [
          "Create a Kubernetes service pointing to your Nginx pod: 'kubectl expose pod k8s-nginx-pod --name=k8s-nginx-service --port=80 --target-port=80 --type=ClusterIP'",
          "Verify the service details: 'kubectl get service k8s-nginx-service'"
        ],
        stepsLinux: [
          "Create a Kubernetes service pointing to your Nginx pod: 'kubectl expose pod k8s-nginx-pod --name=k8s-nginx-service --port=80 --target-port=80 --type=ClusterIP'",
          "Verify the service details: 'kubectl get service k8s-nginx-service'"
        ],
        verificationCommand: "Checks if the service 'k8s-nginx-service' exists in your cluster and exposes port 80.",
        validatorKey: "k8s_service",
        hint: "Use 'kubectl get service' to verify it is registered and matches the type ClusterIP."
      }
    ]
  },
  {
    id: 8,
    title: "Infrastructure as Code",
    icon: "layers",
    description: "Provision and manage infrastructure using Terraform or Ansible.",
    detailedInfo: "IaC models infrastructure as code files. Terraform handles resource provisioning across cloud platforms, while Ansible manages package configurations and scripts.",
    resources: [
      { name: "Official Terraform Tutorials", url: "https://learn.hashicorp.com/terraform", free: true },
      { name: "Getting Started with Ansible", url: "https://docs.ansible.com/ansible/latest/getting_started/", free: true }
    ],
    quests: [
      {
        id: "tf_local",
        title: "Terraform Local File",
        difficulty: "Beginner",
        objective: "Write a Terraform configuration to create a local text file and run 'terraform apply'.",
        stepsWindows: [
          "Create 'main.tf' in 'devops-sandbox'.",
          "Configure local provider resource block: 'New-Item main.tf -Value \"resource \\\"local_file\\\" \\\"quest\\\" { content = \\\"Terraform was here!\\\" filename = \\\"\\${path.module}/tf_quest.txt\\\" }\"'",
          "Initialize: 'terraform init'",
          "Apply: 'terraform apply -auto-approve'"
        ],
        stepsLinux: [
          "Create 'main.tf' in 'devops-sandbox'.",
          "Configure local provider resource block: 'echo \"resource \\\"local_file\\\" \\\"quest\\\" { content = \\\"Terraform was here!\\\" filename = \\\"\\\${path.module}/tf_quest.txt\\\" }\" > main.tf'",
          "Initialize: 'terraform init'",
          "Apply: 'terraform apply -auto-approve'"
        ],
        verificationCommand: "Checks if 'tf_quest.txt' was successfully created by Terraform and if state file exists.",
        validatorKey: "tf_local",
        hint: "You will need the Terraform binary in your PATH to initialize and apply the configuration."
      }
    ]
  },
  {
    id: 9,
    title: "CI/CD Pipelines",
    icon: "git-commit",
    description: "Automate code build, testing, and deployment (Jenkins, GitHub Actions).",
    detailedInfo: "Continuous Integration validates new code submissions with automated tests. Continuous Deployment ensures that passing builds are pushed to staging or production automatically.",
    resources: [
      { name: "CI/CD Pipeline: A Gentle Introduction", url: "https://semaphoreci.com/blog/cicd-pipeline", free: true },
      { name: "GitHub Actions Tutorial", url: "https://www.youtube.com/watch?v=R8_veQiYBjI", free: true },
      { name: "Continuous Integration by Martin Fowler", url: "https://martinfowler.com/articles/continuousIntegration.html", free: true }
    ],
    quests: [
      {
        id: "gh_workflow",
        title: "Create GitHub Action Workflow",
        difficulty: "Beginner",
        objective: "Create a GitHub Actions workflow YAML configuration file in the correct directory.",
        stepsWindows: [
          "Create folders in project root: 'mkdir .github\\workflows'",
          "Create file: 'New-Item .github\\workflows\\devops_check.yml -Value \"name: DevOps Check\\non: [push]\\njobs:\\n  check:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - run: echo Running local checks\"'",
          "Confirm file layout exists."
        ],
        stepsLinux: [
          "Create folders in project root: 'mkdir -p .github/workflows'",
          "Create file: 'echo -e \"name: DevOps Check\\non: [push]\\njobs:\\n  check:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - run: echo Running local checks\" > .github/workflows/devops_check.yml'",
          "Confirm file layout exists."
        ],
        verificationCommand: "Checks if '.github/workflows/devops_check.yml' exists and has basic YAML keys like 'on' and 'jobs'.",
        validatorKey: "gh_workflow",
        hint: "A minimal action workflow file starts with 'name: ...', 'on: [push]', 'jobs: ...'."
      }
    ]
  },
  {
    id: 10,
    title: "Monitoring & Observability",
    icon: "activity",
    description: "Track system health and visualize logs with Prometheus and Grafana.",
    detailedInfo: "Monitoring observes system health in real-time. Prometheus aggregates time-series metrics from nodes, and Grafana maps them into dashboards to alert on anomalies.",
    resources: [
      { name: "What Is Observability? Beginner Guide", url: "https://devopscube.com/what-is-observability/", free: true },
      { name: "Prometheus Tutorial", url: "https://prometheus.io/docs/tutorials/getting_started/", free: true },
      { name: "Grafana Tutorials", url: "https://grafana.com/tutorials/", free: true }
    ],
    quests: [
      {
        id: "prometheus_mock",
        title: "Prometheus Config",
        difficulty: "Intermediate",
        objective: "Write a mock 'prometheus.yml' configuration detailing targets to scrape.",
        stepsWindows: [
          "Create a file 'prometheus.yml' inside 'devops-sandbox'.",
          "Add configurations: 'New-Item prometheus.yml -Value \"global:\\n  scrape_interval: 15s\\nscrape_configs:\\n  - job_name: node_exporter\\n    static_configs:\\n      - targets: [\\x27localhost:9100\\x27]\"'",
          "Save configuration file."
        ],
        stepsLinux: [
          "Create a file 'prometheus.yml' inside 'devops-sandbox'.",
          "Add configurations: 'echo -e \"global:\\n  scrape_interval: 15s\\nscrape_configs:\\n  - job_name: node_exporter\\n    static_configs:\\n      - targets: [\\x27localhost:9100\\x27]\" > prometheus.yml'",
          "Save configuration file."
        ],
        verificationCommand: "Verifies if 'prometheus.yml' exists and lists 'localhost:9100' inside scrape_configs.",
        validatorKey: "prometheus_mock",
        hint: "Make sure you include the scrape_configs section with node_exporter target."
      }
    ]
  },
  {
    id: 11,
    title: "Cloud Provider",
    icon: "cloud",
    description: "Learn core services of a cloud platform (AWS, Azure, GCP).",
    detailedInfo: "Cloud providers virtualize hardware. You need to understand identity management (IAM), compute nodes (EC2/VM), networking (VPC/VNet), and managed storage buckets.",
    resources: [
      { name: "AWS Cloud Practitioner Course", url: "https://www.youtube.com/watch?v=S7XpTAnSDL4", free: true },
      { name: "Microsoft Azure Fundamentals (AZ-900)", url: "https://learn.microsoft.com/en-us/certifications/exams/az-900", free: true }
    ],
    quests: [
      {
        id: "cloud_cli",
        title: "Verify AWS or Azure CLI",
        difficulty: "Beginner",
        objective: "Confirm that you have a cloud command line interface tool (AWS CLI, Azure CLI, or GCP gcloud) installed.",
        stepsWindows: [
          "Install AWS CLI via Windows MSI installer, or Azure CLI via winget: 'winget install Microsoft.AzureCLI'",
          "Open PowerShell and check: 'aws --version' or 'az --version'",
          "Verify the quest."
        ],
        stepsLinux: [
          "Install AWS CLI or Azure CLI via package manager (e.g. 'sudo apt install awscli' or curl scripts).",
          "Open terminal and check: 'aws --version' or 'az --version'",
          "Verify the quest."
        ],
        verificationCommand: "Checks if 'aws' or 'az' commands are executable on your local machine.",
        validatorKey: "cloud_cli",
        hint: "Install the CLI and verify it's registered in your terminal path environment variable."
      }
    ]
  },
  {
    id: 12,
    title: "Software Engineering Practices",
    icon: "users",
    description: "Understand SDLC, Scrum, agile flow, and automation testing.",
    detailedInfo: "DevOps bridges Dev and Ops. You must learn Software Development Life Cycle (SDLC) models, Scrum meetings, sprint cycles, and automated unit/integration testing methodologies.",
    resources: [
      { name: "What is Scrum?", url: "https://www.atlassian.com/agile/scrum", free: true },
      { name: "SDLC Phases & Models", url: "https://www.guru99.com/software-development-life-cycle-tutorial.html", free: true }
    ],
    quests: [
      {
        id: "agile_backlog",
        title: "Create Backlog JSON",
        difficulty: "Beginner",
        objective: "Model an agile board backlog by creating a 'backlog.json' file representing active development sprints.",
        stepsWindows: [
          "Create file 'backlog.json' inside 'devops-sandbox'.",
          "Populate file with a JSON array: 'New-Item backlog.json -Value \"[ { \\\"id\\\": 1, \\\"title\\\": \\\"Containerize frontend\\\", \\\"status\\\": \\\"In Progress\\\", \\\"points\\\": 5 }, { \\\"id\\\": 2, \\\"title\\\": \\\"Configure K8s ingress\\\", \\\"status\\\": \\\"To Do\\\", \\\"points\\\": 8 } ]\"'",
          "Save the file."
        ],
        stepsLinux: [
          "Create file 'backlog.json' inside 'devops-sandbox'.",
          "Populate file with a JSON array: 'echo \"[ { \\\"id\\\": 1, \\\"title\\\": \\\"Containerize frontend\\\", \\\"status\\\": \\\"In Progress\\\", \\\"points\\\": 5 }, { \\\"id\\\": 2, \\\"title\\\": \\\"Configure K8s ingress\\\", \\\"status\\\": \\\"To Do\\\", \\\"points\\\": 8 } ]\" > backlog.json'",
          "Save the file."
        ],
        verificationCommand: "Parses 'backlog.json' and checks that it is a valid JSON array containing items with fields: id, title, and status.",
        validatorKey: "agile_backlog",
        hint: "JSON properties must be wrapped in double quotes: e.g. [ { \"id\": 1, \"title\": \"Dockerize site\", \"status\": \"To Do\", \"points\": 5 } ]"
      }
    ]
  }
];

export const devopsBooks: BookData[] = [
  {
    title: "The DevOps Handbook",
    author: "Gene Kim, Patrick Debois, John Willis, Jez Humble",
    description: "How to Create World-Class Agility, Reliability, and Security in Technology Organizations. Essential reading.",
    link: "https://amzn.to/3IJPv0h"
  },
  {
    title: "Accelerate",
    author: "Nicole Forsgren, Jez Humble, Gene Kim",
    description: "The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations.",
    link: "https://amzn.to/3XRShoA"
  },
  {
    title: "Continuous Delivery",
    author: "Jez Humble, David Farley",
    description: "Reliable Software Releases through Build, Test, and Deployment Automation. Established pipeline standards.",
    link: "https://amzn.to/3XRShoA"
  },
  {
    title: "The Phoenix Project",
    author: "Gene Kim, Kevin Behr, George Spafford",
    description: "A classic novel about IT operations, DevOps workflows, and helping business win. Highly recommended.",
    link: "https://amzn.to/3Z6VSQG"
  },
  {
    title: "Site Reliability Engineering",
    author: "Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy",
    description: "Explains Google's production development, deployment, and monitoring practices. Available free online.",
    link: "https://sre.google/books/"
  }
];

export const devopsTools: ToolData[] = [
  {
    category: "Work Tracking",
    tools: ["Jira", "Trello", "Asana", "Monday", "Azure Boards"]
  },
  {
    category: "Source Code Control",
    tools: ["Git", "GitHub", "GitLab", "BitBucket", "Azure DevOps"]
  },
  {
    category: "CI/CD",
    tools: ["Jenkins", "GitHub Actions", "GitLab CI/CD", "CircleCI", "TeamCity", "ArgoCD"]
  },
  {
    category: "IaC & Configuration",
    tools: ["Terraform", "Ansible", "OpenTofu", "Chef", "Puppet"]
  },
  {
    category: "Containers & Orchestration",
    tools: ["Docker", "Kubernetes", "Docker Compose", "OpenShift", "Podman"]
  },
  {
    category: "Monitoring & Logging",
    tools: ["Prometheus", "Grafana", "Elastic Stack (ELK)", "Datadog", "Splunk"]
  }
];
