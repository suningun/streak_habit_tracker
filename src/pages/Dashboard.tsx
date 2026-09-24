import {
  Cloud,
  Flame,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  WifiOff,
} from "lucide-react"
import { useEffect, useState } from "react"

import { HabitCard } from "@/components/tracker/HabitCard"
import { TaskDialog, type TaskType } from "@/components/tracker/TaskDialog"
import { useAuth } from "@/context/AuthContext"
import { useDebounce } from "@/hooks/useDebounce"
import { useHabits } from "@/hooks/useHabits"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useTheme, type Theme } from "@/lib/theme-provider"
import { cn } from "@/lib/utils"

const tabs = ["All", "Habits", "Dailies", "To-dos"] as const

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const {
    habits,
    loading,
    error,
    actionLoading,
    addHabit,
    editHabit,
    deleteHabit,
    logHabit,
  } = useHabits()
  const [activeTab, setActiveTab] = useLocalStorage<(typeof tabs)[number]>(
    "streaks-active-tab",
    "All"
  )
  const [searchInput, setSearchInput] = useState("")
  const debouncedQuery = useDebounce(searchInput)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<
    (typeof habits)[number] | null
  >(null)
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  const pendingCount = habits.filter((habit) => {
    const today = new Date().toDateString()
    return (
      habit.type !== "todo" &&
      habit.habit_logs.filter(
        (log) =>
          log.log_type === "positive" &&
          new Date(log.logged_at).toDateString() === today
      ).length < habit.target_count
    )
  }).length
  const filteredHabits = habits.filter((habit) => {
    const tabMatches =
      activeTab === "All"
        ? true
        : activeTab === "Habits"
          ? habit.type === "habit"
          : activeTab === "Dailies"
            ? habit.type === "daily"
            : habit.type === "todo"

    return (
      tabMatches &&
      habit.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
  })
  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Sun },
  ]

  async function saveTask(values: {
    type: TaskType
    title: string
    target_count: number
    schedule_type: string
    priority: "low" | "medium" | "high"
    due_date: string | null
    updates?: Parameters<typeof editHabit>[1]
  }) {
    if (editingHabit) {
      await editHabit(editingHabit.id, {
        ...(values.updates ?? {}),
        type: values.type,
      })
    } else {
      await addHabit(values.title, values.target_count, {
        type: values.type,
        priority: values.priority,
        schedule_type: values.schedule_type,
      })
    }
    setDialogOpen(false)
    setEditingHabit(null)
  }

  return (
    <main className="min-h-svh bg-background px-3 py-4 text-foreground sm:px-5 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[980px] flex-col rounded-[2rem] border border-border/80 bg-background shadow-[0_20px_60px_-36px_rgba(99,46,30,0.4)] sm:min-h-[calc(100svh-4rem)] lg:rounded-[2.5rem]">
        <header className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Flame className="size-5 fill-current" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Good to see you</p>
              <h1 className="font-heading text-lg font-semibold">
                {user?.email?.split("@")[0] ?? "Friend"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground">
              {online ? (
                <Cloud className="size-3.5 text-primary" />
              ) : (
                <WifiOff className="size-3.5" />
              )}
              {online ? "Synced" : "Offline"}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>
        <section className="flex items-center justify-between border-y border-border/70 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Your rhythm
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingCount} {pendingCount === 1 ? "habit" : "habits"} to keep
              moving
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingHabit(null)
              setDialogOpen(true)
            }}
            className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-label="Create task"
          >
            <Plus className="size-5" />
          </button>
        </section>
        <nav className="px-4 py-3" aria-label="Task filters">
          <div className="flex gap-1 rounded-xl bg-muted/70 p-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 rounded-lg px-2 py-2 text-xs font-semibold",
                  activeTab === tab
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>
        <section className="flex flex-1 flex-col gap-3 px-4 pb-6">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-muted-foreground focus-within:border-primary">
            <Search className="size-4" />
            <span className="sr-only">Search habits</span>
            <input
              aria-label="Search habits"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search your rhythm..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </label>
          <div
            className="flex justify-between text-[10px] text-muted-foreground"
            aria-live="polite"
          >
            <span>Raw Search Input: {searchInput || "none"}</span>
            <span>Debounced Filter Query: {debouncedQuery || "none"}</span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              {activeTab === "All" ? "Today's habits" : activeTab}
            </h2>
            <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-accent-foreground">
              {filteredHabits.length}
            </span>
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}
          {loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading your rhythm...
            </p>
          ) : filteredHabits.length ? (
            filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                busy={actionLoading === `log:${habit.id}`}
                onPositive={() => void logHabit(habit.id, "positive")}
                onNegative={() => void logHabit(habit.id, "negative")}
                onEdit={() => {
                  setEditingHabit(habit)
                  setDialogOpen(true)
                }}
                onDelete={() => void deleteHabit(habit.id)}
              />
            ))
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
              <Flame className="mb-3 size-9 text-primary/60" />
              <p className="text-sm font-semibold">
                {activeTab === "All" || activeTab === "Habits"
                  ? "No habits yet"
                  : `No ${activeTab.toLowerCase()} yet`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {debouncedQuery
                  ? "Nothing matches that search yet."
                  : `Create a ${activeTab === "All" ? "habit" : activeTab.slice(0, -1).toLowerCase()} to start building your rhythm.`}
              </p>
            </div>
          )}
        </section>
        <footer className="flex items-center justify-center gap-3 border-t border-border/70 px-5 py-4 text-[11px] text-muted-foreground">
          <span>Theme</span>
          {themeOptions.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "rounded-full px-2 py-1",
                theme === value
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "hover:bg-muted"
              )}
              aria-label={`${label} theme`}
            >
              {label}
            </button>
          ))}
        </footer>
      </div>
      <TaskDialog
        key={`${dialogOpen}-${editingHabit?.id ?? "new"}`}
        open={dialogOpen}
        task={editingHabit}
        onClose={() => {
          setDialogOpen(false)
          setEditingHabit(null)
        }}
        onSubmit={saveTask}
      />
    </main>
  )
}
