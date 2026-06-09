export type StatCategory = 'attack_power' | 'intelligence' | 'endurance' | 'stamina' | 'exercise' | 'skills'

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  level: number
  total_xp: number
  rank: string
  attack_power: number
  intelligence: number
  endurance: number
  stamina: number
  exercise: number
  skills: number
  streak_days: number
  is_pro: boolean
  pro_expires_at: string | null
  penalty_shield_used_this_week: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface DailyQuest {
  id: string
  user_id: string
  date: string
  title: string
  description: string
  stat_category: StatCategory
  xp_reward: number
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface CustomQuest {
  id: string
  user_id: string
  title: string
  description: string
  stat_category: StatCategory
  xp_reward: number
  repeat_type: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  proof_required: boolean
  active: boolean
  last_completed_at: string | null
  next_reset_at: string | null
  created_at: string
}

export interface QuestCompletion {
  id: string
  user_id: string
  quest_id: string
  quest_type: 'system' | 'custom'
  xp_gained: number
  stat_gained: string
  proof_image_url: string | null
  completed_at: string
}

export interface StatHistory {
  id: string
  user_id: string
  date: string
  attack_power: number
  intelligence: number
  endurance: number
  stamina: number
  exercise: number
  skills: number
  created_at: string
}

export interface Penalty {
  id: string
  user_id: string
  quest_type: string
  quest_id: string
  xp_lost: number
  stat_decreased: string
  decrease_amount: number
  applied_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  plan: 'monthly' | 'yearly'
  status: string
  current_period_end: string
  created_at: string
}

export interface AdminNotification {
  id: string
  user_id: string | null
  message: string
  read: boolean
  created_at: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  questsCompleted: number
  totalXP: number
  revenue: number
  proSubscribers: number
  avgLevel: number
}
