import type { HabitLog } from "@/hooks/useHabits"

export type HabitStrength = "strong" | "steady" | "slipping"

function dayKey(value: string | Date) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function uniquePositiveDaysInWindow(logs: HabitLog[], now = new Date(), windowDays = 30) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (windowDays - 1))

  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  return new Set(
    logs
      .filter((log) => log.log_type === "positive")
      .map((log) => ({ key: dayKey(log.logged_at), date: new Date(log.logged_at) }))
      .filter(({ date }) => date >= start && date <= end)
      .map(({ key }) => key),
  )
}

export function calculateHabitStrength(logs: HabitLog[], now = new Date()): HabitStrength {
  const loggedDays = uniquePositiveDaysInWindow(logs, now, 30).size
  if (loggedDays >= 24) {
    return "strong"
  }
  if (loggedDays >= 15) {
    return "steady"
  }
  return "slipping"
}

export function calculateDailyStreak(logs: HabitLog[], now = new Date()) {
  const loggedDays = new Set(
    logs
      .filter((log) => log.log_type === "positive")
      .map((log) => dayKey(log.logged_at))
  )
  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)

  if (!loggedDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (loggedDays.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
