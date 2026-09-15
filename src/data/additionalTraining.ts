import type { ModuleData } from './roadmapData';
import { scenarioModules } from './training';

const additions = new Map(scenarioModules.map(module => [module.id, module]));

export const expandRoadmapModules = (modules: ModuleData[]): ModuleData[] => (
  modules.map(module => {
    const extra = additions.get(module.id);
    if (!extra) return module;

    return {
      ...module,
      // Keep legacy-only quests and their order; enrich shared IDs from the catalog.
      quests: [...new Map([...module.quests, ...extra.quests].map(quest => [quest.id, quest])).values()],
      quiz: [...new Map([...(module.quiz ?? []), ...extra.quiz].map(question => [question.question, question])).values()],
      resources: [...new Map([...module.resources, ...extra.resources].map(resource => [resource.url, resource])).values()],
      keyConcepts: extra.keyConcepts ?? module.keyConcepts,
      commandCheatSheet: extra.commandCheatSheet ?? module.commandCheatSheet,
      learningPath: extra.learningPath ?? module.learningPath,
      modulePrerequisites: extra.modulePrerequisites ?? module.modulePrerequisites
    };
  })
);
