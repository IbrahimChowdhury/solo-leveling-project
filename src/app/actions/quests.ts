'use server'

import { createClient } from '@/lib/supabase/server'
import { processXP } from '@/lib/game'
import { revalidatePath, revalidateTag } from 'next/cache'
import { generateDailyQuests } from '@/lib/quests-generator'
import type { StatCategory } from '@/types'

export async function getDailyQuests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data: quests, error } = await supabase
    .from('daily_quests')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('created_at', { ascending: true })

  if (error) return []
  return quests
}

export async function getCustomQuests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: quests, error } = await supabase
    .from('custom_quests')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return quests
}

export async function completeDailyQuest(questId: string, proofImageUrl: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // 1. Fetch the quest details
  const { data: quest, error: qError } = await supabase
    .from('daily_quests')
    .select('*')
    .eq('id', questId)
    .eq('user_id', user.id)
    .single()

  if (qError || !quest) return { error: 'Quest not found.' }
  if (quest.completed) return { error: 'Quest already completed.' }

  // 2. Fetch user profile
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (pError || !profile) return { error: 'Profile not found.' }

  // 3. XP calculation (double on weekends for Pro)
  let xpGained = quest.xp_reward
  const day = new Date().getUTCDay()
  const isWeekend = day === 0 || day === 6 // 0=Sunday, 6=Saturday
  if (profile.is_pro && isWeekend) {
    xpGained = quest.xp_reward * 2
  }

  // 4. Stat increase calculation
  const statGained = quest.stat_category
  const statIncrease = Math.max(2, Math.min(10, Math.floor(quest.xp_reward / 10)))
  const currentStatValue = profile[statGained as keyof typeof profile] as number
  const newStatValue = Math.min(1000, currentStatValue + statIncrease)

  // 5. Level up evaluation
  const { level: newLevel, xp: newXP, leveledUp, rankedUp, rank: newRank } = processXP(
    profile.level,
    profile.total_xp,
    xpGained
  )

  // 6. Update Database in a single transaction (using updates)
  const profileUpdates: any = {
    total_xp: newXP,
    level: newLevel,
    rank: newRank,
    [statGained]: newStatValue,
    updated_at: new Date().toISOString(),
  }

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', user.id)

  if (profileUpdateError) return { error: profileUpdateError.message }

  // Update Daily Quest completion status
  await supabase
    .from('daily_quests')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', questId)

  // Synchronize with parent custom quest if it's a daily custom quest template
  const lastCompletedAt = new Date().toISOString()
  const nextDate = new Date()
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  nextDate.setUTCHours(0, 0, 0, 0)
  const nextResetAt = nextDate.toISOString()

  await supabase
    .from('custom_quests')
    .update({
      last_completed_at: lastCompletedAt,
      next_reset_at: nextResetAt,
    })
    .eq('user_id', user.id)
    .eq('title', quest.title)
    .eq('repeat_type', 'daily')
    .eq('active', true)

  // Log completion
  await supabase.from('quest_completions').insert({
    user_id: user.id,
    quest_id: questId,
    quest_type: 'system',
    xp_gained: xpGained,
    stat_gained: statGained,
    proof_image_url: proofImageUrl,
  })

  // Log stat history
  const { data: latestHistory } = await supabase
    .from('stat_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', new Date().toISOString().split('T')[0])
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
      date: new Date().toISOString().split('T')[0],
      attack_power: statGained === 'attack_power' ? newStatValue : profile.attack_power,
      intelligence: statGained === 'intelligence' ? newStatValue : profile.intelligence,
      endurance: statGained === 'endurance' ? newStatValue : profile.endurance,
      stamina: statGained === 'stamina' ? newStatValue : profile.stamina,
      exercise: statGained === 'exercise' ? newStatValue : profile.exercise,
      skills: statGained === 'skills' ? newStatValue : profile.skills,
    })
  }

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

