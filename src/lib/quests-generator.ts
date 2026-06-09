import { Profile, StatCategory } from '@/types'
import { createAdminClient } from '@/lib/supabase/server'
import { processXPLoss } from './game'

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

  const { data: existingQuests } = await adminDb
    .from('daily_quests')
    .select('id')
    .eq('user_id', profile.id)
    .eq('date', today)

  if (existingQuests && existingQuests.length > 0) {
    return existingQuests
  }

  // Check if the user has any active custom daily quests
  const { data: activeCustomDailyQuests } = await adminDb
    .from('custom_quests')
    .select('*')
    .eq('user_id', profile.id)
    .eq('active', true)
    .eq('repeat_type', 'daily')

  // No custom daily quests — return empty (example quests shown client-side)
  if (!activeCustomDailyQuests || activeCustomDailyQuests.length === 0) {
    return []
  }

  // Generate daily quests from their custom daily quests templates
  const questsToInsert = activeCustomDailyQuests.map(cq => {
    let xpReward = cq.xp_reward
    if (profile.streak_days > 0) {
      xpReward = Math.floor(xpReward * 1.15)
    }
    return {
      user_id: profile.id,
      date: today,
      title: cq.title,
      description: cq.description,
      stat_category: cq.stat_category,
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

export async function checkAndRunDailyReset(profile: Profile) {
  const adminDb = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Find all unique dates < today where daily quests exist for this user
  const { data: pastQuests } = await adminDb
    .from('daily_quests')
    .select('date')
    .eq('user_id', profile.id)
    .lt('date', today)
    .order('date', { ascending: true })

  const uniquePastDates = Array.from(new Set((pastQuests || []).map(q => q.date)))

  for (const qDate of uniquePastDates) {
    // Check if qDate was already processed via stat_history logs
    const { data: existingHistory } = await adminDb
      .from('stat_history')
      .select('id')
      .eq('user_id', profile.id)
      .eq('date', qDate)
      .maybeSingle()

    if (existingHistory) {
      continue
    }

    // Fetch the most updated profile state from database
    const { data: currentProfile, error: pErr } = await adminDb
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single()

    if (pErr || !currentProfile) {
      console.error('Failed to fetch current profile for reset:', pErr)
      continue
    }

    // Get the daily quests for this specific date
    const { data: questsForDate } = await adminDb
      .from('daily_quests')
      .select('*')
      .eq('user_id', profile.id)
      .eq('date', qDate)

    if (!questsForDate || questsForDate.length === 0) {
      // No quests existed on this date. Just log stat history at current levels.
      await adminDb.from('stat_history').insert({
        user_id: profile.id,
        date: qDate,
        attack_power: currentProfile.attack_power,
        intelligence: currentProfile.intelligence,
        endurance: currentProfile.endurance,
        stamina: currentProfile.stamina,
        exercise: currentProfile.exercise,
        skills: currentProfile.skills,
      })
      continue
    }

    const completed = questsForDate.filter(q => q.completed).length
    const total = questsForDate.length
    const completionRate = completed / total

    let nextStreak = currentProfile.streak_days
    let newLevel = currentProfile.level
    let newXP = currentProfile.total_xp
    let newRank = currentProfile.rank

    const userStats = {
      attack_power: currentProfile.attack_power,
      intelligence: currentProfile.intelligence,
      endurance: currentProfile.endurance,
      stamina: currentProfile.stamina,
      exercise: currentProfile.exercise,
      skills: currentProfile.skills,
    }

    let shieldConsumed = false

    if (completionRate >= 0.8) {
      nextStreak += 1
    } else {
      const hasShield = currentProfile.is_pro && currentProfile.penalty_shield_used_this_week

      if (hasShield) {
        shieldConsumed = true
      } else {
        const incompleteQuests = questsForDate.filter(q => !q.completed)
        let xpLost = 0

        for (const q of incompleteQuests) {
          xpLost += 50
          const statCat = q.stat_category
          userStats[statCat as keyof typeof userStats] = Math.max(0, userStats[statCat as keyof typeof userStats] - 2)

          // Log penalty parameters
          await adminDb.from('penalties').insert({
            user_id: profile.id,
            quest_type: 'system',
            quest_id: q.id,
            xp_lost: 50,
            stat_decreased: statCat,
            decrease_amount: 2,
          })
        }

        // Compute level/XP degradation
        const degradation = processXPLoss(currentProfile.level, currentProfile.total_xp, xpLost)
        newLevel = degradation.level
        newXP = degradation.xp
        newRank = degradation.rank
      }

      if (!currentProfile.is_pro) {
        nextStreak = 0
      }
    }

    const profileUpdates: any = {
      streak_days: nextStreak,
      level: newLevel,
      total_xp: newXP,
      rank: newRank,
      ...userStats,
      updated_at: new Date().toISOString(),
    }

    if (shieldConsumed) {
      profileUpdates.penalty_shield_used_this_week = false
    }

    await adminDb
      .from('profiles')
      .update(profileUpdates)
      .eq('id', profile.id)

    // Log stat history coordinates for qDate
    await adminDb.from('stat_history').insert({
      user_id: profile.id,
      date: qDate,
      attack_power: userStats.attack_power,
      intelligence: userStats.intelligence,
      endurance: userStats.endurance,
      stamina: userStats.stamina,
      exercise: userStats.exercise,
      skills: userStats.skills,
    })
  }

  // Handle case where yesterday had absolutely no quests generated (e.g. they logged in today after some offline days with zero activity)
  // We still want to log a history entry for yesterday if there is none, so they have consecutive daily tracking rows.
  const yesterdayDateObj = new Date()
  yesterdayDateObj.setUTCDate(yesterdayDateObj.getUTCDate() - 1)
  const yesterday = yesterdayDateObj.toISOString().split('T')[0]

  const { data: yesterdayHistory } = await adminDb
    .from('stat_history')
    .select('id')
    .eq('user_id', profile.id)
    .eq('date', yesterday)
    .maybeSingle()

  if (!yesterdayHistory) {
    const { data: latestProfile } = await adminDb
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single()

    if (latestProfile) {
      await adminDb.from('stat_history').insert({
        user_id: profile.id,
        date: yesterday,
        attack_power: latestProfile.attack_power,
        intelligence: latestProfile.intelligence,
        endurance: latestProfile.endurance,
        stamina: latestProfile.stamina,
        exercise: latestProfile.exercise,
        skills: latestProfile.skills,
      })
    }
  }
}
