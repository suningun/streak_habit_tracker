// Platform-agnostic habit log types.
//
// These live in their own leaf module so that shared logic (streaks-engine) can
// be typechecked and bundled for React Native without pulling in
// @/hooks/useHabits -> @/lib/supabase, which reads import.meta.env and cannot
// be evaluated under Hermes.

export type HabitLogType = "positive" | "negative"

export type HabitLog = {
  id: string
  task_id: string
  user_id: string
  log_type: HabitLogType
  logged_at: string
}