export async function completeCustomQuest(questId: string, proofImageUrl: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // 1. Fetch custom quest details
  const { data: quest, error: qError } = await supabase
    .from('custom_quests')
    .select('*')
    .eq('id', questId)
    .eq('user_id', user.id)
    .eq('active', true)
    .single()

  if (qError || !quest) return { error: 'Quest not found or inactive.' }

  // 2. Fetch user profile
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (pError || !profile) return { error: 'Profile not found.' }

  // 3. Double XP on weekends for Pro
  let xpGained = quest.xp_reward
  const day = new Date().getUTCDay()
  const isWeekend = day === 0 || day === 6
  if (profile.is_pro && isWeekend) {
    xpGained = quest.xp_reward * 2
  }

  // 4. Stat increase
  const statGained = quest.stat_category
  const statIncrease = Math.max(2, Math.min(10, Math.floor(quest.xp_reward / 10)))
  const currentStatValue = profile[statGained as keyof typeof profile] as number
  const newStatValue = Math.min(1000, currentStatValue + statIncrease)

  // 5. Process Level Up
  const { level: newLevel, xp: newXP, leveledUp, rankedUp, rank: newRank } = processXP(
    profile.level,
    profile.total_xp,
    xpGained
  )

  // 6. Update profile
  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      total_xp: newXP,
      level: newLevel,
      rank: newRank,
      [statGained]: newStatValue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (profileUpdateError) return { error: profileUpdateError.message }

  // Update Custom Quest reset times
  const lastCompletedAt = new Date().toISOString()
  let nextResetAt = null

  if (quest.repeat_type !== 'one-time') {
    const nextDate = new Date()
    if (quest.repeat_type === 'daily') nextDate.setUTCDate(nextDate.getUTCDate() + 1)
    else if (quest.repeat_type === 'weekly') nextDate.setUTCDate(nextDate.getUTCDate() + 7)
    else if (quest.repeat_type === 'monthly') nextDate.setUTCMonth(nextDate.getUTCMonth() + 1)
    else if (quest.repeat_type === 'yearly') nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1)
    
    // Set reset time to midnight of next period
    nextDate.setUTCHours(0, 0, 0, 0)
    nextResetAt = nextDate.toISOString()
  }

  await supabase
    .from('custom_quests')
    .update({
      last_completed_at: lastCompletedAt,
      next_reset_at: nextResetAt,
      active: quest.repeat_type !== 'one-time', // set inactive if one-time
    })
    .eq('id', questId)

  // Synchronize with today's copy in daily_quests if it's a daily custom quest
  if (quest.repeat_type === 'daily') {
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('daily_quests')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('date', today)
      .eq('title', quest.title)
      .eq('completed', false)
  }

  // Log completion
  await supabase.from('quest_completions').insert({
    user_id: user.id,
    quest_id: questId,
    quest_type: 'custom',
    xp_gained: xpGained,
    stat_gained: statGained,
    proof_image_url: proofImageUrl,
  })

  // Log stat history
  const { data: latestHistory } = await supabase
    .from('stat_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', new Date().toISOString().split('T')[0])
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
      date: new Date().toISOString().split('T')[0],
      attack_power: statGained === 'attack_power' ? newStatValue : profile.attack_power,
      intelligence: statGained === 'intelligence' ? newStatValue : profile.intelligence,
      endurance: statGained === 'endurance' ? newStatValue : profile.endurance,
      stamina: statGained === 'stamina' ? newStatValue : profile.stamina,
      exercise: statGained === 'exercise' ? newStatValue : profile.exercise,
      skills: statGained === 'skills' ? newStatValue : profile.skills,
    })
  }

  revalidatePath('/my-quests')
  revalidatePath('/dashboard')
  revalidatePath('/')
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

export async function addCustomQuest(
  title: string,
  description: string,
  statCategory: string,
  xpReward: number,
  repeatType: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  proofRequired: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Validate inputs
  if (!title || title.trim().length === 0) return { error: 'Title is required.' }
  if (xpReward < 5 || xpReward > 30) return { error: 'XP reward must be between 5 and 30.' }

  // Check profile Pro status
  const { data: profile } = await supabase
    .from('profiles')
    .select('level, is_pro')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found.' }

  // Check quest limit
  const limit = profile.is_pro ? 40 : 3
  const { count, error: countError } = await supabase
    .from('custom_quests')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('active', true)

  if (countError) return { error: countError.message }
  if (count && count >= limit) {
    return { error: `Active custom quests limit reached (${count}/${limit}). ${profile.is_pro ? 'Max limit is 40.' : 'Upgrade to PRO to get 40 slots!'}` }
  }

  // Insert quest
  const { error } = await supabase.from('custom_quests').insert({
    user_id: user.id,
    title,
    description,
    stat_category: statCategory,
    xp_reward: xpReward,
    repeat_type: repeatType,
    proof_required: proofRequired,
    active: true,
  })

  if (error) return { error: error.message }

  // Sync today's daily_quests list if this is a daily quest
  if (repeatType === 'daily') {
    const today = new Date().toISOString().split('T')[0]

    // Fetch existing daily quests for today
    const { data: todayQuests } = await supabase
      .from('daily_quests')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)

    // Fetch latest profile for streak check
    const { data: latestProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (latestProfile) {
      if (!todayQuests || todayQuests.length === 0) {
        // First custom daily quest: generate today's daily quests from it
        await generateDailyQuests(latestProfile)
      } else {
        // Daily quests already generated: insert today's copy of this new quest directly
        let finalXP = xpReward
        if (latestProfile.streak_days > 0) {
          finalXP = Math.floor(xpReward * 1.15)
        }
        await supabase.from('daily_quests').insert({
          user_id: user.id,
          date: today,
          title,
          description,
          stat_category: statCategory,
          xp_reward: finalXP,
          completed: false,
        })
      }
    }
  }

  revalidatePath('/my-quests')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}


