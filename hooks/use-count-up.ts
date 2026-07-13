import { useEffect, useState } from "react"

export function useCountUp(target: string, duration = 1200) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const num = Number(target)
    if (!Number.isFinite(num)) return

    let raf = 0
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * num))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}
