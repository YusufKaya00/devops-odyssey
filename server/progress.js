export function calculateLevel(xp) {
  if (xp < 200) return { level: 1, title: 'DevOps Novice', nextLevelXp: 200 };
  if (xp < 500) return { level: 2, title: 'Git Apprentice', nextLevelXp: 500 };
  if (xp < 1000) return { level: 3, title: 'Version Control Operator', nextLevelXp: 1000 };
  if (xp < 1800) return { level: 4, title: 'Docker Operator', nextLevelXp: 1800 };
  return { level: 5, title: 'Cloud Architect', nextLevelXp: 3000 };
}
