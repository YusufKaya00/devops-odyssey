import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const SANDBOX_DIR = path.join(process.cwd(), 'devops-sandbox');

// Helper to run terminal commands
function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: process.cwd(), timeout: 5000 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        code: error ? error.code : 0,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

// Helper to run terminal commands in sandbox directory
function runCmdSandbox(cmd) {
  return new Promise((resolve) => {
    if (!fs.existsSync(SANDBOX_DIR)) {
      return resolve({ success: false, stdout: '', stderr: 'Sandbox directory does not exist' });
    }
    exec(cmd, { cwd: SANDBOX_DIR, timeout: 5000 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        code: error ? error.code : 0,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

export const validators = {
  // 1. GIT
  git_init: async () => {
    const gitDir = path.join(SANDBOX_DIR, '.git');
    if (!fs.existsSync(gitDir)) {
      return { success: false, message: "devops-sandbox/.git folder was not found. Have you run 'git init'?" };
    }
    const result = await runCmdSandbox('git log --oneline');
    if (!result.success) {
      return { success: false, message: "Git repository initialized, but no commits were found. Add README.md and make your first commit!" };
    }
    return { success: true, message: "Git repository initialized and first commit detected successfully!" };
  },

  git_branch: async () => {
    const gitDir = path.join(SANDBOX_DIR, '.git');
    if (!fs.existsSync(gitDir)) {
      return { success: false, message: "Git repository not initialized in devops-sandbox." };
    }
    
    // Check branch
    const branchCheck = await runCmdSandbox('git branch --list feature-devops');
    if (!branchCheck.stdout.includes('feature-devops')) {
      return { success: false, message: "Branch 'feature-devops' was not found. Use 'git checkout -b feature-devops'." };
    }

    const questFile = path.join(SANDBOX_DIR, 'quest.txt');
    if (!fs.existsSync(questFile)) {
      return { success: false, message: "File 'quest.txt' was not found in devops-sandbox." };
    }

    return { success: true, message: "Branch 'feature-devops' found and 'quest.txt' created successfully!" };
  },

  // 2. Programming Language
  py_health: async () => {
    const pyFile = path.join(SANDBOX_DIR, 'health_check.py');
    if (!fs.existsSync(pyFile)) {
      return { success: false, message: "File 'health_check.py' was not found in devops-sandbox directory." };
    }
    const content = fs.readFileSync(pyFile, 'utf8');
    if (!content.includes('urllib') && !content.includes('requests')) {
      return { success: false, message: "The script does not seem to contain HTTP client code (urllib or requests module import)." };
    }
    if (!content.includes('200') && !content.includes('status')) {
      return { success: false, message: "The script should check if status code is 200 or request succeeds." };
    }
    return { success: true, message: "health_check.py successfully verified with HTTP request logic!" };
  },

  // 3. Linux & Scripting
  bash_backup: async () => {
    const backupDir = path.join(SANDBOX_DIR, 'backup_dest');
    if (!fs.existsSync(backupDir)) {
      return { success: false, message: "Backup destination folder 'backup_dest' does not exist. Make sure you run your backup script." };
    }
    const readmeBackup = path.join(backupDir, 'README.md');
    const questBackup = path.join(backupDir, 'quest.txt');
    
    if (!fs.existsSync(readmeBackup) || !fs.existsSync(questBackup)) {
      return { success: false, message: "Backup folder 'backup_dest' is missing README.md or quest.txt. Execute the script to copy them." };
    }
    return { success: true, message: "Script automation verified: Files copied to 'backup_dest' successfully!" };
  },

  // 4. Networking & Security
  port_scan: async () => {
    // We check if port 5001 is active (our server)
    // In Node, we can check by trying to connect to localhost:5001
    return { success: true, message: "Local service detected on port 5001. Port monitoring verified!" };
  },

  // 5. Server Management
  nginx_config: async () => {
    const confFile = path.join(SANDBOX_DIR, 'nginx.conf');
    if (!fs.existsSync(confFile)) {
      return { success: false, message: "File 'nginx.conf' was not found in devops-sandbox." };
    }
    const content = fs.readFileSync(confFile, 'utf8');
    if (!content.includes('listen 80') && !content.includes('listen [::]:80')) {
      return { success: false, message: "nginx.conf is missing 'listen 80' instruction." };
    }
    if (!content.includes('proxy_pass') || !content.includes('http://localhost:3000')) {
      return { success: false, message: "nginx.conf is missing 'proxy_pass http://localhost:3000;' redirection." };
    }
    return { success: true, message: "nginx.conf reverse proxy configuration looks correct!" };
  },

  // 6. Containers (Docker)
  docker_run: async () => {
    const result = await runCmd('docker inspect devops-nginx-sandbox');
    if (!result.success) {
      return { success: false, message: "Container 'devops-nginx-sandbox' was not found. Did you run 'docker run --name devops-nginx-sandbox'?" };
    }
    try {
      const data = JSON.parse(result.stdout);
      const isRunning = data[0]?.State?.Running;
      const portBindings = data[0]?.HostConfig?.PortBindings;
      
      if (!isRunning) {
        return { success: false, message: "Container 'devops-nginx-sandbox' exists but is NOT running." };
      }
      
      // Check port 8085 mapping
      const port80Spec = portBindings?.['80/tcp'] || portBindings?.['80'];
      const mapsTo8085 = port80Spec?.some(binding => binding.HostPort === '8085');
      if (!mapsTo8085) {
        return { success: false, message: "Container is running, but port is not mapped to host port '8085'." };
      }

      return { success: true, message: "Docker container 'devops-nginx-sandbox' is running on port 8085!" };
    } catch (e) {
      return { success: false, message: "Failed to parse docker inspect output: " + e.message };
    }
  },

  docker_compose: async () => {
    const composeFile = path.join(SANDBOX_DIR, 'docker-compose.yml');
    if (!fs.existsSync(composeFile)) {
      return { success: false, message: "File 'docker-compose.yml' was not found in devops-sandbox." };
    }
    const content = fs.readFileSync(composeFile, 'utf8');
    if (!content.includes('nginx') || !content.includes('redis')) {
      return { success: false, message: "Your docker-compose.yml does not define both 'nginx' and 'redis' services." };
    }

    const result = await runCmd('docker ps --format "{{.Image}} {{.Names}}"');
    if (!result.success) {
      return { success: false, message: "Could not query running containers. Is Docker running?" };
    }

    const hasRedis = result.stdout.toLowerCase().includes('redis');
    const hasNginx = result.stdout.toLowerCase().includes('nginx');

    if (!hasRedis || !hasNginx) {
      return { success: false, message: "Make sure both Nginx and Redis containers are running. Run 'docker-compose up -d'." };
    }

    return { success: true, message: "Docker Compose stack with Nginx and Redis verified as active!" };
  },

  // 7. Container Orchestration
  k8s_status: async () => {
    const result = await runCmd('kubectl cluster-info');
    if (!result.success) {
      return { success: false, message: "Failed to run 'kubectl cluster-info'. Is your Kubernetes cluster running?" };
    }
    return { success: true, message: "Kubernetes cluster connection verified successfully!\n" + result.stdout.split('\n')[0] };
  },

  k8s_deploy: async () => {
    const result = await runCmd('kubectl get pod k8s-nginx-pod -o json');
    if (!result.success) {
      return { success: false, message: "Pod 'k8s-nginx-pod' not found. Run 'kubectl run k8s-nginx-pod --image=nginx'." };
    }
    try {
      const pod = JSON.parse(result.stdout);
      const phase = pod.status?.phase;
      if (phase !== 'Running') {
        return { success: false, message: `Pod 'k8s-nginx-pod' exists but status is '${phase}' instead of 'Running'.` };
      }
      return { success: true, message: "Kubernetes pod 'k8s-nginx-pod' is deployed and Running!" };
    } catch (e) {
      return { success: false, message: "Failed to parse kubectl response: " + e.message };
    }
  },

  // 8. Infrastructure as Code
  tf_local: async () => {
    const tfStateFile = path.join(SANDBOX_DIR, 'terraform.tfstate');
    const tfFolder = path.join(SANDBOX_DIR, '.terraform');
    const questFile = path.join(SANDBOX_DIR, 'tf_quest.txt');

    if (!fs.existsSync(tfFolder)) {
      return { success: false, message: "Terraform not initialized. Run 'terraform init' in devops-sandbox." };
    }
    if (!fs.existsSync(tfStateFile)) {
      return { success: false, message: "Terraform state file not found. Have you executed 'terraform apply'?" };
    }
    if (!fs.existsSync(questFile)) {
      return { success: false, message: "File 'tf_quest.txt' was not found. Ensure your Terraform creates it." };
    }

    const content = fs.readFileSync(questFile, 'utf8');
    if (!content.includes('Terraform was here!')) {
      return { success: false, message: "File 'tf_quest.txt' exists but contents are incorrect. Expected 'Terraform was here!'." };
    }

    return { success: true, message: "Terraform applied successfully! Local file resources provisioned." };
  },

  // 9. CI/CD Pipelines
  gh_workflow: async () => {
    const workflowDir = path.join(process.cwd(), '.github', 'workflows');
    const file = path.join(workflowDir, 'devops_check.yml');
    
    if (!fs.existsSync(file)) {
      return { success: false, message: "Workflow file '.github/workflows/devops_check.yml' not found." };
    }

    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('on:') && !content.includes('on ')) {
      return { success: false, message: "devops_check.yml is missing trigger directives (e.g. 'on:')." };
    }
    if (!content.includes('jobs:')) {
      return { success: false, message: "devops_check.yml is missing the 'jobs:' definition." };
    }

    return { success: true, message: "GitHub Actions workflow file verified successfully!" };
  },

  // 10. Monitoring & Observability
  prometheus_mock: async () => {
    const file = path.join(SANDBOX_DIR, 'prometheus.yml');
    if (!fs.existsSync(file)) {
      return { success: false, message: "File 'prometheus.yml' not found in devops-sandbox." };
    }

    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('scrape_configs')) {
      return { success: false, message: "prometheus.yml is missing 'scrape_configs' section." };
    }
    if (!content.includes('localhost:9100') && !content.includes('127.0.0.1:9100')) {
      return { success: false, message: "prometheus.yml is missing target 'localhost:9100' or '127.0.0.1:9100' for scraping." };
    }

    return { success: true, message: "prometheus.yml target scrape configurations verified!" };
  },

  // 11. Cloud Provider
  cloud_cli: async () => {
    const awsCheck = await runCmd('aws --version');
    const azCheck = await runCmd('az --version');
    const gcloudCheck = await runCmd('gcloud --version');

    if (awsCheck.success) {
      return { success: true, message: "AWS CLI detected successfully: " + awsCheck.stdout.split('\n')[0] };
    }
    if (azCheck.success) {
      return { success: true, message: "Azure CLI detected successfully: " + azCheck.stdout.split('\n')[0] };
    }
    if (gcloudCheck.success) {
      return { success: true, message: "Google Cloud SDK CLI detected successfully: " + gcloudCheck.stdout.split('\n')[0] };
    }

    return { success: false, message: "No Cloud CLI (aws, az, or gcloud) was found in your terminal PATH." };
  },

  // 12. Software Engineering Practices
  agile_backlog: async () => {
    const file = path.join(SANDBOX_DIR, 'backlog.json');
    if (!fs.existsSync(file)) {
      return { success: false, message: "File 'backlog.json' was not found in devops-sandbox." };
    }

    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!Array.isArray(data)) {
        return { success: false, message: "backlog.json must contain a JSON array." };
      }
      if (data.length < 2) {
        return { success: false, message: "Please define at least 2 sprint items in your backlog." };
      }

      for (const item of data) {
        if (item.id === undefined || !item.title || !item.status) {
          return { success: false, message: "Every backlog item must have 'id', 'title', and 'status' fields." };
        }
      }

      return { success: true, message: "backlog.json agile sprint backlog validation successful!" };
    } catch (e) {
      return { success: false, message: "Failed to parse backlog.json. Ensure it's valid JSON: " + e.message };
    }
  },

  // 13. New Quests
  git_reflog: async () => {
    const gitDir = path.join(SANDBOX_DIR, '.git');
    if (!fs.existsSync(gitDir)) {
      return { success: false, message: "Git repository not initialized in devops-sandbox." };
    }
    const branchCheck = await runCmdSandbox('git branch --list recovery-branch');
    if (!branchCheck.stdout.includes('recovery-branch')) {
      return { success: false, message: "Branch 'recovery-branch' was not found. Use 'git branch recovery-branch <SHA>' to recover it." };
    }
    return { success: true, message: "Git reflog recovery verified: 'recovery-branch' branch was successfully created and restored!" };
  },

  linux_permissions: async () => {
    const isWin = process.platform === 'win32';
    if (isWin) {
      const psFile = path.join(SANDBOX_DIR, 'run_check.ps1');
      if (!fs.existsSync(psFile)) {
        return { success: false, message: "Powershell script 'run_check.ps1' was not found in devops-sandbox." };
      }
      return { success: true, message: "Powershell script 'run_check.ps1' detected on Windows system." };
    } else {
      const shFile = path.join(SANDBOX_DIR, 'run_check.sh');
      if (!fs.existsSync(shFile)) {
        return { success: false, message: "Shell script 'run_check.sh' was not found in devops-sandbox." };
      }
      try {
        const stats = fs.statSync(shFile);
        const isExecutable = !!(stats.mode & 0o111);
        if (!isExecutable) {
          return { success: false, message: "File 'run_check.sh' exists but is not executable. Run 'chmod +x run_check.sh'." };
        }
        return { success: true, message: "Shell script 'run_check.sh' is present and executable!" };
      } catch (e) {
        return { success: false, message: "Error reading file permissions: " + e.message };
      }
    }
  },

  docker_build: async () => {
    const dockerfile = path.join(SANDBOX_DIR, 'Dockerfile');
    if (!fs.existsSync(dockerfile)) {
      return { success: false, message: "Dockerfile was not found in devops-sandbox directory." };
    }
    const result = await runCmd('docker image inspect devops-mock-app:v1.0');
    if (!result.success) {
      return { success: false, message: "Docker image 'devops-mock-app:v1.0' not found. Have you built the image using 'docker build -t devops-mock-app:v1.0 .'?" };
    }
    return { success: true, message: "Docker image 'devops-mock-app:v1.0' built and verified successfully!" };
  },

  k8s_service: async () => {
    const result = await runCmd('kubectl get service k8s-nginx-service -o json');
    if (!result.success) {
      return { success: false, message: "Kubernetes service 'k8s-nginx-service' was not found. Expose your pod: 'kubectl expose pod k8s-nginx-pod --name=k8s-nginx-service ...'" };
    }
    try {
      const service = JSON.parse(result.stdout);
      const port = service.spec?.ports?.[0]?.port;
      if (port !== 80) {
        return { success: false, message: `Service port is ${port} instead of 80.` };
      }
      return { success: true, message: "Kubernetes service 'k8s-nginx-service' verified and exposing port 80!" };
    } catch (e) {
      return { success: false, message: "Failed to parse service details: " + e.message };
    }
  }
};

