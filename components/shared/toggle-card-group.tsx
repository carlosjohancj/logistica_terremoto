"use client"

import { useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type ToggleCardGroupProps = {
  label: ReactNode
  className?: string
  itemsClassName?: string
  children: ReactNode
}

/**
 * Wraps a set of independently-toggleable <OptionCard .../> items (aria-pressed)
 * in role="group" with an accessible group label, e.g. amenities checklists.
 */
export function ToggleCardGroup({ label, className, itemsClassName, children }: ToggleCardGroupProps) {
  const labelId = useId()

  return (
    <div className={cn("space-y-2", className)}>
      <span id={labelId} className="flex items-center gap-2 text-sm font-medium">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className={cn("flex flex-wrap gap-2", itemsClassName)}
      >
        {children}
      </div>
    </div>
  )
}
