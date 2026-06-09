import { Profile, StatCategory } from '@/types'
import { createAdminClient } from '@/lib/supabase/server'

interface QuestTemplate {
  title: string
  description: string
  xp: number
}

const TEMPLATES: Record<StatCategory, QuestTemplate[]> = {
  attack_power: [
    { title: 'Push-up Protocol', description: 'Complete 50 push-ups in sets of 10.', xp: 60 },
    { title: 'Cardio Intervals', description: 'Perform 5 sets of 100m high-intensity sprints.', xp: 80 },
    { title: 'Dumbbell Press', description: 'Complete 4 sets of 12 shoulder presses with weights.', xp: 70 }
  ],
  intelligence: [
    { title: 'System Analysis', description: 'Read technical documentation or a non-fiction book for 30 minutes.', xp: 60 },
    { title: 'Algorithmic Challenge', description: 'Resolve 1 programming problem or solve a complex logic puzzle.', xp: 80 },
    { title: 'Mental Exercise', description: 'Learn 15 new foreign language vocabulary words.', xp: 50 }
  ],
  endurance: [
    { title: 'Core Hold', description: 'Hold a solid plank for 3 minutes total.', xp: 60 },
    { title: 'Cold Shower Resistance', description: 'Take a continuous 3-minute cold shower to harden mental discipline.', xp: 50 },
    { title: 'Wall Sit challenge', description: 'Hold a wall sit position for 4 minutes cumulative.', xp: 70 }
  ],
  stamina: [
    { title: 'Hunter Jog', description: 'Run or jog continuously for 3 kilometers.', xp: 100 },
    { title: 'Jumping Jacks Session', description: 'Perform 150 jumping jacks to boost blood flow.', xp: 60 },
    { title: 'Rope Jump Routine', description: 'Perform 5 minutes of jump rope training.', xp: 70 }
  ],
  exercise: [
    { title: 'Gate Raid Exercise', description: 'Complete a 45-minute strength or bodyweight workout.', xp: 100 },
    { title: 'Squat Mastery', description: 'Perform 80 bodyweight squats.', xp: 70 },
    { title: 'Pull-up Trials', description: 'Perform 20 total pull-ups or chin-ups.', xp: 80 }
  ],
  skills: [
    { title: 'Framework Dev Trial', description: 'Dedicate 30 minutes to practicing a coding language, framework, or tool.', xp: 100 },
    { title: 'Deep Focus Sprint', description: 'Complete 2 pomodoro focus cycles (50 minutes total) on a side project.', xp: 80 },
    { title: 'Hand-eye Practice', description: 'Practice a musical instrument or drawing for 30 minutes.', xp: 60 }
  ]
}

export async function generateDailyQuests(profile: Profile) {
  const adminDb = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Check if quests already exist for today
  const { data: existingQuests } = await adminDb
    .from('daily_quests')
    .select('id')
    .eq('user_id', profile.id)
    .eq('date', today)

  if (existingQuests && existingQuests.length > 0) {
    return existingQuests
  }

  // Identify weakest stats
  const statKeys: StatCategory[] = [
    'attack_power',
    'intelligence',
    'endurance',
    'stamina',
    'exercise',
    'skills'
  ]

  const stats = statKeys.map(key => ({
    category: key,
    value: profile[key] as number
  }))

  // Sort ascending by value to find weak stats
  stats.sort((a, b) => a.value - b.value)

  // Take the 5 weakest stat categories
  const targetCategories = stats.slice(0, 5).map(s => s.category)

  const questsToInsert = targetCategories.map(cat => {
    const list = TEMPLATES[cat]
    // Select random template
    const template = list[Math.floor(Math.random() * list.length)]
    
    // Streak XP adjustment (+15%)
    let xpReward = template.xp
    if (profile.streak_days > 0) {
      xpReward = Math.floor(xpReward * 1.15)
    }

    return {
      user_id: profile.id,
      date: today,
      title: template.title,
      description: template.description,
      stat_category: cat,
      xp_reward: xpReward,
      completed: false,
    }
  })

  const { data, error } = await adminDb
    .from('daily_quests')
    .insert(questsToInsert)
    .select()

  if (error) {
    console.error('Failed to generate daily quests:', error)
    return []
  }

  return data
}
