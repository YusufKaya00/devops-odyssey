import { createConceptQuiz, createModule, createQuest } from './helpers';

const quests = [
  createQuest({
    id: 'k8s_kubeconfig_cluster',
    title: 'Kubeconfig and Cluster Info',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Verify connection to the Kubernetes cluster and inspect cluster status.',
    skillOutcomes: [
      'Locate and verify kubeconfig targets.',
      'Check master and DNS service status.',
      'Test connectivity to the Kubernetes API server.'
    ],
    commands: [
      {
        title: 'Check Cluster Info',
        explanation: 'kubectl cluster-info verifies if your local CLI has valid credentials and can connect to the remote control plane.',
        command: 'kubectl cluster-info',
        output: 'Kubernetes control plane is running at https://10.96.0.1:6443\nCoreDNS is running at https://10.96.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy'
      }
    ]
  }),
  createQuest({
    id: 'k8s_pods_describe_logs',
    title: 'Pods, Events, and Logs',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Deploy a pod, inspect its lifecycle, describe its events, and retrieve logs.',
    skillOutcomes: [
      'Create a pod with kubectl run.',
      'List pods and their statuses.',
      'Check logs and events to debug startup.'
    ],
    commands: [
      {
        title: 'Deploy NGINX Pod',
        explanation: 'Create a single pod instance named "my-pod" running the nginx image.',
        command: 'kubectl run my-pod --image=nginx',
        output: 'pod/my-pod created'
      },
      {
        title: 'List Pods',
        explanation: 'Get a list of pods in the current namespace to confirm state.',
        command: 'kubectl get pods',
        output: 'NAME     READY   STATUS    RESTARTS   AGE\nmy-pod   1/1     Running   0          5s'
      },
      {
        title: 'Describe Pod Events',
        explanation: 'kubectl describe lists pod events (e.g. pulling image, scheduling) which are crucial for finding startup failures.',
        command: 'kubectl describe pod my-pod',
        output: 'Name: my-pod\nNamespace: default\nStatus: Running\nIP: 10.244.0.5\nEvents:\n  Normal  Scheduled  10s  default-scheduler  Successfully assigned my-pod to node1\n  Normal  Pulled     8s   kubelet            Container image "nginx" already present on machine\n  Normal  Created    7s   kubelet            Created container nginx\n  Normal  Started    7s   kubelet            Started container nginx'
      },
      {
        title: 'Retrieve Pod Logs',
        explanation: 'kubectl logs fetches stdout/stderr output from the application container.',
        command: 'kubectl logs my-pod',
        output: '/docker-entrypoint.sh: Configuration complete; ready for start up'
      }
    ]
  }),
  createQuest({
    id: 'k8s_deployments_replicasets',
    title: 'Deployments and Scalable Workloads',
    tier: 'Foundation',
    difficulty: 'Beginner',
    objective: 'Create a deployment to manage replicas and scale it.',
    skillOutcomes: [
      'Define a deployment.',
      'Understand how deployments create ReplicaSets.',
      'Scale replicas up or down.'
    ],
    commands: [
      {
        title: 'Create Deployment',
        explanation: 'Deployments declare the desired state for pods, managing rollouts and updates automatically.',
        command: 'kubectl create deployment web-deploy --image=nginx --replicas=3',
        output: 'deployment.apps/web-deploy created'
      },
      {
        title: 'List Deployments',
        explanation: 'Confirm the deployment has reached the desired replica counts.',
        command: 'kubectl get deployments',
        output: 'NAME         READY   UP-TO-DATE   AVAILABLE   AGE\nweb-deploy   3/3     3            3           10s'
      }
    ]
  }),
  createQuest({
    id: 'k8s_rollout_undo',
    title: 'Rollout Management and Rollbacks',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Update a deployment image, monitor rollout status, and roll back to a stable version.',
    skillOutcomes: [
      'Update a deployment image using kubectl set image.',
      'Inspect rollout history and status.',
      'Roll back a broken release with kubectl rollout undo.'
    ],
    commands: [
      {
        title: 'Update Deployment Image',
        explanation: 'Change the container image of the deployment. This triggers a rolling update.',
        command: 'kubectl set image deployment/web-deploy nginx=nginx:1.16.1',
        output: 'deployment.apps/web-deploy image updated'
      },
      {
        title: 'Monitor Rollout Status',
        explanation: 'Check if the rolling update completes successfully.',
        command: 'kubectl rollout status deployment/web-deploy',
        output: 'Waiting for deployment "web-deploy" rollout to finish: 1 old replicas are pending termination...\nDeployment "web-deploy" successfully rolled out'
      },
      {
        title: 'Rollback Release',
        explanation: 'If a rollout has errors, roll back immediately to the previous revision.',
        command: 'kubectl rollout undo deployment/web-deploy',
        output: 'deployment.apps/web-deploy rolled back'
      }
    ]
  }),
  createQuest({
    id: 'k8s_services_types',
    title: 'Services and Cluster Exposure',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Expose a deployment internally and externally using ClusterIP and NodePort.',
    skillOutcomes: [
      'Expose deployments as Services.',
      'Differentiate ClusterIP and NodePort service types.',
      'Find service target ports.'
    ],
    commands: [
      {
        title: 'Expose Deployment',
        explanation: 'Create a Service pointing to the deployment. NodePort maps the service to a high port on every cluster node.',
        command: 'kubectl expose deployment web-deploy --port=80 --type=NodePort',
        output: 'service/web-deploy exposed'
      },
      {
        title: 'Get Services Info',
        explanation: 'Retrieve the ClusterIP and NodePort assigned to the service.',
        command: 'kubectl get services',
        output: 'NAME         TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE\nkubernetes   ClusterIP   10.96.0.1     <none>        443/TCP        1d\nweb-deploy   NodePort    10.96.14.88   <none>        80:31245/TCP   5s'
      }
    ]
  }),
  createQuest({
    id: 'k8s_configmaps_secrets',
    title: 'ConfigMaps and Secrets',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Manage application configuration and sensitive credentials separately from code.',
    skillOutcomes: [
      'Create ConfigMaps to inject environment variables.',
      'Create Secret resources for confidential keys.',
      'Describe secret metadata safely.'
    ],
    commands: [
      {
        title: 'Create ConfigMap',
        explanation: 'ConfigMaps hold configuration key-value pairs that pods can load as env variables or mount as files.',
        command: 'kubectl create configmap app-config --from-literal=API_URL=http://api.internal',
        output: 'configmap/app-config created'
      },
      {
        title: 'Create Secret',
        explanation: 'Secrets store sensitive data like passwords or TLS keys, base64 encoded and protected in-transit.',
        command: 'kubectl create secret generic db-secret --from-literal=password=supersecret',
        output: 'secret/db-secret created'
      }
    ]
  }),
  createQuest({
    id: 'k8s_resources_limits',
    title: 'Resource Requests and Limits',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Model pod configurations defining CPU and Memory request and limit profiles.',
    skillOutcomes: [
      'Contrast CPU/Memory requests and limits.',
      'Prevent container OOM (Out Of Memory) terminates.',
      'Specify resource requests in pod manifests.'
    ],
    commands: [
      {
        title: 'Model Resource Allocation',
        explanation: 'Requests determine scheduling reservation. Limits restrict maximum consumption, stopping leaky pods.',
        command: 'echo "resources: { requests: { memory: 64Mi, cpu: 250m }, limits: { memory: 128Mi, cpu: 500m } }" > pod-resources.yaml',
        output: 'Wrote pod-resources.yaml.'
      }
    ]
  }),
  createQuest({
    id: 'k8s_probes',
    title: 'Readiness and Liveness Probes',
    tier: 'Operator',
    difficulty: 'Intermediate',
    objective: 'Configure probes to automate self-healing and routing safety.',
    skillOutcomes: [
      'Configure liveness probes for auto-restart.',
      'Configure readiness probes for traffic routing safety.',
      'Explain probe initial delays and thresholds.'
    ],
    commands: [
      {
        title: 'Define Probes Manifest',
        explanation: 'Liveness probes restart hung containers. Readiness probes ensure pods are fully initialized before receiving traffic.',
        command: 'echo "livenessProbe: { httpGet: { path: /healthz, port: 80 }, initialDelaySeconds: 3 } readinessProbe: { httpGet: { path: /ready, port: 80 } }" > pod-probes.yaml',
        output: 'Wrote pod-probes.yaml.'
      }
    ]
  }),
  createQuest({
    id: 'k8s_ingress',
    title: 'Ingress and Path-based Routing',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Create an Ingress rule mapping host HTTP paths to backend services.',
    skillOutcomes: [
      'Define Ingress routing structures.',
      'Map hostnames to backend Services.',
      'Provide single entrypoint SSL termination configurations.'
    ],
    commands: [
      {
        title: 'Define Ingress Rules',
        explanation: 'An Ingress controller exposes HTTP/S routes from outside the cluster to services within the cluster.',
        command: 'echo "rules: - host: shop.internal, http: { paths: [ { path: /, backend: { service: { name: web-service, port: { number: 80 } } } } ] }" > ingress.yaml',
        output: 'Wrote ingress.yaml.'
      }
    ]
  }),
  createQuest({
    id: 'k8s_pvc_storage',
    title: 'PersistentVolumeClaims',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Create a PersistentVolumeClaim to request persistent disk storage.',
    skillOutcomes: [
      'Understand persistent storage abstraction.',
      'Define AccessModes like ReadWriteOnce.',
      'Request storage capacities in YAML manifests.'
    ],
    commands: [
      {
        title: 'Define storage claim',
        explanation: 'A PVC requests specific storage class, access modes, and size, decoupling app pods from physical storage engines.',
        command: 'echo "spec: { accessModes: [ReadWriteOnce], resources: { requests: { storage: 1Gi } } }" > pvc.yaml',
        output: 'Wrote pvc.yaml.'
      }
    ]
  }),
  createQuest({
    id: 'k8s_jobs_cronjobs',
    title: 'Jobs and CronJobs',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Configure a CronJob for scheduled batch executions.',
    skillOutcomes: [
      'Define non-daemon run-to-completion Jobs.',
      'Set schedule patterns for CronJobs.',
      'Configure cleanup and failure limits.'
    ],
    commands: [
      {
        title: 'Create CronJob Configuration',
        explanation: 'CronJobs run ephemeral utility pods at periodic times, using familiar cron syntaxes.',
        command: 'echo "schedule: \'0 0 * * *\' jobTemplate: { spec: { template: { spec: { containers: [ { name: clean, image: alpine } ], restartPolicy: OnFailure } } } }" > cronjob.yaml',
        output: 'Wrote cronjob.yaml.'
      }
    ]
  }),
  createQuest({
    id: 'k8s_helm_release',
    title: 'Helm Package Management',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Install, customize, and roll back application charts using Helm.',
    skillOutcomes: [
      'Understand Helm chart and release abstractions.',
      'Override default values during installation.',
      'Roll back charts to previous releases.'
    ],
    commands: [
      {
        title: 'Install Chart',
        explanation: 'Helm deploys groups of related Kubernetes resources packaged together as charts.',
        command: 'helm install database stable/postgresql',
        output: 'NAME: database\nLAST DEPLOYED: Mon May 25 14:00:00 2026\nNAMESPACE: default\nSTATUS: deployed\nREVISION: 1'
      },
      {
        title: 'Upgrade Release',
        explanation: 'Update chart parameters using --set or value files without deleting the release.',
        command: 'helm upgrade database stable/postgresql --set postgresqlPassword=admin',
        output: 'NAME: database\nLAST DEPLOYED: Mon May 25 14:01:00 2026\nNAMESPACE: default\nSTATUS: deployed\nREVISION: 2'
      },
      {
        title: 'Rollback Release',
        explanation: 'Helm tracks release histories, allowing quick rollbacks of helm upgrades.',
        command: 'helm rollback database 1',
        output: 'Rollback release database to revision 1 completed.'
      }
    ]
  }),
  createQuest({
    id: 'k8s_failure_modes',
    title: 'Troubleshooting Pod Failures',
    tier: 'Senior',
    difficulty: 'Advanced',
    objective: 'Diagnose common failures like ImagePullBackOff and CrashLoopBackOff.',
    skillOutcomes: [
      'Recognize registry and tag typos.',
      'Identify database startup connectivity crashes.',
      'Interpret pod status details.'
    ],
    commands: [
      {
        title: 'List Broken Pods',
        explanation: 'Check status column for failure keywords. BackOff indicates k8s is retrying starting the pod.',
        command: 'kubectl get pods',
        output: 'NAME             READY   STATUS             RESTARTS   AGE\nbackend-broken   0/1     ImagePullBackOff   0          1m\nweb-ok           1/1     Running            0          1d'
      },
      {
        title: 'Diagnose Pull Mismatch',
        explanation: 'Describe pod displays registry events, exposing invalid repo path or tag naming issues.',
        command: 'kubectl describe pod backend-broken',
        output: 'Name: backend-broken\nEvents:\n  Warning  Failed  50s  kubelet  Failed to pull image "my-backend:v99.0": rpc error: code = NotFound'
      },
      {
        title: 'Inspect Crash Logs',
        explanation: 'If status is CrashLoopBackOff, check logs to find code errors or missing database connections.',
        command: 'kubectl logs backend-broken',
        output: 'Error: Cannot connect to database at redis://10.96.12.5:6379 (Connection refused)'
      }
    ]
  }),
  createQuest({
    id: 'k8s_capstone_rollout_recovery',
    title: 'Capstone: Production Rollout and Recovery',
    tier: 'Capstone',
    difficulty: 'Advanced',
    objective: 'Deploy a new release, identify container initialization failure, check events/logs, and undo rollout to restore uptime.',
    prerequisites: [
      'k8s_rollout_undo',
      'k8s_failure_modes',
      'k8s_pods_describe_logs'
    ],
    skillOutcomes: [
      'Diagnose runtime crashes during deployment updates.',
      'Isolate faults via pod-level logs.',
      'Initiate Kubernetes undo rollouts to maintain production SLAs.'
    ],
    commands: [
      {
        title: 'Check Deployment Status',
        explanation: 'Inspect the running deployment to verify if replicas are ready.',
        command: 'kubectl get deployments',
        output: 'NAME          READY   UP-TO-DATE   AVAILABLE   AGE\napp-service   0/3     3            0           1m'
      },
      {
        title: 'Trace Rollout Hang',
        explanation: 'Monitor the update rollout to check why progress has stalled.',
        command: 'kubectl rollout status deployment/app-service',
        output: 'Waiting for deployment "app-service" rollout to finish: 0 of 3 updated replicas are available...'
      },
      {
        title: 'Inspect Application Logs',
        explanation: 'Read logs to find why the new pods are crashing during startup.',
        command: 'kubectl logs deployment/app-service',
        output: 'Fatal: DB_PASS environment variable is empty\nApp server crashed on initialization'
      },
      {
        title: 'Roll Back Outage',
        explanation: 'Execute an undo rollout to terminate failing pods and restore the previous functional replica set.',
        command: 'kubectl rollout undo deployment/app-service',
        output: 'deployment.apps/app-service rolled back successfully (restored v1.0)'
      }
    ]
  })
];

