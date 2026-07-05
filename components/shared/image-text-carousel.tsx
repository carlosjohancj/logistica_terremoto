"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type ImageTextCarouselItem = {
  image: string
  alt?: string
  label: string
}

type ImageTextCarouselProps = {
  items: ImageTextCarouselItem[]
  /** Milliseconds each slide stays active before advancing. */
  interval?: number
  className?: string
}

export function ImageTextCarousel({
  items,
  interval = 3500,
  className,
}: ImageTextCarouselProps) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (items.length < 2 || paused) return
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length)
    }, interval)
    return () => clearInterval(id)
  }, [items.length, interval, paused])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Presentación de imágenes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false)
      }}
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-2xl shadow-xl",
        className
      )}
    >
      {items.map((item, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={item.image}
          alt={item.alt ?? item.label}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4">
        {items.map((item, i) => (
          <p
            key={i}
            aria-hidden={i !== active}
            className={cn(
              "text-center font-extrabold uppercase tracking-wide transition-all duration-500",
              i === active
                ? "text-2xl text-white sm:text-3xl md:text-4xl"
                : "text-lg text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.6)] sm:text-xl md:text-2xl"
            )}
          >
            {item.label}
          </p>
        ))}
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={item.label}
              aria-current={i === active}
              className={cn(
                "h-2 w-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                i === active ? "w-5 bg-white" : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
