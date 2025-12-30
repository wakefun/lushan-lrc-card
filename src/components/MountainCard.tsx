import { useMemo } from 'react'
import type { Artist } from '../types/music'

interface MountainCardProps {
  artist: Artist
  onClick: (artist: Artist) => void
  index: number
  isBreathing: boolean
}

const SMALL_MOUNTAIN_COUNTS = [3, 3, 3, 0, 4, 3, 3, 3]

function generateSmallMountains(seed: number, count: number) {
  const mountains: Array<{ path: string; opacity: number; scale: number }> = []
  for (let i = 0; i < count; i++) {
    const subSeed = seed + i * 137
    const px = 15 + (subSeed % 70)
    const py = 55 + (subSeed % 25)
    const width = 25 + (subSeed % 30)
    const leftX = px - width / 2
    const rightX = px + width / 2

    const path = `M${leftX},100 Q${px},${py} ${rightX},100 Z`
    const opacity = 0.28 + (subSeed % 22) / 100
    const scale = 0.7 + (subSeed % 30) / 100

    mountains.push({ path, opacity, scale })
  }
  return mountains
}

export const MountainCard = ({ artist, onClick, index, isBreathing }: MountainCardProps) => {
  const seed = artist.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const smallMountainCount = SMALL_MOUNTAIN_COUNTS[index % SMALL_MOUNTAIN_COUNTS.length]

  const { peakY, mountainPath, baseScale, smallMountains } = useMemo(() => {
    const px = 30 + (seed % 40)
    const py = 22 + (seed % 20)
    const scale = 0.88 + (seed % 12) / 100

    const leftCpX = px * 0.4 + (seed % 10)
    const leftCpY = py + 15 + (seed % 20)
    const rightCpX = px + (100 - px) * 0.6 - (seed % 10)
    const rightCpY = py + 12 + (seed % 18)

    const hasSecondPeak = seed % 3 === 0
    let path: string
    if (hasSecondPeak) {
      const peak2X = px + 25 + (seed % 15)
      const peak2Y = py + 10 + (seed % 10)
      path = `M-15,100 Q${leftCpX},${leftCpY} ${px},${py} Q${(px + peak2X) / 2},${py + 8} ${peak2X},${peak2Y} Q${rightCpX + 10},${rightCpY} 115,100 Z`
    } else {
      path = `M-15,100 Q${leftCpX},${leftCpY} ${px},${py} Q${rightCpX},${rightCpY} 115,100 Z`
    }

    const smalls = generateSmallMountains(seed, smallMountainCount)

    return { peakY: py, mountainPath: path, baseScale: scale, smallMountains: smalls }
  }, [seed, smallMountainCount])

  return (
    <button
      onClick={() => onClick(artist)}
      className="relative flex flex-col items-center justify-end w-full aspect-[4/3] group mountain-card focus:outline-none isolate"
    >
      {/* 山体层 + 文字层 (一起呼吸) */}
      <div
        className="absolute bottom-0 w-full h-full z-10 pointer-events-none"
        style={{
          transform: isBreathing
            ? 'translate3d(0, -8px, 0) scale(1.1)'
            : 'translate3d(0, 0, 0) scale(0.88)',
          transition: 'transform 3s cubic-bezier(0.45, 0, 0.55, 1)',
          willChange: 'transform',
          transformOrigin: 'bottom center'
        }}
      >
        {/* 文字层 (山顶位置，带光晕) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center w-full"
          style={{ top: `${peakY - 8}%` }}
        >
          <h3
            className="font-serif font-bold text-lg whitespace-nowrap tracking-[0.15em] transition-colors duration-500"
            style={{
              backgroundImage: 'linear-gradient(to bottom, var(--text-start), var(--text-end))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 12px var(--text-halo), 0 0 24px var(--text-halo-outer)'
            }}
          >
            {artist.name}
          </h3>
        </div>

        {/* 山体 SVG */}
        <div style={{ transform: `scale(${baseScale})`, transformOrigin: 'bottom center' }} className="w-full h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${artist.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="[stop-color:#1a1a1a] dark:[stop-color:#e8e8e8]" stopOpacity="1" />
                <stop offset="45%" className="[stop-color:#3a3a3a] dark:[stop-color:#c0c0c0]" stopOpacity="0.9" />
                <stop offset="100%" className="[stop-color:#555] dark:[stop-color:#999]" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`grad-small-${artist.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="[stop-color:#3a3a3a] dark:[stop-color:#d8d8d8]" stopOpacity="0.85" />
                <stop offset="100%" className="[stop-color:#666] dark:[stop-color:#bbb]" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* 小山 */}
            {smallMountains.map((sm, i) => (
              <path
                key={i}
                d={sm.path}
                fill={`url(#grad-small-${artist.id})`}
                opacity={sm.opacity}
                filter="url(#ink-wash)"
              />
            ))}

            {/* 主山体 */}
            <path d={mountainPath} fill={`url(#grad-${artist.id})`} filter="url(#ink-wash)" />
          </svg>
        </div>
      </div>
    </button>
  )
}
