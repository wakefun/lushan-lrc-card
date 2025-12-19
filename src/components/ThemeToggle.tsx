import { motion } from 'framer-motion'
import { useAppStore } from '../store/app'
import { PHYSICS_BRUSH } from '../utils/animations'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={PHYSICS_BRUSH}
      className="w-12 h-12 rounded-full flex items-center justify-center focus:outline-none"
      aria-label={isDark ? '切换日间模式' : '切换夜间模式'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
          <defs>
            <filter id="ink-rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
            </filter>
          </defs>

          {isDark ? (
            // 夜间模式: 显示淡红太阳 (点击切换到日间)
            <g filter="url(#ink-rough)">
              {/* 光晕 */}
              <circle cx="20" cy="20" r="14" fill="#fca5a5" opacity="0.25" />
              {/* 核心 */}
              <circle cx="20" cy="20" r="8" fill="#f87171" className="drop-shadow-lg" />
            </g>
          ) : (
            // 日间模式: 显示银白月亮 (点击切换到夜间)
            <g filter="url(#ink-rough)">
              {/* 月牙形状 - 更亮的白色 */}
              <path
                d="M28,12 A10,10 0 1,1 12,28 A12,12 0 1,0 28,12 Z"
                fill="#ffffff"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }}
              />
            </g>
          )}
        </svg>
      </motion.div>
    </motion.button>
  )
}