export async function deleteCustomQuest(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Fetch the quest details before updating
  const { data: quest } = await supabase
    .from('custom_quests')
    .select('repeat_type, title')
    .eq('id', questId)
    .eq('user_id', user.id)
    .single()

  if (!quest) return { error: 'Quest not found.' }

  const { error } = await supabase
    .from('custom_quests')
    .update({ active: false })
    .eq('id', questId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  // Sync today's daily_quests copy if it was a daily quest
  if (quest.repeat_type === 'daily') {
    const today = new Date().toISOString().split('T')[0]

    // Count remaining active daily custom quests
    const { count } = await supabase
      .from('custom_quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('active', true)
      .eq('repeat_type', 'daily')

    const activeDailyCount = count ?? 0

    if (activeDailyCount === 0) {
      // Revert back to system examples
      const { data: todayQuests } = await supabase
        .from('daily_quests')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('date', today)

      const anyCompleted = todayQuests?.some(q => q.completed)
      if (todayQuests && todayQuests.length > 0 && !anyCompleted) {
        await supabase.from('daily_quests').delete().eq('user_id', user.id).eq('date', today)
        const { data: latestProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (latestProfile) await generateDailyQuests(latestProfile)
      }
    } else {
      // Delete today's copy of this deleted daily quest if it was not completed
      const { data: todayCopy } = await supabase
        .from('daily_quests')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('title', quest.title)
        .maybeSingle()

      if (todayCopy && !todayCopy.completed) {
        await supabase.from('daily_quests').delete().eq('id', todayCopy.id)
      }
    }
  }

  revalidatePath('/my-quests')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}


export async function editCustomQuest(
  questId: string,
  title: string,
  description: string,
  statCategory: string,
  xpReward: number,
  repeatType: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  proofRequired: boolean
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Validate inputs
  if (!title || title.trim().length === 0) return { error: 'Title is required.' }
  if (xpReward < 5 || xpReward > 30) return { error: 'XP reward must be between 5 and 30.' }

  // Fetch the original quest details
  const { data: originalQuest } = await supabase
    .from('custom_quests')
    .select('repeat_type, title')
    .eq('id', questId)
    .eq('user_id', user.id)
    .single()

  if (!originalQuest) return { error: 'Quest not found.' }

  // Update custom_quests row
  const { error } = await supabase
    .from('custom_quests')
    .update({
      title,
      description,
      stat_category: statCategory,
      xp_reward: xpReward,
      repeat_type: repeatType,
      proof_required: proofRequired,
    })
    .eq('id', questId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  // Synchronize today's daily_quests copy if needed
  const today = new Date().toISOString().split('T')[0]

  if (repeatType === 'daily') {
    // If it is daily now, check if today has a daily_quests entry for this quest (matching by original title)
    const { data: todayCopy } = await supabase
      .from('daily_quests')
      .select('id, completed')
      .eq('user_id', user.id)
      .eq('date', today)
      .eq('title', originalQuest.title)
      .maybeSingle()

    // Fetch profile for streak calculations
    const { data: latestProfile } = await supabase
      .from('profiles')
      .select('streak_days')
      .eq('id', user.id)
      .single()

    let finalXP = xpReward
    if (latestProfile && latestProfile.streak_days > 0) {
      finalXP = Math.floor(xpReward * 1.15)
    }

    if (todayCopy && !todayCopy.completed) {
      // Update today's copy
      await supabase
        .from('daily_quests')
        .update({
          title,
          description,
          stat_category: statCategory,
          xp_reward: finalXP,
        })
        .eq('id', todayCopy.id)
    } else if (!todayCopy) {
      // If it became daily (changed from e.g. weekly to daily), check if this is now the first custom daily quest.
      // If so, replace system examples immediately!
      const { count } = await supabase
        .from('custom_quests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('active', true)
        .eq('repeat_type', 'daily')

      const activeDailyCount = count ?? 0

      if (activeDailyCount === 1) {
        const { data: todayQuests } = await supabase
          .from('daily_quests')
          .select('id, completed')
          .eq('user_id', user.id)
          .eq('date', today)

        const anyCompleted = todayQuests?.some(q => q.completed)
        if (todayQuests && todayQuests.length > 0 && !anyCompleted) {
          await supabase.from('daily_quests').delete().eq('user_id', user.id).eq('date', today)
          const { data: latestFullProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          if (latestFullProfile) await generateDailyQuests(latestFullProfile)
        }
      } else if (activeDailyCount > 1) {
        // Insert today's copy directly
        await supabase.from('daily_quests').insert({
          user_id: user.id,
          date: today,
          title,
          description,
          stat_category: statCategory,
          xp_reward: finalXP,
          completed: false,
        })
      }
    }
  } else if (originalQuest.repeat_type === 'daily') {
    // Stopped being daily! Check if 0 custom daily quests remain
    const { count: activeDailyCount } = await supabase
      .from('custom_quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('active', true)
      .eq('repeat_type', 'daily')

    if (activeDailyCount === 0) {
      // Revert back to system examples
      const { data: todayQuests } = await supabase
        .from('daily_quests')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('date', today)

      const anyCompleted = todayQuests?.some(q => q.completed)
      if (todayQuests && todayQuests.length > 0 && !anyCompleted) {
        await supabase.from('daily_quests').delete().eq('user_id', user.id).eq('date', today)
        const { data: latestProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (latestProfile) await generateDailyQuests(latestProfile)
      }
    } else {
      // Delete today's copy of this changed daily quest if it was not completed
      const { data: todayCopy } = await supabase
        .from('daily_quests')
        .select('id, completed')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('title', originalQuest.title)
        .maybeSingle()

      if (todayCopy && !todayCopy.completed) {
        await supabase.from('daily_quests').delete().eq('id', todayCopy.id)
      }
    }
  }

  revalidatePath('/my-quests')
  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function claimExampleQuest(
  title: string,
  description: string,
  statCategory: StatCategory,
  xpReward: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // Fetch user profile
  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (pError || !profile) return { error: 'Profile not found.' }

  const today = new Date().toISOString().split('T')[0]

  // Check if this example quest was already claimed today (by title + date)
  const { data: existing } = await supabase
    .from('daily_quests')
    .select('id, completed')
    .eq('user_id', user.id)
    .eq('date', today)
    .eq('title', title)
    .maybeSingle()

  if (existing?.completed) return { error: 'Quest already completed.' }

  // Apply streak XP bonus
  let finalXP = xpReward
  if (profile.streak_days > 0) {
    finalXP = Math.floor(finalXP * 1.15)
  }

  // Weekend Pro double XP
  const day = new Date().getUTCDay()
  const isWeekend = day === 0 || day === 6
  if (profile.is_pro && isWeekend) {
    finalXP = finalXP * 2
  }

  // Stat increase
  const statIncrease = Math.max(2, Math.min(10, Math.floor(xpReward / 10)))
  const currentStatValue = profile[statCategory as keyof typeof profile] as number
  const newStatValue = Math.min(1000, currentStatValue + statIncrease)

  // Level up evaluation
  const { level: newLevel, xp: newXP, leveledUp, rankedUp, rank: newRank } = processXP(
    profile.level,
    profile.total_xp,
    finalXP
  )

  // Insert completed quest record into daily_quests
  const { data: insertedQuest, error: insertError } = await supabase
    .from('daily_quests')
    .insert({
      user_id: user.id,
      date: today,
      title,
      description,
      stat_category: statCategory,
      xp_reward: finalXP,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError || !insertedQuest) return { error: insertError?.message || 'Failed to save quest.' }

  // Update profile
  const profileUpdates: Record<string, unknown> = {
    total_xp: newXP,
    level: newLevel,
    rank: newRank,
    [statCategory]: newStatValue,
    updated_at: new Date().toISOString(),
  }

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', user.id)

  if (profileUpdateError) return { error: profileUpdateError.message }

  // Log completion
  await supabase.from('quest_completions').insert({
    user_id: user.id,
    quest_id: insertedQuest.id,
    quest_type: 'system',
    xp_gained: finalXP,
    stat_gained: statCategory,
    proof_image_url: null,
  })

  // Log stat history
  const { data: latestHistory } = await supabase
    .from('stat_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (latestHistory) {
    await supabase
      .from('stat_history')
      .update({ [statCategory]: newStatValue })
      .eq('id', latestHistory.id)
  } else {
    await supabase.from('stat_history').insert({
      user_id: user.id,
      date: today,
      attack_power: statCategory === 'attack_power' ? newStatValue : profile.attack_power,
      intelligence: statCategory === 'intelligence' ? newStatValue : profile.intelligence,
      endurance: statCategory === 'endurance' ? newStatValue : profile.endurance,
      stamina: statCategory === 'stamina' ? newStatValue : profile.stamina,
      exercise: statCategory === 'exercise' ? newStatValue : profile.exercise,
      skills: statCategory === 'skills' ? newStatValue : profile.skills,
    })
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/profile')
  revalidatePath('/stats')

  return {
    success: true,
    xpGained: finalXP,
    statGained: statCategory,
    statIncrease,
    leveledUp,
    rankedUp,
    newLevel,
    newRank,
  }
}

