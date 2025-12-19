import { useState, useEffect, useRef, useCallback } from 'react'

export function useBreathingAnimation(items: { id: string }[], count = 2, breathDuration = 6000) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set())
  const recentlyActiveRef = useRef<Set<string>>(new Set())
  const intervalRef = useRef<number | null>(null)
  const timeoutsRef = useRef<Set<number>>(new Set())

  const selectNextMountain = useCallback(() => {
    if (!items || items.length === 0) return

    const available = items.filter((item) => !recentlyActiveRef.current.has(item.id))
    const pool = available.length > 0 ? available : items

    const selected = pool[Math.floor(Math.random() * pool.length)]

    recentlyActiveRef.current.add(selected.id)
    if (recentlyActiveRef.current.size > Math.min(count + 1, items.length - 1)) {
      const first = recentlyActiveRef.current.values().next().value
      if (first) recentlyActiveRef.current.delete(first)
    }

    setActiveIds((prev) => new Set([...prev, selected.id]))

    const timeoutId = window.setTimeout(() => {
      timeoutsRef.current.delete(timeoutId)
      setActiveIds((prev) => {
        const next = new Set(prev)
        next.delete(selected.id)
        return next
      })
    }, breathDuration)
    timeoutsRef.current.add(timeoutId)
  }, [items, count, breathDuration])

  useEffect(() => {
    setActiveIds(new Set())
    recentlyActiveRef.current = new Set()

    if (!items || items.length === 0) return

    const staggerDelay = breathDuration / (count + 1)

    for (let i = 0; i < count; i++) {
      const timeoutId = window.setTimeout(() => {
        timeoutsRef.current.delete(timeoutId)
        selectNextMountain()
      }, i * staggerDelay)
      timeoutsRef.current.add(timeoutId)
    }

    intervalRef.current = window.setInterval(selectNextMountain, staggerDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      for (const timeoutId of timeoutsRef.current) window.clearTimeout(timeoutId)
      timeoutsRef.current.clear()
    }
  }, [items, count, breathDuration, selectNextMountain])

  return activeIds
}
