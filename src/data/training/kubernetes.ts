import { createConceptQuiz, createModule } from './helpers';

export const kubernetesModule = createModule({
  id: 7,
  title: 'Container Orchestration',
  icon: 'box',
  description: 'Operate Kubernetes workloads, rollouts, services, configuration, storage, and failures.',
  detailedInfo: 'Kubernetes automates deployment, scaling, networking, and recovery for containerized workloads.',
  outcomes: [
    'Deploy and inspect workloads.',
    'Troubleshoot common pod and rollout failures.',
    'Use Services, ConfigMaps, Secrets, probes, storage, and Helm.'
  ],
  resources: [
    { name: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/home/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Kubernetes', [])
});

