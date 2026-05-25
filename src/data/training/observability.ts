import { createConceptQuiz, createModule } from './helpers';

export const observabilityModule = createModule({
  id: 10,
  title: 'Monitoring & Observability',
  icon: 'activity',
  description: 'Use metrics, logs, traces, SLOs, alerts, dashboards, and runbooks.',
  detailedInfo: 'Observability turns system behavior into evidence for debugging, reliability, and incident response.',
  outcomes: [
    'Write useful alert rules.',
    'Use metrics and logs to investigate incidents.',
    'Connect SLOs and error budgets to release decisions.'
  ],
  resources: [
    { name: 'Prometheus Docs', url: 'https://prometheus.io/docs/introduction/overview/', free: true },
    { name: 'Grafana Tutorials', url: 'https://grafana.com/tutorials/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Observability', [])
});

