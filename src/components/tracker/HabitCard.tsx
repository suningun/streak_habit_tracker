import {
  Flame,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import type { Habit } from "@/hooks/useHabits"
import {
  calculateDailyStreak,
  calculateHabitStrength,
} from "@/lib/streaks-engine"
import { cn } from "@/lib/utils"

const strengthLabels = {
  strong: "Strong",
  steady: "Steady",
  slipping: "Slipping",
} as const

export type HabitCardProps = {
  habit: Habit
  onPositive: () => void
  onNegative: () => void
  onEdit?: () => void
  onDelete?: () => void
  busy?: boolean
}

export function HabitCard({
  habit,
  onPositive,
  onNegative,
  onEdit,
  onDelete,
  busy = false,
}: HabitCardProps) {
  const today = new Date().toDateString()
  const todayCount = habit.habit_logs.filter(
    (log) =>
      log.log_type === "positive" &&
      new Date(log.logged_at).toDateString() === today
  ).length
  const strength = calculateHabitStrength(habit.habit_logs)
  const streak = calculateDailyStreak(habit.habit_logs)

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-primary/5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <Flame className="size-5 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{habit.title}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                strength === "strong" && "bg-primary/15 text-primary",
                strength === "steady" &&
                  "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                strength === "slipping" && "bg-muted text-muted-foreground"
              )}
            >
              {strengthLabels[strength]}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {todayCount} / {habit.target_count} today
            {streak > 0 ? ` · ${streak} day streak` : ""}
          </p>
        </div>
        <details className="relative">
          <summary
            className="flex size-9 cursor-pointer list-none items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Options for ${habit.title}`}
          >
            <MoreHorizontal className="size-4" />
          </summary>
          <div className="absolute right-0 z-10 mt-1 w-28 rounded-xl border border-border bg-popover p-1 shadow-lg">
            <button
              type="button"
              onClick={(e) => {
                const details = e.currentTarget.closest("details")
                if (details) details.removeAttribute("open")
                onEdit?.()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-muted"
            >
              <Pencil className="size-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                const details = e.currentTarget.closest("details")
                if (details) details.removeAttribute("open")
                onDelete?.()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        </details>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          aria-label={`Positive tap for ${habit.title}`}
          disabled={busy}
          onClick={onPositive}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-50"
        >
          <Plus className="size-4" /> Tap done
        </button>
        <button
          type="button"
          aria-label={`Negative tap for ${habit.title}`}
          disabled={busy}
          onClick={onNegative}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted active:scale-[0.98] disabled:opacity-50"
        >
          <Minus className="size-4" />
        </button>
      </div>
    </article>
  )
}
