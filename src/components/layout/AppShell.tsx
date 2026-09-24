import {
  Check,
  CheckCircle2,
  CircleUserRound,
  Cloud,
  Flame,
  LoaderCircle,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  Tags,
  Trash2,
  WifiOff,
} from "lucide-react"
import { useEffect, useState } from "react"

import { useAuth } from "@/context/AuthContext"
import { useHabits } from "@/hooks/useHabits"
import { useTheme, type Theme } from "@/lib/theme-provider"
import { cn } from "@/lib/utils"

const tabs = ["All", "Habits", "Dailies", "To-dos"] as const
const tags = ["Morning", "Health", "Focus", "Home", "Personal"]

export function AppShell() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const {
    habits,
    loading,
    actionLoading,
    error,
    addHabit,
    deleteHabit,
    logHabit,
  } = useHabits()
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [menuOpen, setMenuOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [newHabitTitle, setNewHabitTitle] = useState("")
  const [newHabitType, setNewHabitType] = useState<"habit" | "daily" | "todo">(
    "habit"
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Sun },
  ]

  const visibleHabits = habits.filter((habit) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : activeTab === "Habits"
          ? habit.type === "habit"
          : activeTab === "Dailies"
            ? habit.type === "daily"
            : habit.type === "todo"
    const matchesQuery = habit.title.toLowerCase().includes(query.toLowerCase())
    return matchesTab && matchesQuery
  })

  async function handleAddHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newHabitTitle.trim()) {
      return
    }
    const habit = await addHabit(newHabitTitle, 1, {
      type: newHabitType,
    })
    if (habit) {
      setNewHabitTitle("")
      setNewHabitType("habit")
      setComposerOpen(false)
    }
  }

  return (
    <main className="min-h-svh bg-background px-3 py-4 text-foreground sm:px-5 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] max-w-[480px] min-w-[296px] flex-col rounded-[2rem] border border-border/80 bg-background shadow-[0_20px_60px_-36px_rgba(99,46,30,0.4)] sm:min-h-[calc(100svh-4rem)]">
        <header className="relative flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Flame className="size-5 fill-current" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-heading text-lg font-semibold tracking-tight">
                Streaks
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground">
                Small steps, kept daily.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground">
              {isOnline ? (
                <Cloud className="size-3.5 text-primary" />
              ) : (
                <WifiOff className="size-3.5 text-muted-foreground" />
              )}
              {isOnline ? "Synced" : "Offline"}
            </span>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label="Open profile and theme menu"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <CircleUserRound className="size-5" />
            </button>
          </div>

          {menuOpen && (
            <div className="absolute top-16 right-5 z-10 w-44 rounded-2xl border border-border bg-popover p-1.5 shadow-xl shadow-primary/10">
              <p className="px-2.5 pt-2 pb-1.5 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                Appearance
              </p>
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium hover:bg-muted"
                  onClick={() => {
                    setTheme(value)
                    setMenuOpen(false)
                  }}
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  <span className="flex-1">{label}</span>
                  {theme === value && (
                    <Check className="size-3.5 text-primary" />
                  )}
                </button>
              ))}
              <button
                type="button"
                className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-border px-2.5 pt-2.5 pb-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => void signOut()}
              >
                <LogOut className="size-3.5" />
                <span>Sign out{user?.email ? ` (${user.email})` : ""}</span>
              </button>
            </div>
          )}
        </header>
        <nav
          className="border-y border-border/70 px-4 py-3"
          aria-label="Task filters"
        >
          <div className="flex gap-1 rounded-xl bg-muted/70 p-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                aria-current={activeTab === tab ? "page" : undefined}
                className={cn(
                  "flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
                  activeTab === tab
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>
        <section
          className="space-y-3 px-4 pt-4 pb-5"
          aria-label="Search and tag filters"
        >
          <label className="flex h-11 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 text-muted-foreground focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Search className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your rhythm..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              type="search"
              aria-label="Search tasks"
            />
            <kbd className="hidden rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline">
              ⌘ K
            </kbd>
          </label>

          <div className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            <Tags
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {tags.map((tag) => (
              <button
                type="button"
                key={tag}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTag === tag
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
                onClick={() =>
                  setActiveTag((current) => (current === tag ? null : tag))
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
        <section className="flex flex-1 flex-col px-4 pb-8 text-left">
          <div className="flex items-center justify-between pb-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                Today
              </p>
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                Keep your rhythm
              </h2>
            </div>
            <button
              type="button"
              aria-label="Add a habit"
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/85"
              onClick={() => setComposerOpen((open) => !open)}
            >
              <Plus className="size-5" />
            </button>
          </div>

          {composerOpen && (
            <form
              className="mb-3 flex flex-col gap-2 rounded-2xl border border-primary/30 bg-accent/50 p-2"
              onSubmit={handleAddHabit}
            >
              <div className="flex gap-2">
                <select
                  value={newHabitType}
                  onChange={(event) =>
                    setNewHabitType(
                      event.target.value as "habit" | "daily" | "todo"
                    )
                  }
                  className="h-10 rounded-xl border border-border bg-card px-2 text-xs outline-none focus:border-primary"
                  aria-label="Task type"
                >
                  <option value="habit">Habit</option>
                  <option value="daily">Daily</option>
                  <option value="todo">To-do</option>
                </select>
                <input
                  autoFocus
                  value={newHabitTitle}
                  onChange={(event) => setNewHabitTitle(event.target.value)}
                  placeholder="Name a task..."
                  className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  aria-label="New habit name"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                disabled={actionLoading === "add"}
              >
                {actionLoading === "add" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </button>
            </form>
          )}

          {error && (
            <p
              role="alert"
              className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              <LoaderCircle className="mr-2 size-4 animate-spin" /> Loading
              habits...
            </div>
          ) : visibleHabits.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 pb-8 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-accent text-primary">
                <Flame className="size-8" aria-hidden="true" />
              </div>
              <p className="font-heading text-base font-semibold">
                A clear space for your next streak
              </p>
              <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {query || activeTag
                  ? `Nothing matches your ${activeTag ?? "search"} just yet.`
                  : "Add one small habit to begin."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleHabits.map((habit) => {
                const today = new Date().toDateString()
                const todayLogs = habit.habit_logs.filter(
                  (log) => new Date(log.logged_at).toDateString() === today
                )
                const score = todayLogs.reduce(
                  (total, log) =>
                    total + (log.log_type === "positive" ? 1 : -1),
                  0
                )
                return (
                  <article
                    key={habit.id}
                    className="rounded-2xl border border-border bg-card p-3.5 shadow-sm shadow-primary/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {habit.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {score > 0
                            ? `${score} completed today`
                            : "Ready when you are"}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete ${habit.title}`}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={actionLoading === `delete:${habit.id}`}
                        onClick={() => void deleteHabit(habit.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                        disabled={actionLoading === `log:${habit.id}`}
                        onClick={() => void logHabit(habit.id, "positive")}
                      >
                        + Done
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
                        disabled={actionLoading === `log:${habit.id}`}
                        onClick={() => void logHabit(habit.id, "negative")}
                      >
                        - Skip
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
        <footer className="border-t border-border/70 px-5 py-4 text-center text-[11px] font-medium text-muted-foreground">
          Your progress stays yours.
        </footer>
      </div>
    </main>
  )
}
