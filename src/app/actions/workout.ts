'use server'

import { createClient } from '@/lib/supabase/server'
import { processXP, getStatCategoryForBodyPart } from '@/lib/game'
import { revalidatePath } from 'next/cache'

/**
 * Fetch all workouts completed by the current user today
 */
export async function getCompletedWorkoutsToday() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('workout_completions')
    .select('*')
    .eq('user_id', user.id)
    .gte('completed_at', todayStart.toISOString())
    .order('completed_at', { ascending: true })

  if (error) {
    console.error('Error fetching today\'s workouts:', error)
    return []
  }

  return data
}

/**
 * Log a completed exercise, reward 2-5 XP, and increase stats
 */
export async function completeWorkoutExercise(bodyPart: string, workoutType: string, exerciseName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // 1. Double check PRO status
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (pError || !profile) return { error: 'Profile not found.' }
  if (!profile.is_pro) return { error: 'Workout system is restricted to PRO S-Rank Hunters.' }

  // 2. Prevent duplicate completion today
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data: existing, error: eError } = await supabase
    .from('workout_completions')
    .select('id')
    .eq('user_id', user.id)
    .eq('exercise_name', exerciseName)
    .eq('workout_type', workoutType)
    .eq('body_part', bodyPart)
    .gte('completed_at', todayStart.toISOString())
    .maybeSingle()

  if (eError) return { error: 'Database verification failed.' }
  if (existing) return { error: 'Exercise already completed today.' }

  // 3. Roll XP reward (2 - 5 XP)
  const xpGained = Math.floor(Math.random() * 4) + 2 // random integer 2, 3, 4, 5

  // 4. Calculate stat gain based on body part
  const statGained = getStatCategoryForBodyPart(bodyPart)
  const statIncrease = 1 // workouts give a steady +1 to the stat category
  const currentStatValue = profile[statGained] as number
  const newStatValue = Math.min(1000, currentStatValue + statIncrease)

  // 5. Calculate new Level / Rank
  const { level: newLevel, xp: newXP, leveledUp, rankedUp, rank: newRank } = processXP(
    profile.level,
    profile.total_xp,
    xpGained
  )

  // 6. DB Updates
  const profileUpdates: any = {
    total_xp: newXP,
    level: newLevel,
    rank: newRank,
    [statGained]: newStatValue,
    updated_at: new Date().toISOString(),
  }

  // Update profile
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', user.id)

  if (profileUpdateError) return { error: profileUpdateError.message }

  // Insert workout completion log
  const { error: insertError } = await supabase
    .from('workout_completions')
    .insert({
      user_id: user.id,
      body_part: bodyPart,
      workout_type: workoutType,
      exercise_name: exerciseName,
      xp_gained: xpGained,
    })

  if (insertError) {
    console.error('Failed to log workout completion:', insertError)
    // Non-blocking for the user, but we log it
  }

  // Update stat history
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: latestHistory } = await supabase
    .from('stat_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', todayStr)
    .single()

  if (latestHistory) {
    await supabase
      .from('stat_history')
      .update({
        [statGained]: newStatValue,
      })
      .eq('id', latestHistory.id)
  } else {
    await supabase.from('stat_history').insert({
      user_id: user.id,
      date: todayStr,
      attack_power: statGained === 'attack_power' ? newStatValue : profile.attack_power,
      intelligence: profile.intelligence, // workouts do not train intelligence by default
      endurance: statGained === 'endurance' ? newStatValue : profile.endurance,
      stamina: statGained === 'stamina' ? newStatValue : profile.stamina,
      exercise: profile.exercise,
      skills: profile.skills,
    })
  }

  revalidatePath('/workout')
  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/profile')
  revalidatePath('/stats')

  return {
    success: true,
    xpGained,
    statGained,
    statIncrease,
    leveledUp,
    rankedUp,
    newLevel,
    newRank,
  }
}
