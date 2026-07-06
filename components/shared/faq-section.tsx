"use client"

import { useState } from "react"
import { FaqCard } from "@/components/ui/faq-card"

export type FaqItem = {
  question: string
  answer: string
}

type FaqSectionProps = {
  title: string
  subtitle?: string
  items: FaqItem[]
}

export function FaqSection({ title, subtitle, items }: FaqSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(0)

  return (
    <section id="faq" className="scroll-mt-20 pt-4 pb-16 md:pt-6">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <FaqCard
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={activeIndex === index}
              onToggle={() => setActiveIndex(activeIndex === index ? undefined : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
