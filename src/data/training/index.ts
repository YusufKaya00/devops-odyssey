import { cicdModule } from './cicd';
import { cloudModule } from './cloud';
import { containersModule } from './containers';
import { gitModule } from './git';
import { iacModule } from './iac';
import { kubernetesModule } from './kubernetes';
import { linuxModule } from './linux';
import { networkingModule } from './networking';
import { observabilityModule } from './observability';
import { programmingModule } from './programming';
import { serverManagementModule } from './serverManagement';
import { softwarePracticesModule } from './softwarePractices';

export const scenarioModules = [
  gitModule,
  programmingModule,
  linuxModule,
  networkingModule,
  serverManagementModule,
  containersModule,
  kubernetesModule,
  iacModule,
  cicdModule,
  observabilityModule,
  cloudModule,
  softwarePracticesModule
];

