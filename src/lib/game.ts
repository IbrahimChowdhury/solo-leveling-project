export const RANK_LEVELS = [
  { minLevel: 1, maxLevel: 9, rank: 'E-Rank' },
  { minLevel: 10, maxLevel: 19, rank: 'D-Rank' },
  { minLevel: 20, maxLevel: 29, rank: 'C-Rank' },
  { minLevel: 30, maxLevel: 39, rank: 'B-Rank' },
  { minLevel: 40, maxLevel: 49, rank: 'A-Rank' },
  { minLevel: 50, maxLevel: 59, rank: 'S-Rank' },
  { minLevel: 60, maxLevel: 999, rank: 'National Level' }
]

export function getXPForNextLevel(level: number): number {
  return level * 1000
}

export function getRankForLevel(level: number): string {
  for (const r of RANK_LEVELS) {
    if (level >= r.minLevel && level <= r.maxLevel) {
      return r.rank
    }
  }
  return 'E-Rank'
}

export function processXP(currentLevel: number, currentXP: number, xpToAdd: number) {
  let level = currentLevel
  let xp = currentXP + xpToAdd
  let leveledUp = false

  while (xp >= getXPForNextLevel(level) && level < 999) {
    xp -= getXPForNextLevel(level)
    level += 1
    leveledUp = true
  }

  const oldRank = getRankForLevel(currentLevel)
  const newRank = getRankForLevel(level)
  const rankedUp = oldRank !== newRank

  return {
    level,
    xp,
    leveledUp,
    rankedUp,
    rank: newRank,
  }
}

export function processXPLoss(currentLevel: number, currentXP: number, xpToSubtract: number) {
  let level = currentLevel
  let xp = currentXP - xpToSubtract
  let leveledDown = false

  if (xp < 0) {
    if (level > 1) {
      level -= 1
      xp = Math.floor(getXPForNextLevel(level) * 0.9)
      leveledDown = true
    } else {
      xp = 0
    }
  }

  const oldRank = getRankForLevel(currentLevel)
  const newRank = getRankForLevel(level)
  const rankedDown = oldRank !== newRank

  return {
    level,
    xp,
    leveledDown,
    rankedDown,
    rank: newRank,
  }
}

export function getStatCategoryForBodyPart(bodyPart: string): 'attack_power' | 'endurance' | 'stamina' {
  const part = bodyPart.toLowerCase()
  if (
    part === 'shoulders' || 
    part === 'arms' || 
    part === 'biceps' || 
    part === 'triceps' || 
    part === 'forearms'
  ) {
    return 'attack_power'
  }
  if (part === 'chest' || part === 'back' || part === 'neck') {
    return 'endurance'
  }
  // core, legs, thighs, calves
  return 'stamina'
}
