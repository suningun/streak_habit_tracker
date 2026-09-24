import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/lib/theme-provider"
import { Dashboard } from "@/pages/Dashboard"

const mockHabits = [
  {
    id: "habit-1",
    user_id: "user-123",
    title: "Morning Meditation",
    description: null,
    type: "habit",
    priority: "high",
    target_count: 1,
    schedule_type: "daily",
    schedule_interval: null,
    due_date: null,
    position: 0,
    created_at: new Date().toISOString(),
    habit_logs: [
      {
        id: "log-1",
        task_id: "habit-1",
        user_id: "user-123",
        log_type: "positive",
        logged_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "habit-2",
    user_id: "user-123",
    title: "Read 20 pages",
    description: null,
    type: "habit",
    priority: "medium",
    target_count: 2,
    schedule_type: "daily",
    schedule_interval: null,
    due_date: null,
    position: 1,
    created_at: new Date().toISOString(),
    habit_logs: [],
  },
]

// Mock supabase client
vi.mock("@/lib/supabase", () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: "user-123", email: "alex@example.com" },
            },
          },
          error: null,
        }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signOut: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(), // 👈 ADDED THIS METHOD TO FIX THE CHAIN
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockHabits, error: null }),
          data: mockHabits,
          error: null,
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "habit-3",
                user_id: "user-123",
                title: "Evening Yoga",
                type: "habit",
                priority: "medium",
                target_count: 1,
                schedule_type: "daily",
                schedule_interval: null,
                due_date: null,
                position: 2,
                created_at: new Date().toISOString(),
                habit_logs: [],
              },
              error: null,
            }),
          }),
        }),
      })),
    },
  }
})

describe("Dashboard Page", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("renders greetings, habit cards, and pending count", async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("alex")).toBeInTheDocument()
    expect(await screen.findByText("Morning Meditation")).toBeInTheDocument()
    expect(screen.getByText("Read 20 pages")).toBeInTheDocument()
    // Morning Meditation is completed (1/1), Read 20 pages is 0/2, so 1 habit pending
    expect(screen.getByText("1 habit to keep moving")).toBeInTheDocument()
  })

  it("filters habits when searching", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("Morning Meditation")).toBeInTheDocument()

    const searchInput = screen.getByLabelText("Search habits")
    await user.type(searchInput, "YogaNonexistent")

    await waitFor(() => {
      expect(screen.queryByText("Morning Meditation")).not.toBeInTheDocument()
      expect(screen.getByText("Nothing matches that search yet.")).toBeInTheDocument()
    })
  })

  it("allows switching tabs to Dailies and displays placeholder state", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(await screen.findByText("Morning Meditation")).toBeInTheDocument()

    const dailiesTab = screen.getByRole("button", { name: "Dailies" })
    await user.click(dailiesTab)

    expect(screen.getByText("Create a dailie to start building your rhythm.")).toBeInTheDocument();
  })
})