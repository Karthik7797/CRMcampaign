import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 up to `target` over `duration` ms with an ease-out
 * curve. Respects prefers-reduced-motion (snaps straight to the target) and
 * cleans up its rAF loop on unmount or when the target changes.
 *
 * Returns the current display value — render it directly.
 */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  const frame = useRef<number>()
  const startVal = useRef(0)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || !Number.isFinite(target)) {
      setValue(target)
      return
    }

    const from = startVal.current
    let startTs: number | null = null

    const tick = (ts: number) => {
      if (startTs === null) startTs = ts
      const progress = Math.min((ts - startTs) / duration, 1)
      // ease-out cubic — fast then settles, matching the skill's easing guidance
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (target - from) * eased
      setValue(current)
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        startVal.current = target
      }
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, duration])

  return value
}
