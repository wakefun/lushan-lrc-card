import { useAppStore } from '../store/app'

interface MusicToggleProps {
  enabled: boolean
  playing: boolean
  blocked: boolean
  onToggle: () => void
}

export function MusicToggle({ enabled, playing, blocked, onToggle }: MusicToggleProps) {
  const { theme } = useAppStore()
  const isDark = theme === 'dark'

  const ariaLabel = !enabled
    ? '开启背景音乐'
    : playing
      ? '关闭背景音乐'
      : blocked
        ? '点击播放背景音乐'
        : '关闭背景音乐'

  return (
    <button
      onClick={onToggle}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.stopPropagation()}
      className="w-12 h-12 rounded-full flex items-center justify-center focus:outline-none active:scale-90 hover:scale-110 transition-transform"
      aria-label={ariaLabel}
      aria-pressed={enabled}
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
          <defs>
            <filter id="ink-rough-music">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
            </filter>
          </defs>

          <g filter="url(#ink-rough-music)">
            {playing && (
              <circle
                cx="20" cy="20" r="14"
                fill={isDark ? '#ffffff' : '#000000'}
                className="animate-music-pulse"
              />
            )}

            <g className={playing ? 'animate-music-note' : 'scale-95 opacity-60'} style={{ transformOrigin: '20px 20px' }}>
              {/* 音符主体 - 水墨笔触风格 */}
              <path
                d="M16,28 Q12,28 12,24 Q12,20 16,20 Q20,20 20,24 V10 L30,7 V20 Q26,20 26,16 Q26,12 30,12 Q34,12 34,16"
                fill="none"
                stroke={isDark ? '#fca5a5' : '#dc2626'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* 静音时的斜杠 */}
            {!enabled && (
              <path
                d="M8,32 L32,8"
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}
          </g>
        </svg>

        {/* 自动播放被阻止时的提示点 */}
        {blocked && enabled && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>
    </button>
  )
}
