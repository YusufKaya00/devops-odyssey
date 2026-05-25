import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'docker_run_inspect',
    title: 'Run and Inspect a Container',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Run an NGINX container in the background and inspect its configuration.',
    skillOutcomes: [
      'Use docker run to start a container.',
      'Configure port mapping and container naming.',
      'Inspect container metadata using docker inspect.'
    ],
    commands: [
      {
        title: 'Run NGINX Container',
        explanation: 'Run a container detached (-d) to keep it in the background, name it "web", and map host port 8080 to container port 80.',
        command: 'docker run -d --name web -p 8080:80 nginx',
        output: 'e92a83cf8d1b7d5a5a6b0c2e98d9e2a73c1081541'
      },
      {
        title: 'Inspect Container Details',
        explanation: 'docker inspect returns JSON details about container networking, storage volumes, env variables, and state.',
        command: 'docker inspect web',
        output: '[\n  {\n    "Id": "e92a83cf8d1b",\n    "Name": "/web",\n    "State": { "Status": "running" },\n    "NetworkSettings": { "IPAddress": "172.17.0.2" }\n  }\n]'
      }
    ]
  }),
  createQuest({
    id: 'docker_layers_dockerfile',
    title: 'Dockerfile Basics and Layers',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Create a simple Dockerfile to package a static web application.',
    skillOutcomes: [
      'Select a base image using FROM.',
      'Copy local files into the image.',
      'Expose network ports in the image metadata.'
    ],
    commands: [
      {
        title: 'Create Dockerfile',
        explanation: 'A Dockerfile defines the instructions to assemble a container image. Each command creates a new cached layer.',
        command: 'echo "FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/\nEXPOSE 80" > Dockerfile',
        output: 'Wrote Dockerfile.'
      }
    ]
  }),
  createQuest({
    id: 'docker_build_tag',
    title: 'Build and Tag Container Images',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Build an image from a Dockerfile, apply tags, and list local images.',
    skillOutcomes: [
      'Build container images with docker build.',
      'Apply repository and version tags.',
      'List images stored on the local system.'
    ],
    commands: [
      {
        title: 'Build the Image',
        explanation: 'Build the image using the current directory (.) as context, and tag (-t) it as "my-app:v1.0".',
        command: 'docker build -t my-app:v1.0 .',
        output: 'Sending build context to Docker daemon...\nStep 1/3 : FROM nginx:alpine\n ---> 96317b9b1d31\nStep 2/3 : COPY index.html /usr/share/nginx/html/\n ---> aefd02b8d234\nStep 3/3 : EXPOSE 80\n ---> Successfully built aefd02b8d234\nSuccessfully tagged my-app:v1.0'
      },
      {
        title: 'List Local Images',
        explanation: 'Verify that the newly built image is present in the local registry.',
        command: 'docker images',
        output: 'REPOSITORY   TAG       IMAGE ID       CREATED        SIZE\nmy-app       v1.0      aefd02b8d234   Just now       23.5MB\nnginx        alpine    96317b9b1d31   3 weeks ago    23.5MB'
      }
    ]
  }),
  createQuest({
    id: 'docker_env_config',
    title: 'Injecting Environment Variables',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Configure a containerized application dynamically using environment variables.',
    skillOutcomes: [
      'Inject env variables using docker run -e.',
      'Inspect runtime configuration parameters.',
      'Decouple code from environment-specific configuration.'
    ],
    commands: [
      {
        title: 'Run with Environment Variables',
        explanation: 'Pass configurations like PORT and NODE_ENV using the -e flag to make the app flexible.',
        command: 'docker run -d --name backend -e PORT=8000 -e NODE_ENV=production my-app:v1.0',
        output: 'fa3198cf982d7a224f8d9b1a77cd0a23'
      }
    ]
  }),
  createQuest({
    id: 'docker_volumes',
    title: 'Container Volumes and Persistence',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Create and mount a persistent volume to preserve data across container lifecycles.',
    skillOutcomes: [
      'Explain container volatility.',
      'Create Docker volumes.',
      'Mount volumes to preserve internal paths.'
    ],
    commands: [
      {
        title: 'Create Volume',
        explanation: 'Volumes are managed by Docker on the host filesystem and persist even if the container is deleted.',
        command: 'docker volume create data-volume',
        output: 'data-volume'
      },
      {
        title: 'Run Container with Volume',
        explanation: 'Mount the created volume to the data directory of the application.',
        command: 'docker run -d --name db -v data-volume:/var/lib/data redis',
        output: 'ba84cf73bc11da2b4129b87cd3156cf3'
      }
    ]
  }),
  createQuest({
    id: 'docker_networks',
    title: 'Container Networking',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Configure custom bridge networks to enable name resolution between containers.',
    skillOutcomes: [
      'Create custom user-defined bridge networks.',
      'Connect containers to the network.',
      'Explain DNS resolution inside custom networks.'
    ],
    commands: [
      {
        title: 'Create Custom Network',
        explanation: 'Unlike the default bridge, user-defined bridge networks provide automatic DNS resolution between containers by name.',
        command: 'docker network create my-net',
        output: 'd8c89bfa2128'
      },
      {
        title: 'Run Container in Network',
        explanation: 'Attach the container to the newly created network.',
        command: 'docker run -d --name app --network my-net my-app:v1.0',
        output: 'ca9841cfef8a'
      }
    ]
  }),
  createQuest({
    id: 'docker_compose_stack',
    title: 'Multi-Container Stacks with Compose',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Define and orchestrate a multi-service stack using Docker Compose.',
    skillOutcomes: [
      'Write a docker-compose.yml configuration file.',
      'Manage multi-container states simultaneously.',
      'Configure service links and ports.'
    ],
    commands: [
      {
        title: 'Define Compose File',
        explanation: 'Docker Compose allows you to define multi-container environments in a YAML file, specifying images, ports, networks, and services.',
        command: 'echo "version: \'3\'\nservices:\n  web:\n    image: nginx\n    ports:\n      - \'80:80\'\n  db:\n    image: redis" > docker-compose.yml',
        output: 'Wrote docker-compose.yml.'
      },
      {
        title: 'Deploy the Stack',
        explanation: 'Start all defined services in the background using docker-compose.',
        command: 'docker-compose up -d',
        output: 'Creating network "sandbox_default" with the default driver\nCreating sandbox_db_1  ... done\nCreating sandbox_web_1 ... done'
      }
    ]
  }),
  createQuest({
    id: 'docker_logs_exec',
    title: 'Container Triage and Debugging',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Inspect container logs and execute diagnostic commands inside a running container.',
    skillOutcomes: [
      'Inspect stdout/stderr using docker logs.',
      'Run commands inside a container with docker exec.',
      'Identify internal configuration drift.'
    ],
    commands: [
      {
        title: 'Inspect Container Logs',
        explanation: 'Containers log to standard output. Use docker logs to diagnose application runtime exceptions.',
        command: 'docker logs web',
        output: '172.17.0.1 - - [25/May/2026:12:30:10] "GET / HTTP/1.1" 200 612\n172.17.0.1 - - [25/May/2026:12:30:15] "GET /non-existent HTTP/1.1" 404 153'
      },
      {
        title: 'Run Diagnostic Command',
        explanation: 'docker exec runs a new process inside an existing container. This is useful for checking filesystem files.',
        command: 'docker exec web ls /usr/share/nginx/html',
        output: '50x.html\nindex.html'
      }
    ]
  }),
  createQuest({
    id: 'docker_healthcheck',
    title: 'Container Healthchecks',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Add healthcheck directives to a Dockerfile to detect application freeze states.',
    skillOutcomes: [
      'Define HEALTHCHECK instructions.',
      'Trigger state checks via curl.',
      'Enable orchestration engines to monitor container health.'
    ],
    commands: [
      {
        title: 'Add Healthcheck to Dockerfile',
        explanation: 'The HEALTHCHECK instruction tells Docker how to test the container to check that it is still working.',
        command: 'echo "FROM nginx\nHEALTHCHECK --interval=5s CMD curl -f http://localhost/ || exit 1" > Dockerfile.health',
        output: 'Wrote Dockerfile.health.'
      }
    ]
  }),
  createQuest({
    id: 'docker_image_optimization',
    title: 'Optimizing Container Image Sizes',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Configure a .dockerignore file to exclude build clutter and optimize build times.',
    skillOutcomes: [
      'Exclude node_modules and logs from build contexts.',
      'List files excluded by docker build.',
      'Reduce container attack surface and registry storage.'
    ],
    commands: [
      {
        title: 'Create dockerignore',
        explanation: 'A .dockerignore file keeps large files or secrets from being copied into the Docker daemon context, increasing build speeds and security.',
        command: 'echo "node_modules\n.git\n*.log" > .dockerignore',
        output: 'Wrote .dockerignore.'
      }
    ]
  }),
  createQuest({
    id: 'docker_registry_mock',
    title: 'Tagging and Pushing to Registry',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Prepare and push a container image to an enterprise registry repository.',
    skillOutcomes: [
      'Tag images for specific registry endpoints.',
      'Simulate logging in and pushing to registries.',
      'Manage image version tagging.'
    ],
    commands: [
      {
        title: 'Tag for Registry',
        explanation: 'To push an image, it must be tagged with the registry hostname or endpoint namespace prefix.',
        command: 'docker tag my-app:v1.0 registry.internal/my-app:v1.0',
        output: 'Tagged image.'
      },
      {
        title: 'Push to Registry',
        explanation: 'Upload the image layers to the registry so other servers or orchestrators can pull them.',
        command: 'docker push registry.internal/my-app:v1.0',
        output: 'The push refers to repository [registry.internal/my-app]\naefd02b8d234: Pushed\n96317b9b1d31: Layer already exists\nv1.0: digest: sha256:7f14b6 size: 948'
      }
    ]
  }),
  createQuest({
    id: 'docker_stack_capstone',
    title: 'Capstone: Containerize and Debug a Broken Stack',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Inspect a broken multi-service Compose configuration, check logs, and restart services to resolve downtime.',
    prerequisites: [
      'docker_compose_stack',
      'docker_logs_exec',
      'docker_volumes'
    ],
    skillOutcomes: [
      'Diagnose port definition conflicts in docker-compose.yml.',
      'Inspect application exception logs from container stdout.',
      'Trigger Compose commands to clean and restore stack health.'
    ],
    commands: [
      {
        title: 'Read Compose Configuration',
        explanation: 'Read the YAML stack file to locate misconfigured ports or volume mount mismatches.',
        command: 'cat docker-compose.yml',
        output: 'version: \'3\'\nservices:\n  web:\n    image: nginx\n    ports:\n      - \'80:8080\' # incorrect port order host:container! Should be 8080:80 or 80:80'
      },
      {
        title: 'Inspect Proxy Logs',
        explanation: 'Inspect container stderr logs to locate upstream connection failures.',
        command: 'docker logs web-proxy',
        output: 'nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)\nweb-proxy exited with code 1'
      },
      {
        title: 'Restart Compose Services',
        explanation: 'Restart or rebuild the compose stack after correcting ports to restore service availability.',
        command: 'docker-compose restart',
        output: 'Restarting sandbox_web-proxy_1 ... done\nRestarting sandbox_db_1        ... done'
      }
    ]
  })
];

