export interface LevelInfo {
  level: number;
  title: string;
  nextLevelXp: number;
}

export function calculateLevel(xp: number): LevelInfo {
  if (xp < 350) return { level: 1, title: 'DevOps Novice', nextLevelXp: 350 };
  if (xp < 1800) return { level: 2, title: 'Git Apprentice', nextLevelXp: 1800 };
  if (xp < 4500) return { level: 3, title: 'Code Scribe', nextLevelXp: 4500 };
  if (xp < 8000) return { level: 4, title: 'Linux Explorer', nextLevelXp: 8000 };
  if (xp < 12000) return { level: 5, title: 'Network Sentinel', nextLevelXp: 12000 };
  if (xp < 16000) return { level: 6, title: 'Server Admin', nextLevelXp: 16000 };
  if (xp < 20000) return { level: 7, title: 'Docker Operator', nextLevelXp: 20000 };
  if (xp < 24500) return { level: 8, title: 'Kubernetes Engineer', nextLevelXp: 24500 };
  if (xp < 28000) return { level: 9, title: 'IaC Architect', nextLevelXp: 28000 };
  if (xp < 32000) return { level: 10, title: 'Pipeline Master', nextLevelXp: 32000 };
  if (xp < 36000) return { level: 11, title: 'Cloud Engineer', nextLevelXp: 36000 };
  return { level: 12, title: 'DevOps Grandmaster', nextLevelXp: 40000 };
}
