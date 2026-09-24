import { describe, expect, it } from "vitest"

import type { HabitLog } from "@/hooks/useHabits"
import {
  calculateDailyStreak,
  calculateHabitStrength,
} from "@/lib/streaks-engine"

function createLog(daysAgo: number, log_type: "positive" | "negative" = "positive"): HabitLog {
  const date = new Date(2026, 8, 24, 12, 0, 0) // Sept 24, 2026
  date.setDate(date.getDate() - daysAgo)
  return {
    id: `log-${daysAgo}`,
    task_id: "task-1",
    user_id: "user-1",
    log_type,
    logged_at: date.toISOString(),
  }
}

describe("streaks-engine", () => {
  const anchorDate = new Date(2026, 8, 24, 15, 0, 0)

  it("calculates 0 streak when there are no logs", () => {
    expect(calculateDailyStreak([], anchorDate)).toBe(0)
  })

  it("calculates 1 streak if logged today", () => {
    const logs = [createLog(0)]
    expect(calculateDailyStreak(logs, anchorDate)).toBe(1)
  })

  it("calculates streak if not logged today, but logged yesterday", () => {
    const logs = [createLog(1), createLog(2), createLog(3)]
    expect(calculateDailyStreak(logs, anchorDate)).toBe(3)
  })

  it("calculates unbroken streak extending past 30 days", () => {
    const logs = Array.from({ length: 45 }, (_, i) => createLog(i))
    expect(calculateDailyStreak(logs, anchorDate)).toBe(45)
  })

  it("breaks streak when a day is missed", () => {
    const logs = [createLog(0), createLog(1), createLog(3)]
    expect(calculateDailyStreak(logs, anchorDate)).toBe(2)
  })

  it("calculates habit strength accurately", () => {
    const strongLogs = Array.from({ length: 25 }, (_, i) => createLog(i))
    expect(calculateHabitStrength(strongLogs, anchorDate)).toBe("strong")

    const steadyLogs = Array.from({ length: 18 }, (_, i) => createLog(i))
    expect(calculateHabitStrength(steadyLogs, anchorDate)).toBe("steady")

    const slippingLogs = Array.from({ length: 5 }, (_, i) => createLog(i))
    expect(calculateHabitStrength(slippingLogs, anchorDate)).toBe("slipping")
  })
})
