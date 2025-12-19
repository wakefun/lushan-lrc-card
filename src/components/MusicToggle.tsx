import { motion } from 'framer-motion'
import { PHYSICS_BRUSH } from '../utils/animations'
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

  const noteVariants = {
    playing: {
      scale: [1, 1.05, 1],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    },
    paused: {
      scale: 0.95,
      rotate: 0,
      opacity: 0.6
    }
  }

  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={PHYSICS_BRUSH}
      className="w-12 h-12 rounded-full flex items-center justify-center focus:outline-none"
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
              <motion.circle
                cx="20" cy="20" r="14"
                fill={isDark ? '#ffffff' : '#000000'}
                opacity={0.08}
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.08, 0.04, 0.08] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            )}

            <motion.g
              variants={noteVariants}
              animate={playing ? 'playing' : 'paused'}
            >
              {/* 音符主体 - 水墨笔触风格 */}
              <path
                d="M16,28 Q12,28 12,24 Q12,20 16,20 Q20,20 20,24 V10 L30,7 V20 Q26,20 26,16 Q26,12 30,12 Q34,12 34,16"
                fill="none"
                stroke={isDark ? '#fca5a5' : '#dc2626'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>

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
    </motion.button>
  )
}
