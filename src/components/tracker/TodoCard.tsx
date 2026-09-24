import { Check } from "lucide-react"
import { useState } from "react"

export type TodoCardProps = {
  title: string
  priority: "low" | "medium" | "high"
  dueDate?: string | null
  completed?: boolean
  onToggle?: () => void
}

export function TodoCard({
  title,
  priority,
  dueDate,
  completed = false,
  onToggle,
}: TodoCardProps) {
  const [now] = useState(() => Date.now())
  const overdue = Boolean(
    dueDate && !completed && new Date(dueDate).getTime() < now
  )
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-primary/5">
      <button
        type="button"
        aria-label={`${completed ? "Uncomplete" : "Complete"} ${title}`}
        aria-pressed={completed}
        onClick={onToggle}
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 ${completed ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent hover:border-primary"}`}
      >
        <Check className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h3
          className={`truncate text-sm font-semibold ${completed ? "text-muted-foreground line-through" : ""}`}
        >
          {title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`rounded-full px-2 py-0.5 font-semibold ${priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}
          >
            {priority}
          </span>
          {dueDate && (
            <time
              className={overdue ? "font-semibold text-destructive" : ""}
              dateTime={dueDate}
            >
              {overdue ? "Overdue" : new Date(dueDate).toLocaleDateString()}
            </time>
          )}
        </div>
      </div>
    </article>
  )
}
