"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type FaqCardProps = {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

export function FaqCard({ question, answer, isOpen, onToggle }: FaqCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card px-5 py-4 shadow-sm transition-colors md:px-6 md:py-5",
        isOpen ? "border-primary/40" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-sm md:text-base">{question}</span>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
            isOpen ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}
        >
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  )
}
