import { X } from "lucide-react"
import { type FormEvent, useState } from "react"

import type { Habit, HabitUpdates } from "@/hooks/useHabits"

export type TaskType = "habit" | "daily" | "todo"

type TaskDialogProps = {
  open: boolean
  task?: Habit | null
  onClose: () => void
  onSubmit: (values: {
    type: TaskType
    title: string
    target_count: number
    schedule_type: string
    priority: Habit["priority"]
    due_date: string | null
    updates?: HabitUpdates
  }) => Promise<void> | void
}

export function TaskDialog({ open, task, onClose, onSubmit }: TaskDialogProps) {
  const [type, setType] = useState<TaskType>("habit")
  const [title, setTitle] = useState(task?.title ?? "")
  const [targetCount, setTargetCount] = useState(task?.target_count ?? 1)
  const [schedule, setSchedule] = useState(task?.schedule_type ?? "daily")
  const [priority, setPriority] = useState<Habit["priority"]>(
    task?.priority ?? "medium"
  )
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) ?? "")
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setValidationError("Title is required")
      return
    }
    setValidationError(null)
    await onSubmit({
      type,
      title: title.trim(),
      target_count: targetCount,
      schedule_type: schedule,
      priority,
      due_date: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : null,
      updates: task
        ? {
            title: title.trim(),
            target_count: targetCount,
            schedule_type: schedule,
            priority,
            due_date: dueDate
              ? new Date(`${dueDate}T12:00:00`).toISOString()
              : null,
          }
        : undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/25 p-3 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-dialog-title"
        className="w-full max-w-[480px] rounded-[2rem] border border-border bg-card p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2
            id="task-dialog-title"
            className="font-heading text-lg font-semibold"
          >
            {task ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            aria-label="Close task dialog"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <form noValidate className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as TaskType)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="habit">Habit</option>
              <option value="daily">Daily</option>
              <option value="todo">To-do</option>
            </select>
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>
              {type === "todo"
                ? "Task Title"
                : type === "daily"
                  ? "Daily Title"
                  : "Habit Title"}
            </span>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="What do you want to keep up?"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          {validationError && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {validationError}
            </p>
          )}
          {type === "habit" && (
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Target taps</span>
              <input
                type="number"
                min={1}
                value={targetCount}
                onChange={(event) => setTargetCount(Number(event.target.value))}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </label>
          )}
          {(type === "habit" || type === "daily") && (
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Schedule</span>
              <select
                value={schedule}
                onChange={(event) => setSchedule(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="daily">Every day</option>
                <option value="weekdays">Weekdays</option>
                <option value="interval">Every interval</option>
              </select>
            </label>
          )}
          {(type === "todo" || type === "habit") && (
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as Habit["priority"])
                }
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          )}
          {type === "todo" && (
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </label>
          )}
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {task ? "Save changes" : "Create task"}
          </button>
        </form>
      </section>
    </div>
  )
}
