import { useState, useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/app'
import { LyricCard } from '../components/LyricCard'
import { useWakeLock } from '../hooks/usePWA'

export default function LyricPage() {
  const { songs, currentSongIndex, currentArtist, setCurrentArtist, setCurrentSongIndex } = useAppStore()
  const [direction, setDirection] = useState(0)
  const { request: requestWakeLock } = useWakeLock()

  useEffect(() => {
    requestWakeLock()
  }, [requestWakeLock])

  const currentSong = songs[currentSongIndex]
  const remainingSongs = songs.length - currentSongIndex - 1

  // Generate stack cards based on remaining songs (max 4 visible)
  const stackCards = useMemo(() => {
    const visibleCount = Math.min(remainingSongs, 4)
    const cards: Array<{ offsetX: number; offsetY: number; rotate: number; zIndex: number }> = []

    // Predefined positions for natural stacking look (from reference image)
    const positions = [
      { x: -35, y: 10, r: -6 },   // Bottom left (更靠左，旋转更大)
      { x: 35, y: 14, r: 6 },     // Bottom right (更靠右，旋转更大)
      { x: -20, y: 18, r: -3 },   // Further left (内层左)
      { x: 20, y: 22, r: 3 },     // Further right (内层右)
    ]

    for (let i = 0; i < visibleCount; i++) {
      const pos = positions[i]
      cards.push({
        offsetX: pos.x,
        offsetY: pos.y,
        rotate: pos.r,
        zIndex: i + 1
      })
    }

    return cards
  }, [remainingSongs])

  const handleNext = useCallback(() => {
    if (currentSongIndex < songs.length - 1) {
      setDirection(1)
      setCurrentSongIndex(currentSongIndex + 1)
    }
  }, [currentSongIndex, songs.length, setCurrentSongIndex])

  const handlePrev = useCallback(() => {
    if (currentSongIndex > 0) {
      setDirection(-1)
      setCurrentSongIndex(currentSongIndex - 1)
    }
  }, [currentSongIndex, setCurrentSongIndex])

  const handleClose = useCallback(() => {
    setCurrentArtist(null)
  }, [setCurrentArtist])

  if (!currentSong || !currentArtist) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-ink-400 font-serif">暂无歌曲</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative overflow-hidden bg-[var(--bg-paper)] transition-colors duration-500">
      {/* Stack Cards - Peek from bottom */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        {stackCards.map((card, i) => (
          <div
            key={`stack-${i}`}
            className="absolute w-full h-full flex items-center justify-center p-6"
            style={{
              zIndex: card.zIndex,
              transform: `translateX(${card.offsetX}px) translateY(${card.offsetY}px) rotate(${card.rotate}deg)`,
            }}
          >
            <div className="relative w-full h-full max-w-sm">
              {/* Card shadow */}
              <div className="absolute inset-0 rounded-2xl bg-ink-900/5 dark:bg-ink-100/5 translate-x-1 translate-y-1" />
              {/* Card body */}
              <div className="relative w-full h-full rounded-2xl bg-[var(--bg-paper)] shadow-md ring-1 ring-ink-200/40 dark:ring-ink-100/15" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 h-full">
        <AnimatePresence mode="popLayout" custom={direction}>
          <LyricCard
            key={currentSong.id}
            song={currentSong}
            onNext={handleNext}
            onPrev={handlePrev}
            onClose={handleClose}
            direction={direction}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}
