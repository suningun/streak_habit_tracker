import React, { useState } from "react"
import { ErrorBoundary } from "../common/ErrorBoundary"
import { AvatarUpload } from "@/components/tracker/AvatarUpload"

// Mock component designed to crash on command for testing
const BuggyComponent: React.FC<{ shouldCrash?: boolean }> = ({ shouldCrash }) => {
  if (shouldCrash) {
    throw new Error("Simulated component crash.")
  }
  return <div className="text-sm">Section loaded successfully.</div>
}

export const AppLayout: React.FC<{ userId: string }> = ({ userId }) => {
  const [crashHabits, setCrashHabits] = useState(false)

  return (
    <div className="min-h-screen p-6 space-y-6 bg-background text-foreground">
      {/* 1. Navigation Section */}
      <ErrorBoundary sectionName="Navigation Bar">
        <header className="flex justify-between items-center p-4 border rounded-lg bg-card">
          <h1 className="text-xl font-bold">Rhythm Tracker</h1>
          <AvatarUpload userId={userId} />
        </header>
      </ErrorBoundary>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. Habit List Section */}
        <section className="md:col-span-2 p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Habit List</h2>
            <button
              onClick={() => setCrashHabits(true)}
              className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded"
            >
              Simulate Habit Section Crash
            </button>
          </div>

          <ErrorBoundary sectionName="Habit List">
            <BuggyComponent shouldCrash={crashHabits} />
          </ErrorBoundary>
        </section>

        {/* 3. Stats Section */}
        <section className="p-4 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-4">Statistics</h2>
          <ErrorBoundary sectionName="Stats Overview">
            <BuggyComponent />
          </ErrorBoundary>
        </section>
      </div>
    </div>
  )
}