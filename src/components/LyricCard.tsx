import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react'
import { motion, PanInfo, useIsPresent } from 'framer-motion'
import type { Song } from '../types/music'
import { parseLrc, findLineIndex, formatTime } from '../utils/lrc'

interface LyricCardProps {
  song: Song
  onNext: () => void
  onPrev: () => void
  onClose: () => void
  direction: number
}

const SWIPE_OFFSET_THRESHOLD = 80
const SWIPE_VELOCITY_THRESHOLD = 500
const AXIS_LOCK_THRESHOLD = 10
const SEEK_SENSITIVITY = 50

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.95
  })
}

export const LyricCard = ({ song, onNext, onPrev, onClose, direction }: LyricCardProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [lyricsOffsetY, setLyricsOffsetY] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [displayTimeMs, setDisplayTimeMs] = useState(0)
  const dragAxisRef = useRef<'x' | 'y' | null>(null)
  const lyricsViewportRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Array<HTMLDivElement | null>>([])
  const lyricsOffsetYRef = useRef(0)
  const activeIndexRef = useRef(-1)
  const displayedSecondRef = useRef(-1)
  const startTimeRef = useRef(Date.now())
  const currentTimeRef = useRef(0)
  const isPresent = useIsPresent()

  const lrc = useMemo(() => parseLrc(song.lyricRaw), [song.lyricRaw])
  const durationMs = (song.durationSec || 300) * 1000
  const scrollIndex = lrc.lines.length === 0 ? -1 : Math.max(0, activeIndex)

  const updateActiveIndex = useCallback((next: number) => {
    if (next === activeIndexRef.current) return
    activeIndexRef.current = next
    setActiveIndex(next)
  }, [])

  const updateDisplayTime = useCallback((nextMs: number) => {
    const nextSecond = Math.floor(nextMs / 1000)
    if (nextSecond === displayedSecondRef.current) return
    displayedSecondRef.current = nextSecond
    setDisplayTimeMs(nextMs)
  }, [])

  useEffect(() => {
    if (!isPresent || isDragging) return
    let rafId: number
    const tick = () => {
      const elapsed = Math.min(durationMs, Date.now() - startTimeRef.current)
      currentTimeRef.current = elapsed
      updateDisplayTime(elapsed)
      updateActiveIndex(findLineIndex(lrc.lines, elapsed))

      if (elapsed < durationMs) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isPresent, isDragging, durationMs, lrc.lines, updateActiveIndex, updateDisplayTime])

  useLayoutEffect(() => {
    if (scrollIndex < 0) return
    const viewport = lyricsViewportRef.current
    const lineEl = lineRefs.current[scrollIndex]
    if (!viewport || !lineEl) return

    const viewportRect = viewport.getBoundingClientRect()
    const lineRect = lineEl.getBoundingClientRect()
    const viewportCenterY = viewportRect.top + viewportRect.height / 2
    const lineCenterY = lineRect.top + lineRect.height / 2
    const delta = viewportCenterY - lineCenterY

    const nextOffset = lyricsOffsetYRef.current + delta
    lyricsOffsetYRef.current = nextOffset
    setLyricsOffsetY(nextOffset)
  }, [scrollIndex])

  const handlePanStart = useCallback(() => {
    setIsDragging(true)
    dragAxisRef.current = null
  }, [])

  const handlePan = useCallback((_: unknown, info: PanInfo) => {
    if (!dragAxisRef.current) {
      const absX = Math.abs(info.offset.x)
      const absY = Math.abs(info.offset.y)
      if (absX < AXIS_LOCK_THRESHOLD && absY < AXIS_LOCK_THRESHOLD) return
      dragAxisRef.current = absX > absY ? 'x' : 'y'
    }

    if (dragAxisRef.current === 'y') {
      const next = Math.max(0, Math.min(durationMs, currentTimeRef.current - info.delta.y * SEEK_SENSITIVITY))
      currentTimeRef.current = next
      startTimeRef.current = Date.now() - next
      updateDisplayTime(next)
      updateActiveIndex(findLineIndex(lrc.lines, next))
    }
  }, [durationMs, lrc.lines, updateActiveIndex, updateDisplayTime])

  const handlePanEnd = useCallback((_: unknown, info: PanInfo) => {
    setIsDragging(false)
    if (dragAxisRef.current === 'x') {
      const offsetX = info.offset.x
      const velocityX = info.velocity.x
      if (offsetX > SWIPE_OFFSET_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD) onPrev()
      else if (offsetX < -SWIPE_OFFSET_THRESHOLD || velocityX < -SWIPE_VELOCITY_THRESHOLD) onNext()
    }
    dragAxisRef.current = null
    startTimeRef.current = Date.now() - currentTimeRef.current
  }, [onNext, onPrev])

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 flex items-center justify-center p-6"
      style={{ touchAction: 'none' }}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
    >
      <div className="relative w-full h-full max-w-sm">
        {/* Card Shadow */}
        <div className="absolute inset-0 rounded-2xl bg-ink-900/8 dark:bg-ink-100/5 translate-x-1.5 translate-y-1.5" />

        {/* Main Card */}
        <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden bg-[var(--bg-paper)] shadow-lg ring-1 ring-ink-200/30 dark:ring-ink-100/15 flex flex-col transition-colors duration-500">
          {/* Paper Texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`
            }}
          />

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-ink-200/30 dark:border-ink-700/30">
            <button onClick={onClose} className="text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors font-serif">
              ← 返回
            </button>
            <span className="text-ink-400 dark:text-ink-500 text-xs font-serif">{formatTime(displayTimeMs)}</span>
          </header>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center pt-4 pb-3 px-5 overflow-hidden">
            <h2 className="text-lg font-serif font-bold text-ink-900 dark:text-ink-100 text-center">{song.name}</h2>
            <p className="text-sm text-ink-500 dark:text-ink-400 font-serif mt-1">{song.artistName} · {song.albumName}</p>

            <div ref={lyricsViewportRef} className="relative flex-1 w-full mt-4 overflow-hidden">
              <motion.div
                animate={{ y: lyricsOffsetY }}
                transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                className="will-change-transform"
              >
                <div className="h-[35vh]" />
                {lrc.lines.length > 0 ? (
                  lrc.lines.map((line, i) => (
                    <div
                      key={`${line.timeMs}-${i}`}
                      ref={(el) => { lineRefs.current[i] = el }}
                      className={`py-2.5 text-center font-serif transition-all duration-300 ${
                        i === activeIndex
                          ? 'text-[var(--ink-red)] dark:text-ink-100 text-xl font-semibold scale-105'
                          : 'text-ink-400 dark:text-ink-500 text-base'
                      }`}
                    >
                      {line.text}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-ink-400 dark:text-ink-500 font-serif">暂无歌词</div>
                )}
                <div className="h-[35vh]" />
              </motion.div>
            </div>
          </div>

          {/* Footer - Just Hint */}
          <footer className="relative z-10 px-4 py-3 border-t border-ink-200/30 dark:border-ink-700/30">
            <p className="text-center text-xs text-ink-400 dark:text-ink-500 font-serif">
              ← 左右滑动切歌 →
            </p>
          </footer>
        </div>
      </div>
    </motion.div>
  )
}
