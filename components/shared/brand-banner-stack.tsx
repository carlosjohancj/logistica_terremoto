"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export type BrandBannerItem = {
  /** Background photo — expected to already be color-tinted and faded left-to-right. */
  image: string
  alt?: string
  imagePosition?: string
  title: string
  subtitle: ReactNode
}

type BrandBannerStackProps = {
  items: BrandBannerItem[]
  brandStart?: string
  brandHighlight?: string
  className?: string
}

export function BannerHighlight({ children }: { children: ReactNode }) {
  return <span className="text-emerald-300 font-semibold">{children}</span>
}

function BannerCard({
  item,
  index,
  brandStart,
  brandHighlight,
}: {
  item: BrandBannerItem
  index: number
  brandStart: string
  brandHighlight: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-64 overflow-hidden rounded-2xl shadow-lg transition-all duration-700 ease-out sm:h-72",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
      style={{ transitionDelay: visible ? `${index * 120}ms` : "0ms" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.alt ?? item.title}
        className="absolute inset-0 h-full w-full object-cover"
        style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
      />

      <div className="relative flex h-full flex-col justify-center gap-3 px-6 py-8 sm:px-10">
        <div className="flex items-center gap-1.5 pb-4 border-b border-white/20">
          <span className="text-sm font-extrabold tracking-wide text-white">
            {brandStart}
          </span>
          <span className="text-sm font-extrabold tracking-wide text-emerald-400">
            {brandHighlight}
          </span>
        </div>
        <h3 className="text-2xl font-extrabold uppercase text-white sm:text-4xl">
          {item.title}
        </h3>
        <p className="text-base leading-snug text-white/90 sm:text-lg">
          {item.subtitle}
        </p>
      </div>
    </div>
  )
}

export function BrandBannerStack({
  items,
  brandStart = "DESDE",
  brandHighlight = "CERO",
  className,
}: BrandBannerStackProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {items.map((item, i) => (
        <BannerCard
          key={i}
          item={item}
          index={i}
          brandStart={brandStart}
          brandHighlight={brandHighlight}
        />
      ))}
    </div>
  )
}
