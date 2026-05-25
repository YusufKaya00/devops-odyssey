import type { ModuleData, ModuleQuizQuestion, Quest } from './roadmapData';
import { linuxModule } from './training/linux';
import { programmingModule } from './training/programming';
import { networkingModule } from './training/networking';
import { serverManagementModule } from './training/serverManagement';
import { containersModule } from './training/containers';
import { kubernetesModule } from './training/kubernetes';
import { iacModule } from './training/iac';
import { cicdModule } from './training/cicd';
import { observabilityModule } from './training/observability';
import { cloudModule } from './training/cloud';
import { softwarePracticesModule } from './training/softwarePractices';

const additions: Record<number, { quests: Quest[]; quiz: ModuleQuizQuestion[] }> = {
  2: {
    quests: programmingModule.quests,
    quiz: programmingModule.quiz
  },
  3: {
    quests: linuxModule.quests,
    quiz: linuxModule.quiz
  },
  4: {
    quests: networkingModule.quests,
    quiz: networkingModule.quiz
  },
  5: {
    quests: serverManagementModule.quests,
    quiz: serverManagementModule.quiz
  },
  6: {
    quests: containersModule.quests,
    quiz: containersModule.quiz
  },
  7: {
    quests: kubernetesModule.quests,
    quiz: kubernetesModule.quiz
  },
  8: {
    quests: iacModule.quests,
    quiz: iacModule.quiz
  },
  9: {
    quests: cicdModule.quests,
    quiz: cicdModule.quiz
  },
  10: {
    quests: observabilityModule.quests,
    quiz: observabilityModule.quiz
  },
  11: {
    quests: cloudModule.quests,
    quiz: cloudModule.quiz
  },
  12: {
    quests: softwarePracticesModule.quests,
    quiz: softwarePracticesModule.quiz
  }
};

export const expandRoadmapModules = (modules: ModuleData[]): ModuleData[] => (
  modules.map(module => {
    const extra = additions[module.id];
    if (!extra) return module;

    return {
      ...module,
      quests: [...module.quests, ...extra.quests],
      quiz: module.quiz || extra.quiz
    };
  })
);
