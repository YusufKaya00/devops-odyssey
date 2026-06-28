export interface LevelInfo {
  level: number;
  title: string;
  nextLevelXp: number;
}

export function calculateLevel(xp: number): LevelInfo {
  if (xp < 500) return { level: 1, title: 'DevOps Novice', nextLevelXp: 500 };
  if (xp < 2500) return { level: 2, title: 'Git Apprentice', nextLevelXp: 2500 };
  if (xp < 5000) return { level: 3, title: 'Scripting Cadet', nextLevelXp: 5000 };
  if (xp < 7500) return { level: 4, title: 'Network Sentry', nextLevelXp: 7500 };
  if (xp < 10000) return { level: 5, title: 'Systems Admin', nextLevelXp: 10000 };
  if (xp < 13000) return { level: 6, title: 'Docker Operator', nextLevelXp: 13000 };
  if (xp < 16000) return { level: 7, title: 'Kubernetes Engineer', nextLevelXp: 16000 };
  if (xp < 20000) return { level: 8, title: 'IaC Provisioner', nextLevelXp: 20000 };
  if (xp < 24000) return { level: 9, title: 'Pipeline Architect', nextLevelXp: 24000 };
  if (xp < 28000) return { level: 10, title: 'Site Reliability Engineer', nextLevelXp: 28000 };
  if (xp < 32000) return { level: 11, title: 'Cloud Engineer', nextLevelXp: 32000 };
  return { level: 12, title: 'DevOps Grandmaster', nextLevelXp: 40000 };
}
