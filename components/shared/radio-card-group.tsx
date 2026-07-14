"use client"

import { useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type RadioCardGroupProps = {
  label: ReactNode
  required?: boolean
  error?: string
  className?: string
  itemsClassName?: string
  children: ReactNode
}

/**
 * Wraps a set of mutually-exclusive <OptionCard role="radio" .../> items in
 * role="radiogroup" with an accessible group label, since native <input type="radio">
 * isn't used for these card-style pickers.
 */
export function RadioCardGroup({ label, required, error, className, itemsClassName, children }: RadioCardGroupProps) {
  const labelId = useId()

  return (
    <div className={cn("space-y-2", className)}>
      <span id={labelId} className="flex items-center gap-2 text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", itemsClassName)}
      >
        {children}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
