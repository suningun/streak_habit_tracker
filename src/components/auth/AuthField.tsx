import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export type AuthFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: "email" | "password"
  autoComplete?: string
  hint?: string
  error?: string | null
  required?: boolean
  disabled?: boolean
}

export function AuthField({
  label,
  value,
  onChange,
  type = "email",
  autoComplete,
  hint,
  error,
  required = true,
  disabled = false,
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword && visible ? "text" : type
  const fieldId = `auth-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`

  return (
    <div className="block space-y-1.5 text-sm font-medium">
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <span className="relative block">
        <input
          id={fieldId}
          aria-invalid={Boolean(error)}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        {isPassword && (
          <button
            type="button"
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            onClick={() => setVisible((current) => !current)}
            className="absolute inset-y-0 right-2 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </span>
      {error ? (
        <span
          role="alert"
          className="block text-xs font-normal text-destructive"
        >
          {error}
        </span>
      ) : hint ? (
        <span className="block text-xs font-normal text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
