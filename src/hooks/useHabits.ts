import { useCallback, useEffect, useState } from "react"

import { useAuth } from "@/context/AuthContext"
import type { HabitLog, HabitLogType } from "@/lib/habit-types"
import { supabase } from "@/lib/supabase"

export type { HabitLog, HabitLogType }

export type Habit = {
  id: string
  user_id: string
  title: string
  description: string | null
  type: "habit" | "daily" | "todo"
  priority: "low" | "medium" | "high"
  target_count: number
  schedule_type: string
  schedule_interval: number | null
  due_date: string | null
  position: number
  created_at: string
  habit_logs: HabitLog[]
}

export type HabitUpdates = Partial<
  Pick<
    Habit,
    | "title"
    | "description"
    | "type"
    | "priority"
    | "target_count"
    | "schedule_type"
    | "schedule_interval"
    | "due_date"
    | "position"
  >
>

type NewHabitOptions = {
  description?: string
  priority?: Habit["priority"]
  schedule_type?: string
  schedule_interval?: number | null
}

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from("tasks")
      .select("*, habit_logs(*)")
      .eq("user_id", user.id)
      .in("type", ["habit", "daily", "todo"])
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setHabits([])
    } else {
      setHabits((data ?? []) as Habit[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    const fetchTimeout = window.setTimeout(() => {
      void fetchHabits()
    }, 0)

    return () => window.clearTimeout(fetchTimeout)
  }, [fetchHabits])

  const addHabit = useCallback(
    async (
      title: string,
      target_count = 1,
      options: NewHabitOptions & { type?: Habit["type"] } = {}
    ) => {
      if (!user) {
        setError("You need to be signed in to add a habit.")
        return null
      }

      setActionLoading("add")
      setError(null)
      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: options.description ?? null,
          type: options.type ?? "habit",
          priority: options.priority ?? "medium",
          target_count,
          schedule_type: options.schedule_type ?? "daily",
          schedule_interval: options.schedule_interval ?? null,
          position: habits.length,
        })
        .select("*, habit_logs(*)")
        .single()

      setActionLoading(null)
      if (insertError) {
        setError(insertError.message)
        return null
      }

      const habit = data as Habit
      setHabits((current) => [...current, habit])
      return habit
    },
    [habits.length, user],
  )

  const editHabit = useCallback(
    async (id: string, updates: HabitUpdates) => {
      if (!user) {
        setError("You need to be signed in to edit a habit.")
        return false
      }

      setActionLoading(`edit:${id}`)
      setError(null)
      const { data, error: updateError } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*, habit_logs(*)")
        .single()

      setActionLoading(null)
      if (updateError) {
        setError(updateError.message)
        return false
      }

      setHabits((current) =>
        current.map((habit) => (habit.id === id ? (data as Habit) : habit)),
      )
      return true
    },
    [user],
  )

  const deleteHabit = useCallback(
    async (id: string) => {
      if (!user) {
        setError("You need to be signed in to delete a habit.")
        return false
      }

      setActionLoading(`delete:${id}`)
      setError(null)
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      setActionLoading(null)
      if (deleteError) {
        setError(deleteError.message)
        return false
      }

      setHabits((current) => current.filter((habit) => habit.id !== id))
      return true
    },
    [user],
  )

  const logHabit = useCallback(
    async (habit_id: string, log_type: HabitLogType) => {
      if (!user) {
        setError("You need to be signed in to log a habit.")
        return false
      }

      setActionLoading(`log:${habit_id}`)
      setError(null)
      const { data: ownedHabit, error: habitError } = await supabase
        .from("tasks")
        .select("id")
        .eq("id", habit_id)
        .eq("user_id", user.id)
        .single()

      if (habitError || !ownedHabit) {
        setError(habitError?.message ?? "That habit is not available.")
        setActionLoading(null)
        return false
      }

      const { data: log, error: logError } = await supabase
        .from("habit_logs")
        .insert({
          task_id: habit_id,
          user_id: user.id,
          log_type,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single()

      setActionLoading(null)
      if (logError) {
        setError(logError.message)
        return false
      }

      setHabits((current) =>
        current.map((habit) =>
          habit.id === habit_id
            ? { ...habit, habit_logs: [...habit.habit_logs, log as HabitLog] }
            : habit,
        ),
      )
      return true
    },
    [user],
  )

  return {
    habits,
    loading,
    actionLoading,
    error,
    refresh: fetchHabits,
    addHabit,
    editHabit,
    deleteHabit,
    logHabit,
  }
}
