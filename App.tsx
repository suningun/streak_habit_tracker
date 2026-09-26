import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Real application logic, shared with the web build. streaks-engine is pure date
// arithmetic with no DOM dependency, so it runs unmodified under Hermes.
//
// Imported relatively rather than via "@/": this file sits at the repo root and
// is not a member of any referenced tsconfig project, so editors may typecheck
// it with an inferred project that has no "paths" mapping. A relative specifier
// resolves under any config, any moduleResolution, and Metro natively.
import { calculateDailyStreak, calculateHabitStrength } from './src/lib/streaks-engine'
import type { HabitStrength } from './src/lib/streaks-engine'
import { validateEmail } from './src/lib/auth-validation'

// Declared locally rather than imported from @/hooks/useHabits: that module
// imports @/lib/supabase, which reads import.meta.env and cannot run under
// Hermes. The shape is structural, so the engine accepts it either way.
type HabitLogType = 'positive' | 'negative'
type HabitLog = {
  id: string
  task_id: string
  user_id: string
  log_type: HabitLogType
  logged_at: string
}
type Habit = {
  id: string
  title: string
  position: number
  habit_logs: HabitLog[]
}

const STORAGE_KEY = 'rhythm.habits.v1'

const STRENGTH_META: Record<HabitStrength, { label: string; color: string }> = {
  strong: { label: 'Strong', color: '#1f9d55' },
  steady: { label: 'Steady', color: '#b45309' },
  slipping: { label: 'Slipping', color: '#c2410c' },
}

function daysAgo(n: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - n)
  return date.toISOString()
}

function seedHabits(): Habit[] {
  return [
    {
      id: 'habit-1',
      title: 'Morning Meditation',
      position: 0,
      // 4-day streak plus scattered history, so the engine has real work to do.
      habit_logs: [0, 1, 2, 3, 5, 6, 9].map((offset, index) => ({
        id: `log-1-${index}`,
        task_id: 'habit-1',
        user_id: 'local',
        log_type: 'positive' as const,
        logged_at: daysAgo(offset),
      })),
    },
    {
      id: 'habit-2',
      title: 'Read 20 pages',
      position: 1,
      habit_logs: [0, 2, 3, 4, 5, 6, 7, 8].map((offset, index) => ({
        id: `log-2-${index}`,
        task_id: 'habit-2',
        user_id: 'local',
        log_type: 'positive' as const,
        logged_at: daysAgo(offset),
      })),
    },
    {
      id: 'habit-3',
      title: 'Evening Yoga',
      position: 2,
      habit_logs: [0, 1].map((offset, index) => ({
        id: `log-3-${index}`,
        task_id: 'habit-3',
        user_id: 'local',
        log_type: 'positive' as const,
        logged_at: daysAgo(offset),
      })),
    },
  ]
}

function isLoggedToday(habit: Habit) {
  const today = new Date().toDateString()
  return habit.habit_logs.some(
    (log) => log.log_type === 'positive' && new Date(log.logged_at).toDateString() === today,
  )
}

function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSaved, setEmailSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (cancelled) return
        if (raw) {
          const parsed = JSON.parse(raw) as Habit[]
          setHabits(Array.isArray(parsed) && parsed.length > 0 ? parsed : seedHabits())
        } else {
          setHabits(seedHabits())
        }
      } catch {
        if (!cancelled) setHabits(seedHabits())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback(async (next: Habit[]) => {
    setHabits(next)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Persistence is best-effort; the in-memory state stays authoritative.
    }
  }, [])

  const toggleToday = useCallback(
    (habit: Habit) => {
      const now = new Date().toISOString()
      const next = habits.map((candidate) => {
        if (candidate.id !== habit.id) return candidate
        if (isLoggedToday(candidate)) {
          return {
            ...candidate,
            habit_logs: candidate.habit_logs.filter((log) => log.id !== `today-${candidate.id}`),
          }
        }
        return {
          ...candidate,
          habit_logs: [
            ...candidate.habit_logs,
            {
              id: `today-${candidate.id}`,
              task_id: candidate.id,
              user_id: 'local',
              log_type: 'positive' as const,
              logged_at: now,
            },
          ],
        }
      })
      void persist(next)
    },
    [habits, persist],
  )

  const saveEmail = useCallback(() => {
    const message = validateEmail(email)
    setEmailError(message)
    setEmailSaved(message === null)
  }, [email])

  const summary = useMemo(() => {
    const done = habits.filter(isLoggedToday).length
    return `${done} of ${habits.length} done today`
  }, [habits])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#111827" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Rhythm Habit Tracker</Text>
            <Text style={styles.subtitle}>{summary}</Text>

            <View style={styles.emailRow}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(value) => {
                  setEmail(value)
                  setEmailError(null)
                  setEmailSaved(false)
                }}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel="Email address"
              />
              <Pressable
                style={styles.secondaryButton}
                onPress={saveEmail}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>Save</Text>
              </Pressable>
            </View>
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            {emailSaved ? <Text style={styles.success}>Profile saved.</Text> : null}
          </View>
        }
        renderItem={({ item }) => {
          const strength = calculateHabitStrength(item.habit_logs)
          const streak = calculateDailyStreak(item.habit_logs)
          const done = isLoggedToday(item)
          const meta = STRENGTH_META[strength]

          return (
            <Pressable
              style={[styles.card, done && styles.cardDone]}
              onPress={() => toggleToday(item)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={item.title}
            >
              <View style={styles.cardBody}>
                <Text style={styles.habitTitle}>{item.title}</Text>
                <Text style={[styles.badge, { color: meta.color, borderColor: meta.color }]}>
                  {meta.label}
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.streak}>
                  {streak === 0 ? 'No streak' : `${streak} day${streak === 1 ? '' : 's'}`}
                </Text>
                <Text style={styles.check}>{done ? 'Logged today' : 'Tap to log'}</Text>
              </View>
            </Pressable>
          )
        }}
      />
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitTracker />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  emailRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
  },
  secondaryButton: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  secondaryButtonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#b91c1c', fontSize: 13, marginTop: 6 },
  success: { color: '#1f9d55', fontSize: 13, marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDone: { borderColor: '#1f9d55', backgroundColor: '#f0fdf4' },
  cardBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  habitTitle: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
  badge: { fontSize: 12, fontWeight: '700', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  streak: { fontSize: 14, fontWeight: '600', color: '#f97316' },
  check: { fontSize: 13, color: '#6b7280' },
})