export const kubernetesModule = createModule({
  id: 7,
  title: 'Container Orchestration',
  icon: 'box',
  description: 'Operate Kubernetes workloads, rollouts, services, configuration, storage, and failures.',
  detailedInfo: 'Kubernetes automates deployment, scaling, networking, and recovery for containerized workloads.',
  outcomes: [
    'Deploy and inspect workloads.',
    'Troubleshoot common pod and rollout failures.',
    'Use Services, ConfigMaps, Secrets, probes, storage, and Helm.',
    'Manage rollouts, ingress routes, and volume persistent disks.'
  ],
  resources: [
    { name: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/home/', free: true }
  ],
  quests,
  quiz: createConceptQuiz('Kubernetes', [
    {
      question: 'What is a Pod in Kubernetes?',
      options: [
        'The smallest deployable unit representing one or more tightly coupled containers',
        'A physical database server',
        'A virtualization hypervisor',
        'A repository tag'
      ],
      answerIndex: 0,
      explanation: 'Pods are the atomic units of execution in Kubernetes, housing one or more containers sharing storage and network.'
    },
    {
      question: 'What does a ReplicaSet manage?',
      options: ['Ensures a specified number of pod replicas are running at any given time', 'DNS servers', 'Host port mappings', 'Git tags'],
      answerIndex: 0,
      explanation: 'ReplicaSets monitor pod lifecycles and spawn or terminate pods to keep the exact count specified by the deployment.'
    },
    {
      question: 'Why does kubectl describe pod help diagnose ImagePullBackOff?',
      options: [
        'It lists events showing registry fetch warnings and repository name errors',
        'It automatically updates the image tag',
        'It displays application console logs',
        'It creates a persistent storage claim'
      ],
      answerIndex: 0,
      explanation: 'Describe pod exposes scheduling, resource limits, and registry events (pull attempts and failures) handled by the host agent.'
    },
    {
      question: 'What is the primary difference between ClusterIP and NodePort Service types?',
      options: [
        'ClusterIP exposes services internally inside the cluster; NodePort exposes services on a static port on each Node IP',
        'ClusterIP is only for databases',
        'NodePort does not support TCP routing',
        'ClusterIP requires an external cloud provider load balancer'
      ],
      answerIndex: 0,
      explanation: 'ClusterIP is the default internal IP routing within the cluster. NodePort routes external traffic on a high range port to the service.'
    },
    {
      question: 'Why configure a Readiness probe in addition to a Liveness probe?',
      options: [
        'Readiness controls when pods receive traffic; Liveness determines when pods should be restarted',
        'Liveness only runs during builds',
        'Readiness allocates physical hard disks',
        'Liveness is for security checks'
      ],
      answerIndex: 0,
      explanation: 'Liveness probes check if a pod is dead (needs restart). Readiness probes check if the app is initialized and ready to take traffic.'
    },
    {
      question: 'What does Helm solve in Kubernetes management?',
      options: [
        'It packages and templates multiple related Kubernetes manifests as reusable Charts',
        'It configures CPU hardware directly',
        'It acts as a Docker registry',
        'It replaces the kube-apiserver'
      ],
      answerIndex: 0,
      explanation: 'Helm is the package manager for Kubernetes, using templates to install and manage collections of resources.'
    },
    {
      question: 'What is a ConfigMap vs a Secret?',
      options: [
        'ConfigMap stores non-confidential configuration; Secret stores sensitive data like passwords and keys',
        'Secret is encrypted using hardware chips',
        'ConfigMap is for database backups',
        'Secret does not support environment variables'
      ],
      answerIndex: 0,
      explanation: 'ConfigMaps are for plain configurations, whereas Secrets are base64 encoded and intended for confidential credentials.'
    },
    {
      question: 'How do you roll back a deployment rollout to a previous revision?',
      options: ['kubectl rollout undo', 'kubectl rollout delete', 'helm delete deployment', 'kubectl apply rollback.yml'],
      answerIndex: 0,
      explanation: 'kubectl rollout undo reverts the deployment template to the previous revision, triggering a rolling rollback.'
    }
  ])
});