export const containersModule = createModule({
  id: 6,
  title: 'Containers (Docker)',
  icon: 'package',
  description: 'Package, run, network, debug, and optimize containerized services.',
  detailedInfo: 'Containers make applications portable by packaging code, runtime, libraries, and configuration into repeatable images.',
  outcomes: [
    'Build and tag images.',
    'Debug container runtime, logs, networks, and volumes.',
    'Use Compose for multi-service local stacks.',
    'Optimize images and write healthcheck files.'
  ],
  resources: [
    { name: 'Docker Docs', url: 'https://docs.docker.com/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Containers', [
    {
      question: 'What is the main advantage of containerization over traditional VMs?',
      options: ['Containers share the host OS kernel, making them lightweight', 'Containers contain full operating systems', 'Containers do not use memory', 'Containers do not run on Linux'],
      answerIndex: 0,
      explanation: 'Containers share the host kernel instead of running hypervisors and full guest operating systems, making them highly efficient.'
    },
    {
      question: 'What does the -d flag represent in docker run?',
      options: ['Run in detached mode (background)', 'Delete container immediately', 'Diagnostic logging', 'Define environment variable'],
      answerIndex: 0,
      explanation: '-d detached mode runs the container in the background and prints the container ID.'
    },
    {
      question: 'What happens to files inside a container when the container is deleted?',
      options: ['All internal files are lost unless stored in a volume', 'They are saved in Docker Hub', 'They are copied to the host desktop', 'The host system crashes'],
      answerIndex: 0,
      explanation: 'Container filesystems are volatile. Data written to container layers is deleted permanently unless mounted to a persistent volume.'
    },
    {
      question: 'How do custom bridge networks differ from default bridge networks in Docker?',
      options: ['Custom networks provide DNS resolution between containers by name', 'Custom networks do not allow internet access', 'Custom networks are slower', 'Default networks do not use TCP'],
      answerIndex: 0,
      explanation: 'User-defined bridge networks resolve container names to IP addresses, making container discovery and linking easy.'
    },
    {
      question: 'What is the purpose of a .dockerignore file?',
      options: ['To exclude local directories from the build context', 'To delete base images', 'To ignore syntax errors in Dockerfiles', 'To expose private ports'],
      answerIndex: 0,
      explanation: 'A .dockerignore file stops large folders (like node_modules) or secrets from being sent to the Docker daemon, speeding up builds.'
    },
    {
      question: 'What does docker exec do?',
      options: ['Runs a command inside a running container', 'Builds an image', 'Deletes stopped volumes', 'Pushes image tag to registry'],
      answerIndex: 0,
      explanation: 'docker exec starts a new process inside an already active running container (e.g. running a bash shell or checking files).'
    },
    {
      question: 'Why configure container HEALTHCHECK statements?',
      options: ['To tell orchestration engines if the application inside is actually responding', 'To build faster layers', 'To compress images', 'To enforce user access limits'],
      answerIndex: 0,
      explanation: 'A healthcheck instruction verifies that the server application is functional, not just that the container process is running.'
    },
    {
      question: 'In docker-compose, how do you start services defined in a compose file?',
      options: ['docker-compose up', 'docker run compose', 'docker compose compile', 'kubectl apply compose.yml'],
      answerIndex: 0,
      explanation: 'docker-compose up (or docker compose up) builds, creates, starts, and attaches to containers for a service.'
    }
  ])
});
