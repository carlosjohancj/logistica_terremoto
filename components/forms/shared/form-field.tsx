"use client"

import { useId, type ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type FormFieldControlProps = {
  id: string
  "aria-invalid": boolean
  "aria-describedby": string | undefined
  "aria-required": boolean | undefined
}

type FormFieldProps = {
  label: ReactNode
  error?: string
  required?: boolean
  hint?: string
  className?: string
  /** Visually hide the label (still readable by screen readers) when a heading elsewhere already labels the field. */
  hideLabel?: boolean
  children: (field: FormFieldControlProps) => ReactNode
}

/**
 * Wraps a Label + control + error message, wiring up id/aria-invalid/aria-describedby
 * so screen readers announce validation errors and required state correctly.
 */
export function FormField({ label, error, required, hint, className, hideLabel, children }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn(hideLabel && "sr-only")}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children({
        id,
        "aria-invalid": !!error,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
