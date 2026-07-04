"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    if (items.length < 2) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length)
    }, interval)
    return () => clearInterval(id)
  }, [items.length, interval])

  return (
    <div
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
            className={cn(
              "text-center font-extrabold uppercase tracking-wide transition-all duration-500",
              i === active
                ? "text-2xl text-white sm:text-3xl md:text-4xl"
                : "text-lg text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.5)] sm:text-xl md:text-2xl"
            )}
          >
            {item.label}
          </p>
        ))}
      </div>
    </div>
  )
}
