import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react'
import { motion, useIsPresent } from 'framer-motion'
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
const SWIPE_VELOCITY_THRESHOLD = 0.5
const AUTO_SCROLL_RESUME_DELAY = 3000

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
  const [activeIndex, setActiveIndex] = useState(-1)
  const [displayTimeMs, setDisplayTimeMs] = useState(0)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Array<HTMLDivElement | null>>([])
  const activeIndexRef = useRef(-1)
  const displayedSecondRef = useRef(-1)
  const startTimeRef = useRef(Date.now())
  const currentTimeRef = useRef(0)
  const userScrollTimeoutRef = useRef<number | null>(null)
  const isPresent = useIsPresent()
  const dragStartXRef = useRef(0)
  const dragStartYRef = useRef(0)
  const dragStartTimeRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isVerticalScrollRef = useRef(false)

  const lrc = useMemo(() => parseLrc(song.lyricRaw), [song.lyricRaw])
  const durationMs = (song.durationSec || 300) * 1000

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

  // Playback timer
  useEffect(() => {
    if (!isPresent) return
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
  }, [isPresent, durationMs, lrc.lines, updateActiveIndex, updateDisplayTime])

  // Auto-scroll to active line
  useLayoutEffect(() => {
    if (activeIndex < 0 || isUserScrolling) return
    const container = lyricsContainerRef.current
    const lineEl = lineRefs.current[activeIndex]
    if (!container || !lineEl) return

    const containerRect = container.getBoundingClientRect()
    const lineRect = lineEl.getBoundingClientRect()
    const containerCenterY = containerRect.height / 2
    const lineCenterY = lineRect.top - containerRect.top + lineRect.height / 2
    const scrollTarget = container.scrollTop + lineCenterY - containerCenterY

    container.scrollTo({ top: scrollTarget, behavior: 'smooth' })
  }, [activeIndex, isUserScrolling])

  // Handle user scroll - pause auto-scroll temporarily
  const handleScroll = useCallback(() => {
    if (!isUserScrolling) {
      setIsUserScrolling(true)
    }
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current)
    }
    userScrollTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false)
    }, AUTO_SCROLL_RESUME_DELAY)
  }, [isUserScrolling])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current)
      }
    }
  }, [])

  // Handle tap on lyric line to seek
  const handleLineClick = useCallback((index: number) => {
    const line = lrc.lines[index]
    if (!line) return

    currentTimeRef.current = line.timeMs
    startTimeRef.current = Date.now() - line.timeMs
    updateDisplayTime(line.timeMs)
    updateActiveIndex(index)
    setIsUserScrolling(false)
  }, [lrc.lines, updateActiveIndex, updateDisplayTime])

  // Horizontal swipe for song navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartXRef.current = e.touches[0].clientX
    dragStartYRef.current = e.touches[0].clientY
    dragStartTimeRef.current = Date.now()
    isDraggingRef.current = false
    isVerticalScrollRef.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - dragStartXRef.current)
    const deltaY = Math.abs(e.touches[0].clientY - dragStartYRef.current)

    // 判断滑动方向：如果垂直位移大于水平位移，认为是垂直滚动
    if (!isDraggingRef.current && !isVerticalScrollRef.current) {
      if (deltaY > deltaX && deltaY > 10) {
        isVerticalScrollRef.current = true
      } else if (deltaX > deltaY && deltaX > 20) {
        isDraggingRef.current = true
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // 如果是垂直滚动，不触发左右切歌
    if (isVerticalScrollRef.current) return

    const deltaX = e.changedTouches[0].clientX - dragStartXRef.current
    const deltaTime = Date.now() - dragStartTimeRef.current
    const velocity = Math.abs(deltaX) / deltaTime // px/ms

    // Trigger swipe if distance OR velocity threshold is met
    if (Math.abs(deltaX) > SWIPE_OFFSET_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      if (deltaX > 0) onPrev()
      else onNext()
    }
  }, [onNext, onPrev])

  // Prevent line click during swipe
  const handleLineClickWrapper = useCallback((index: number) => {
    if (!isDraggingRef.current) {
      handleLineClick(index)
    }
  }, [handleLineClick])

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 flex items-center justify-center p-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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

            <div
              ref={lyricsContainerRef}
              className="relative flex-1 w-full mt-4 overflow-y-auto scrollbar-none"
              onScroll={handleScroll}
            >
              <div className="h-[35vh]" />
              {lrc.lines.length > 0 ? (
                lrc.lines.map((line, i) => (
                  <div
                    key={`${line.timeMs}-${i}`}
                    ref={(el) => { lineRefs.current[i] = el }}
                    onClick={() => handleLineClickWrapper(i)}
                    className={`py-2.5 text-center font-serif transition-all duration-300 cursor-pointer active:scale-95 ${
                      i === activeIndex
                        ? 'text-[var(--ink-red)] dark:text-ink-100 text-xl font-semibold scale-105'
                        : 'text-ink-400 dark:text-ink-500 text-base hover:text-ink-600 dark:hover:text-ink-300'
                    }`}
                  >
                    {line.text}
                  </div>
                ))
              ) : (
                <div className="text-center text-ink-400 dark:text-ink-500 font-serif">暂无歌词</div>
              )}
              <div className="h-[35vh]" />
            </div>
          </div>

          {/* Footer - Just Hint */}
          <footer className="relative z-10 px-4 py-3 border-t border-ink-200/30 dark:border-ink-700/30">
            <p className="text-center text-xs text-ink-400 dark:text-ink-500 font-serif">
              ← 左右滑动切歌 · 点击歌词跳转 →
            </p>
          </footer>
        </div>
      </div>
    </motion.div>
  )
}
