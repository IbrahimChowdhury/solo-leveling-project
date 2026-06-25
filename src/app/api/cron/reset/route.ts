import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateDailyQuests } from '@/lib/quests-generator'
import { processXPLoss } from '@/lib/game'
import { revalidateTag } from 'next/cache'


export async function GET(request: Request) {
  // 1. Secure authorization
  const authHeader = request.headers.get('Authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const adminDb = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Find yesterday's date string
  const yesterdayDateObj = new Date()
  yesterdayDateObj.setUTCDate(yesterdayDateObj.getUTCDate() - 1)
  const yesterday = yesterdayDateObj.toISOString().split('T')[0]

  try {
    // 2. Fetch all profiles
    const { data: profiles, error: pError } = await adminDb
      .from('profiles')
      .select('*')

    if (pError || !profiles) {
      return NextResponse.json({ error: 'Failed to fetch profiles.' }, { status: 500 })
    }

    const results = []

    for (const profile of profiles) {
      // 3. Get yesterday's daily quests
      const { data: quests } = await adminDb
        .from('daily_quests')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', yesterday)

      if (!quests || quests.length === 0) {
        // No quests generated yesterday. Generate for today and continue.
        await generateDailyQuests(profile)
        revalidateTag(`daily-quests-${profile.id}-${today}`, 'max')
        results.push({ userId: profile.id, status: 'no_yesterday_quests_generated_today' })
        continue
      }

      const completed = quests.filter(q => q.completed).length
      const total = quests.length
      const completionRate = completed / total

      let nextStreak = profile.streak_days
      let penaltyApplied = false
      let shieldConsumed = false
      let newLevel = profile.level
      let newXP = profile.total_xp
      let newRank = profile.rank

      const userStats = {
        attack_power: profile.attack_power,
        intelligence: profile.intelligence,
        endurance: profile.endurance,
        stamina: profile.stamina,
        exercise: profile.exercise,
        skills: profile.skills,
      }

      // Check if user cleared daily requirements (>= 80%)
      if (completionRate >= 0.8) {
        nextStreak += 1
      } else {
        // Did not clear requirements: Evaluate penalties
        const hasShield = profile.is_pro && profile.penalty_shield_used_this_week

        if (hasShield) {
          // Bypassed penalty due to Pro shield
          shieldConsumed = true
        } else {
          // Apply penalty for each incomplete daily quest
          const incompleteQuests = quests.filter(q => !q.completed)
          let xpLost = 0

          for (const q of incompleteQuests) {
            xpLost += 50
            const statCat = q.stat_category
            const currentStatVal = userStats[statCat as keyof typeof userStats]
            userStats[statCat as keyof typeof userStats] = Math.max(0, currentStatVal - 2)

            // Log penalty
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
          const degradation = processXPLoss(profile.level, profile.total_xp, xpLost)
          newLevel = degradation.level
          newXP = degradation.xp
          newRank = degradation.rank
          penaltyApplied = true
        }

        // Streak reset logic (Pro streak never resets)
        if (!profile.is_pro) {
          nextStreak = 0
        }
      }

      // 4. Update profile changes
      const profileUpdates: any = {
        streak_days: nextStreak,
        level: newLevel,
        total_xp: newXP,
        rank: newRank,
        ...userStats,
        updated_at: new Date().toISOString(),
      }

      if (shieldConsumed) {
        profileUpdates.penalty_shield_used_this_week = false // reset shield for next week
      }

      await adminDb
        .from('profiles')
        .update(profileUpdates)
        .eq('id', profile.id)

      // 5. Generate daily quests for the new day
      await generateDailyQuests({
        ...profile,
        ...profileUpdates,
      })
      revalidateTag(`daily-quests-${profile.id}-${today}`, 'max')
      revalidateTag(`profile-${profile.id}`, 'max')

      // 6. Log stat history entry for the processed day
      await adminDb.from('stat_history').insert({
        user_id: profile.id,
        date: yesterday,
        attack_power: userStats.attack_power,
        intelligence: userStats.intelligence,
        endurance: userStats.endurance,
        stamina: userStats.stamina,
        exercise: userStats.exercise,
        skills: userStats.skills,
      })

      results.push({
        userId: profile.id,
        streak: nextStreak,
        penaltyApplied,
        shieldConsumed,
        leveledDown: newLevel < profile.level,
      })
    }

    return NextResponse.json({ success: true, processed: results })
  } catch (error: any) {
    console.error('Reset cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
