import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { TaskDialog, type TaskType } from "@/components/tracker/TaskDialog"

type TaskValues = {
  type: TaskType
  title: string
  target_count: number
  schedule_type: string
  priority: "low" | "medium" | "high"
  due_date: string | null
}

function renderDialog(
  onSubmit = vi.fn<(values: TaskValues) => Promise<void> | void>()
) {
  return render(<TaskDialog open onClose={vi.fn()} onSubmit={onSubmit} />)
}

describe("TaskDialog", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the labeled habit form", () => {
    renderDialog()
    expect(screen.getByLabelText("Habit Title")).toBeInTheDocument()
    expect(screen.getByLabelText("Target taps")).toBeInTheDocument()
  })

  it("submits typed habit values", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn<(values: TaskValues) => void>()
    renderDialog(onSubmit)

    await user.type(
      screen.getByLabelText("Habit Title"),
      "Read for ten minutes"
    )
    await user.click(screen.getByRole("button", { name: "Create task" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Read for ten minutes",
        type: "habit",
      })
    )
  })

  it("allows creating a daily task type", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn<(values: TaskValues) => Promise<void> | void>()
    renderDialog(onSubmit)

    await user.selectOptions(screen.getByLabelText("Type"), "daily")
    await user.type(screen.getByLabelText("Habit Title"), "Drink water")
    await user.click(screen.getByRole("button", { name: "Create task" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Drink water",
        type: "daily",
      })
    )
  })

  it("shows a validation error for an empty title", async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole("button", { name: "Create task" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Title is required"
    )
  })

  it("waits for an async confirmation and removes the modal", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [open, setOpen] = useState(true)
      const [saved, setSaved] = useState(false)
      return (
        <>
          <TaskDialog
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={async () => {
              await Promise.resolve()
              setSaved(true)
              setOpen(false)
            }}
          />
          {saved && <p>Habit saved</p>}
        </>
      )
    }

    render(<Harness />)
    await user.type(screen.getByLabelText("Habit Title"), "Walk outside")
    await user.click(screen.getByRole("button", { name: "Create task" }))

    expect(await screen.findByText("Habit saved")).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
