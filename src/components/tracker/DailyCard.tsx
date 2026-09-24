import { Check, Flame } from "lucide-react"

export type DailyCardProps = {
  title: string
  streak: number
  completed?: boolean
  onToggle?: () => void
}

export function DailyCard({
  title,
  streak,
  completed = false,
  onToggle,
}: DailyCardProps) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-primary/5">
      <button
        type="button"
        aria-label={`${completed ? "Uncomplete" : "Complete"} ${title}`}
        aria-pressed={completed}
        onClick={onToggle}
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 transition active:scale-95 ${completed ? "border-primary bg-primary text-primary-foreground" : "border-primary/30 text-primary hover:bg-accent"}`}
      >
        <Check className="size-6" strokeWidth={2.5} />
      </button>
      <div className="min-w-0 flex-1">
        <h3
          className={`truncate text-sm font-semibold ${completed ? "text-muted-foreground line-through" : ""}`}
        >
          {title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Flame className="size-3.5 text-primary" /> {streak} day streak
        </p>
      </div>
    </article>
  )
}
