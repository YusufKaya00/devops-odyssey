import { gitDeepDiveQuests, gitModuleQuiz } from './gitTraining';
import { expandRoadmapModules } from './additionalTraining';

export interface InteractiveStep {
  title: string;
  explanation: string;
  expectedCommand: string;
  acceptedCommands?: string[];
  hint: string;
  mockOutput: string;
}

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
  interactiveSteps: InteractiveStep[]; // Sub-steps for interactive browser shell
}

export interface ResourceLink {
  name: string;
  url: string;
  free: boolean;
}

export interface ModuleQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ModuleData {
  id: number;
  title: string;
  icon: string;
  description: string;
  detailedInfo: string;
  resources: ResourceLink[];
  quests: Quest[];
  quiz?: ModuleQuizQuestion[];
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

const baseRoadmapModules: ModuleData[] = [
  {
    id: 1,
    title: "Git & Version Control",
    icon: "git-branch",
    description: "Learn Git commands, branching, merging, and collaboration patterns.",
    detailedInfo: "All DevOps resources, application code, and infrastructure configurations are managed in Git. This path is now a long simulation course: you practice snapshots, staging, branching, merge conflicts, remotes, undo workflows, stash, tags, rebase, recovery, hooks, submodules, and worktrees before taking the module quiz.",
    resources: [
      { name: "Pro Git Book", url: "https://git-scm.com/book/en/v2", free: true },
      { name: "Learn Git by Atlassian", url: "https://www.atlassian.com/git", free: true },
      { name: "Learn Git Branching (Interactive)", url: "https://learngitbranching.js.org/", free: true },
      { name: "Git Command Explorer", url: "https://gitexplorer.com/", free: true }
    ],
    quests: gitDeepDiveQuests,
    quiz: gitModuleQuiz
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
        objective: "Write a python script named 'health_check.py' that performs a check on a URL.",
        stepsWindows: [
          "Create a file 'health_check.py'",
          "Write the code: 'New-Item health_check.py -Value \"import urllib.request; response = urllib.request.urlopen(\\'https://httpbin.org/status/200\\'); print(\\'OK\\' if response.getcode() == 200 else \\'FAILED\\')\"'",
          "Run script: 'python health_check.py'"
        ],
        stepsLinux: [
          "Create a file 'health_check.py'",
          "Write the code: 'echo \"import urllib.request; response = urllib.request.urlopen(\\'https://httpbin.org/status/200\\'); print(\\'OK\\' if response.getcode() == 200 else \\'FAILED\\')\" > health_check.py'",
          "Run script: 'python3 health_check.py'"
        ],
        verificationCommand: "Checks if 'health_check.py' exists and contains request logic.",
        validatorKey: "py_health",
        hint: "Use python's built-in urllib or requests module.",
        interactiveSteps: [
          {
            title: "Write Python Automation Script",
            explanation: "DevOps engineers write health checks to poll API endpoints. We will write a small python script utilizing `urllib.request` to check an external HTTP status code.",
            expectedCommand: "echo \"import urllib.request; response = urllib.request.urlopen('https://httpbin.org/status/200'); print('OK' if response.getcode() == 200 else 'FAILED')\" > health_check.py",
            hint: "Type the echo redirection to create health_check.py.",
            mockOutput: "Wrote contents to health_check.py"
          },
          {
            title: "Run the Script",
            explanation: "Verify your automation script operates correctly by executing it inside python interpreter shell.",
            expectedCommand: "python health_check.py",
            hint: "Type: python health_check.py",
            mockOutput: "OK"
          }
        ]
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
        objective: "Create a backup script that copies files to a backup directory.",
        stepsWindows: [
          "Create backup.ps1 inside 'devops-sandbox'.",
          "Run script in PowerShell: '.\\backup.ps1'"
        ],
        stepsLinux: [
          "Create backup.sh inside 'devops-sandbox'.",
          "Run script: './backup.sh'"
        ],
        verificationCommand: "Checks if files are copied to backup destination.",
        validatorKey: "bash_backup",
        hint: "Make sure you execute the script.",
        interactiveSteps: [
          {
            title: "Create Backup Script",
            explanation: "DevOps tasks often involve automated archiving. We will create a script `backup.sh` to copy files into a backup destination folder.",
            expectedCommand: "echo \"echo Running backup...\" > backup.sh",
            hint: "Type: echo \"echo Running backup...\" > backup.sh",
            mockOutput: "Wrote contents to backup.sh"
          },
          {
            title: "Execute Backup Script",
            explanation: "Run your backup automation shell script directly in the terminal.",
            expectedCommand: "./backup.sh",
            hint: "Type: ./backup.sh",
            mockOutput: "Running backup...\nCreating directory: backup_dest\nCopying README.md to backup_dest/README.md\nCopying quest.txt to backup_dest/quest.txt\nDone."
          }
        ]
      },
      {
        id: "linux_permissions",
        title: "File Permissions & Security",
        difficulty: "Beginner",
        objective: "Create a shell script and configure its permissions to make it executable by the owner.",
        stepsWindows: [
          "Create run_check.ps1 in devops-sandbox.",
          "Run script with bypass: 'powershell -ExecutionPolicy Bypass -File .\\run_check.ps1'"
        ],
        stepsLinux: [
          "Create run_check.sh in devops-sandbox.",
          "Grant execute: 'chmod 755 run_check.sh'",
          "Run: './run_check.sh'"
        ],
        verificationCommand: "Checks if script has executable bits set.",
        validatorKey: "linux_permissions",
        hint: "Run 'chmod +x' or 'chmod 755'.",
        interactiveSteps: [
          {
            title: "Create Executive Shell Script",
            explanation: "When you create a file in Linux, it is created with default permissions (usually read/write only, governed by `umask`). Let's create `run_check.sh` first.",
            expectedCommand: "echo \"echo 'Checks Completed'\" > run_check.sh",
            hint: "Type: echo \"echo 'Checks Completed'\" > run_check.sh",
            mockOutput: "Wrote contents to run_check.sh"
          },
          {
            title: "Inspect File Permissions",
            explanation: "DevOps Exam Prep: `ls -l` lists directory contents with detailed permissions metadata. The 10-character string indicates file type and permission flags (e.g. `-rw-r--r--` representing read/write for user, read-only for group and others).",
            expectedCommand: "ls -l run_check.sh",
            hint: "Type: ls -l run_check.sh",
            mockOutput: "-rw-r--r-- 1 student devops 18 May 25 16:00 run_check.sh"
          },
          {
            title: "Modify Octal Permissions",
            explanation: "DevOps Tip: To run a script, it needs execute permissions. `chmod 755` sets Read (4) + Write (2) + Execute (1) = 7 for owner, and Read + Execute = 5 for groups and others. This changes permissions to `-rwxr-xr-x`.",
            expectedCommand: "chmod 755 run_check.sh",
            hint: "Type: chmod 755 run_check.sh",
            mockOutput: "Changed mode of run_check.sh to 755"
          },
          {
            title: "Execute Your Script",
            explanation: "Now run the script using `./run_check.sh` to trigger the commands.",
            expectedCommand: "./run_check.sh",
            hint: "Type: ./run_check.sh",
            mockOutput: "Checks Completed"
          }
        ]
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
        objective: "Verify that a port is actively listening. We will test port 5001.",
        stepsWindows: [
          "Test connectivity: 'Test-NetConnection -Port 5001 -ComputerName localhost'"
        ],
        stepsLinux: [
          "Test connectivity: 'nc -zv localhost 5001'"
        ],
        verificationCommand: "Verifies if port 5001 is active locally.",
        validatorKey: "port_scan",
        hint: "Run netcat (nc) command to check port.",
        interactiveSteps: [
          {
            title: "Scan Listening Ports",
            explanation: "DevOps troubleshooting often requires checking if services are bound to target ports. Netcat (`nc`) is a powerful utility used to scan ports. Running `nc -zv localhost 5001` checks port 5001 (z is zero-I/O scanner mode, v is verbose).",
            expectedCommand: "nc -zv localhost 5001",
            hint: "Type: nc -zv localhost 5001",
            mockOutput: "Connection check to localhost:5001 [TCP] succeeded."
          }
        ]
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
          "Create 'nginx.conf' with server blocks listening on 80 routing to http://localhost:3000."
        ],
        stepsLinux: [
          "Create 'nginx.conf' with server blocks listening on 80 routing to http://localhost:3000."
        ],
        verificationCommand: "Parses 'nginx.conf' for listen 80 and proxy_pass.",
        validatorKey: "nginx_config",
        hint: "Create nginx.conf and write proxy server parameters.",
        interactiveSteps: [
          {
            title: "Write Nginx Reverse Proxy Config",
            explanation: "DevOps certification: A Reverse Proxy forwards client requests to backend servers. Nginx uses `listen 80` to listen on HTTP port 80 and `proxy_pass http://localhost:3000` to direct traffic to internal applications.",
            expectedCommand: "echo \"server { listen 80; location / { proxy_pass http://localhost:3000; } }\" > nginx.conf",
            hint: "Type echo string statement to write nginx.conf configuration.",
            mockOutput: "Wrote contents to nginx.conf"
          }
        ]
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
          "Run container: 'docker run -d --name devops-nginx-sandbox -p 8085:80 nginx'"
        ],
        stepsLinux: [
          "Run container: 'docker run -d --name devops-nginx-sandbox -p 8085:80 nginx'"
        ],
        verificationCommand: "Queries docker daemon to see if devops-nginx-sandbox is running on 8085.",
        validatorKey: "docker_run",
        hint: "Use docker run with --name and -p flags.",
        interactiveSteps: [
          {
            title: "Launch Containerized Server",
            explanation: "Docker CLI: `docker run` starts a container from an image. `-d` runs it detached in the background, `--name` sets a custom identifier, and `-p 8085:80` maps host port 8085 to container internal port 80.",
            expectedCommand: "docker run -d --name devops-nginx-sandbox -p 8085:80 nginx",
            hint: "Type: docker run -d --name devops-nginx-sandbox -p 8085:80 nginx",
            mockOutput: "74ab56cd7e891b0f56bcde432ef100aa56789123bcde45f6a89cde89bf901234\nSuccessfully started container 'devops-nginx-sandbox' on host ports 8085:80"
          },
          {
            title: "Query Container Processes",
            explanation: "Docker Exam Tip: `docker ps` lists active containers. Adding `-a` shows all (even stopped) containers. This command displays uptime, status, mapped ports, and IDs.",
            expectedCommand: "docker ps",
            hint: "Type: docker ps",
            mockOutput: "CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS              NAMES\n74ab56cd7e89   nginx      \"/docker-entrypoint…\"   5 seconds ago   Up 5 seconds   8085->80/tcp       devops-nginx-sandbox"
          }
        ]
      },
      {
        id: "docker_compose",
        title: "Docker Compose Application",
        difficulty: "Intermediate",
        objective: "Write a docker-compose.yml file that launches an Nginx server and a Redis container, and start it.",
        stepsWindows: [
          "Create 'docker-compose.yml' and run 'docker-compose up -d'"
        ],
        stepsLinux: [
          "Create 'docker-compose.yml' and run 'docker-compose up -d'"
        ],
        verificationCommand: "Verifies docker-compose.yml content and checks running compose processes.",
        validatorKey: "docker_compose",
        hint: "Compose defines multiple services in a single YAML file.",
        interactiveSteps: [
          {
            title: "Write Multi-Service Orchestrator Config",
            explanation: "Docker Compose allows you to define and manage multi-container applications in a single YAML file. We will define services for `web` (nginx) and `cache` (redis).",
            expectedCommand: "echo \"version: '3'\nservices:\n  web:\n    image: nginx\n    ports:\n      - 8090:80\n  cache:\n    image: redis\" > docker-compose.yml",
            hint: "Type the echo statement to output a docker-compose.yml configuration file.",
            mockOutput: "Wrote contents to docker-compose.yml"
          },
          {
            title: "Launch Compose Services",
            explanation: "DevOps Tooling: `docker-compose up -d` reads the configuration file in your directory and provisions all networks, volumes, and containers concurrently.",
            expectedCommand: "docker-compose up -d",
            hint: "Type: docker-compose up -d",
            mockOutput: "Creating network \"devops-sandbox_default\" with the default driver\nCreating volume \"devops-sandbox_redis-data\" with default driver\nCreating devops-sandbox_cache_1 ... done\nCreating devops-sandbox_web_1   ... done"
          }
        ]
      },
      {
        id: "docker_build",
        title: "Build Custom Docker Image",
        difficulty: "Intermediate",
        objective: "Write a Dockerfile and build it into a tagged image 'devops-mock-app:v1.0'.",
        stepsWindows: [
          "Create 'Dockerfile' and run 'docker build -t devops-mock-app:v1.0 .'"
        ],
        stepsLinux: [
          "Create 'Dockerfile' and run 'docker build -t devops-mock-app:v1.0 .'"
        ],
        verificationCommand: "Queries docker daemon to check if devops-mock-app:v1.0 exists.",
        validatorKey: "docker_build",
        hint: "Write Dockerfile instructions starting with FROM alpine.",
        interactiveSteps: [
          {
            title: "Create Build Instructions",
            explanation: "Dockerfile: `FROM` defines the base image, `RUN` runs commands during the build phase (creating layers), and `CMD` sets the default process to run when the container starts.",
            expectedCommand: "echo \"FROM alpine\nRUN echo 'Hello DevOps!' > /hello.txt\nCMD cat /hello.txt\" > Dockerfile",
            hint: "Type the echo redirection to create a Dockerfile.",
            mockOutput: "Wrote contents to Dockerfile"
          },
          {
            title: "Trigger Image Build",
            explanation: "Exam Tip: `docker build` processes instructions in sequence. `-t devops-mock-app:v1.0` tags the resulting image, and the final `.` designates the current directory as the build context.",
            expectedCommand: "docker build -t devops-mock-app:v1.0 .",
            hint: "Type: docker build -t devops-mock-app:v1.0 .",
            mockOutput: "Sending build context to Docker daemon  2.048kB\nStep 1/3 : FROM alpine\n ---> 10b981\nStep 2/3 : RUN echo \"Hello DevOps!\" > /hello.txt\n ---> Running in 4f56ab\n ---> 5678cd\nStep 3/3 : CMD cat /hello.txt\n ---> Running in 789efc\n ---> 1234ab\nSuccessfully built 1234ab\nSuccessfully tagged devops-mock-app:v1.0"
          },
          {
            title: "List Custom Images",
            explanation: "Check your local image registry database using `docker images`.",
            expectedCommand: "docker images",
            hint: "Type: docker images",
            mockOutput: "REPOSITORY        TAG       IMAGE ID       CREATED        SIZE\ndevops-mock-app   v1.0      1234ab1234ab   Just now       7.3MB\nnginx             latest    8b5cf68b5cf6   2 days ago     142MB\nredis             latest    06b6d406b6d4   1 week ago     113MB\nalpine            latest    10b98110b981   3 weeks ago    5.6MB"
          }
        ]
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
        objective: "Verify that you have kubectl configured and can connect to a local cluster.",
        stepsWindows: [
          "Check cluster info: 'kubectl cluster-info'"
        ],
        stepsLinux: [
          "Check cluster info: 'kubectl cluster-info'"
        ],
        verificationCommand: "Executes kubectl cluster-info to verify api connection.",
        validatorKey: "k8s_status",
        hint: "Cluster communication relies on active kubeconfig contexts.",
        interactiveSteps: [
          {
            title: "Query Cluster Control Plane",
            explanation: "CKA Exam Tip: `kubectl` uses your local config file (usually located at `~/.kube/config`) to find the API server connection details and credentials. Running `kubectl cluster-info` validates connectivity to the control plane.",
            expectedCommand: "kubectl cluster-info",
            hint: "Type: kubectl cluster-info",
            mockOutput: "Kubernetes control plane is running at https://127.0.0.1:6443\nCoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy"
          }
        ]
      },
      {
        id: "k8s_deploy",
        title: "Deploy Nginx Pod",
        difficulty: "Intermediate",
        objective: "Deploy a single Nginx pod named 'k8s-nginx-pod' in the cluster.",
        stepsWindows: [
          "Deploy pod: 'kubectl run k8s-nginx-pod --image=nginx'"
        ],
        stepsLinux: [
          "Deploy pod: 'kubectl run k8s-nginx-pod --image=nginx'"
        ],
        verificationCommand: "Queries kubectl for status of pod k8s-nginx-pod.",
        validatorKey: "k8s_deploy",
        hint: "Use kubectl run command to spawn pods.",
        interactiveSteps: [
          {
            title: "Create Pod Resource",
            explanation: "Kubernetes core: A Pod is the smallest deployable object in Kubernetes. It encapsulates one or more containers sharing storage and network. `kubectl run <name> --image=<image>` creates a pod imperatively.",
            expectedCommand: "kubectl run k8s-nginx-pod --image=nginx",
            hint: "Type: kubectl run k8s-nginx-pod --image=nginx",
            mockOutput: "pod/k8s-nginx-pod created"
          },
          {
            title: "Inspect Pod Status",
            explanation: "CKA Exam Tip: Use `kubectl get pods` to view basic status. Add `-o wide` to get IPs and Node assignments. Pods transition through Pending, ContainerCreating, and finally Running phases.",
            expectedCommand: "kubectl get pods",
            hint: "Type: kubectl get pods",
            mockOutput: "NAME             READY   STATUS    RESTARTS   AGE\nk8s-nginx-pod    1/1     Running   0          12s"
          }
        ]
      },
      {
        id: "k8s_service",
        title: "Expose Pod with Kubernetes Service",
        difficulty: "Intermediate",
        objective: "Expose your running 'k8s-nginx-pod' by creating a Service named 'k8s-nginx-service' on port 80.",
        stepsWindows: [
          "Expose pod: 'kubectl expose pod k8s-nginx-pod --name=k8s-nginx-service --port=80 --type=ClusterIP'"
        ],
        stepsLinux: [
          "Expose pod: 'kubectl expose pod k8s-nginx-pod --name=k8s-nginx-service --port=80 --type=ClusterIP'"
        ],
        verificationCommand: "Queries kubectl for service k8s-nginx-service.",
        validatorKey: "k8s_service",
        hint: "Use kubectl expose.",
        interactiveSteps: [
          {
            title: "Expose Pod via ClusterIP Service",
            explanation: "CKA Exam Prep: Pods are ephemeral and their IPs can change. A Service provides a stable network endpoint (IP and DNS) and routes traffic to pods using labels. Running `kubectl expose` creates a ClusterIP service (default internal type) to route port 80 requests.",
            expectedCommand: "kubectl expose pod k8s-nginx-pod --name=k8s-nginx-service --port=80 --target-port=80 --type=ClusterIP",
            hint: "Type: kubectl expose pod k8s-nginx-pod --name=k8s-nginx-service --port=80 --target-port=80 --type=ClusterIP",
            mockOutput: "service/k8s-nginx-service exposed"
          },
          {
            title: "Verify Service Registry",
            explanation: "List the registered services. Notice the stable virtual CLUSTER-IP assigned to `k8s-nginx-service` that remains static.",
            expectedCommand: "kubectl get svc",
            hint: "Type: kubectl get svc",
            mockOutput: "NAME                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE\nkubernetes           ClusterIP   10.96.0.1        <none>        443/TCP   10d\nk8s-nginx-service    ClusterIP   10.96.12.45      <none>        80/TCP    5s"
          }
        ]
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
        objective: "Write a Terraform configuration to create a local text file.",
        stepsWindows: [
          "Create main.tf, run 'terraform init' and 'terraform apply'"
        ],
        stepsLinux: [
          "Create main.tf, run 'terraform init' and 'terraform apply'"
        ],
        verificationCommand: "Checks if tf_quest.txt exists and contains Terraform message.",
        validatorKey: "tf_local",
        hint: "Initialize state using terraform init.",
        interactiveSteps: [
          {
            title: "Write Declarative Configuration",
            explanation: "Terraform is a declarative IaC tool. You define the desired state, and Terraform works out the plan to achieve it. We will use the `local_file` resource to write a file.",
            expectedCommand: "echo \"resource \\\"local_file\\\" \\\"quest\\\" { content = \\\"Terraform was here!\\\" filename = \\\"${path.module}/tf_quest.txt\\\" }\" > main.tf",
            hint: "Type the echo statement to create main.tf config.",
            mockOutput: "Wrote contents to main.tf"
          },
          {
            title: "Download Provider Plugins",
            explanation: "DevOps certification: `terraform init` scans configuration files and downloads the necessary provider plugins (e.g. AWS, GCP, local) to the `.terraform` folder.",
            expectedCommand: "terraform init",
            hint: "Type: terraform init",
            mockOutput: "Initializing the backend...\nInitializing provider plugins...\n- Finding latest version of hashicorp/local...\n- Installing hashicorp/local v2.5.1...\nTerraform has been successfully initialized!"
          },
          {
            title: "Provision Infrastructure",
            explanation: "Trigger the provisioning process. `terraform apply` details the execution plan, prompts for confirmation, and writes resource states to `terraform.tfstate`.",
            expectedCommand: "terraform apply",
            hint: "Type: terraform apply",
            mockOutput: "Terraform will perform the following actions:\n  # local_file.quest will be created\n  + resource \"local_file\" \"quest\" {\n      + content  = \"Terraform was here!\"\n      + filename = \"./tf_quest.txt\"\n    }\nPlan: 1 to add, 0 to change, 0 to destroy.\nApplying changes...\nlocal_file.quest: Creating...\nlocal_file.quest: Creation complete after 0s\nApply complete! Resources: 1 added, 0 changed, 0 destroyed."
          }
        ]
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
          "Create .github\\workflows\\devops_check.yml"
        ],
        stepsLinux: [
          "Create .github/workflows/devops_check.yml"
        ],
        verificationCommand: "Checks if yml exists in the github directory.",
        validatorKey: "gh_workflow",
        hint: "Actions use trigger events like on: [push].",
        interactiveSteps: [
          {
            title: "Define Actions Pipeline",
            explanation: "GitHub Actions workflows are declared in YAML files inside the `.github/workflows` folder. The `on: [push]` block defines the trigger event, and `jobs` specify the steps executing on runner nodes.",
            expectedCommand: "echo \"name: DevOps Check\non: [push]\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo Running local checks\" > .github/workflows/devops_check.yml",
            hint: "Type the redirection to create the actions YAML file.",
            mockOutput: "Wrote contents to .github/workflows/devops_check.yml"
          }
        ]
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
          "Create 'prometheus.yml' with scrape targets."
        ],
        stepsLinux: [
          "Create 'prometheus.yml' with scrape targets."
        ],
        verificationCommand: "Checks for file existence and node exporter target.",
        validatorKey: "prometheus_mock",
        hint: "Include scrape_configs section.",
        interactiveSteps: [
          {
            title: "Configure Prometheus Target",
            explanation: "Prometheus collects metrics from monitored targets by scraping metric HTTP endpoints. The `scrape_interval` dictates polling frequencies, and `targets` defines server endpoints (e.g. node_exporter running on port 9100).",
            expectedCommand: "echo \"global:\n  scrape_interval: 15s\nscrape_configs:\n  - job_name: node_exporter\n    static_configs:\n      - targets: ['localhost:9100']\" > prometheus.yml",
            hint: "Type the echo statement to configure prometheus.yml.",
            mockOutput: "Wrote contents to prometheus.yml"
          }
        ]
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
        objective: "Confirm that you have a cloud command line interface tool installed.",
        stepsWindows: [
          "Verify: 'aws --version' or 'az --version'"
        ],
        stepsLinux: [
          "Verify: 'aws --version' or 'az --version'"
        ],
        verificationCommand: "Checks if aws or az executables respond in path.",
        validatorKey: "cloud_cli",
        hint: "Verify system environment variables contain CLI paths.",
        interactiveSteps: [
          {
            title: "Query AWS CLI Version",
            explanation: "DevOps cloud operators use command line tools to manage infrastructure resources globally. `aws --version` queries version metrics.",
            expectedCommand: "aws --version",
            hint: "Type: aws --version",
            mockOutput: "aws-cli/2.15.15 Python/3.11.6 Windows/10"
          }
        ]
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
        objective: "Model an agile board backlog by creating a 'backlog.json' file.",
        stepsWindows: [
          "Create 'backlog.json' with task lists."
        ],
        stepsLinux: [
          "Create 'backlog.json' with task lists."
        ],
        verificationCommand: "Parses backlog.json check array content structure.",
        validatorKey: "agile_backlog",
        hint: "Define backlog cards with id, title, and status.",
        interactiveSteps: [
          {
            title: "Write Backlog Sprint Plan",
            explanation: "DevOps teams track software cycles using boards. Storing backlog snapshots in structured formats like JSON lets automation tools report on sprint statistics.",
            expectedCommand: "echo \"[ { \\\"id\\\": 1, \\\"title\\\": \\\"Containerize\\\", \\\"status\\\": \\\"In Progress\\\" }, { \\\"id\\\": 2, \\\"title\\\": \\\"K8s\\\", \\\"status\\\": \\\"To Do\\\" } ]\" > backlog.json",
            hint: "Type the escaped backlog JSON string.",
            mockOutput: "Wrote contents to backlog.json"
          }
        ]
      }
    ]
  }
];

export const roadmapModules: ModuleData[] = expandRoadmapModules(baseRoadmapModules);

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
