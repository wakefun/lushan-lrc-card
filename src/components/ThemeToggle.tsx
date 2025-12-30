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
      className="w-12 h-12 rounded-full flex items-center justify-center focus:outline-none overflow-visible"
      aria-label={isDark ? '切换日间模式' : '切换夜间模式'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="relative w-full h-full flex items-center justify-center overflow-visible"
      >
        <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
          <defs>
            <filter id="ink-rough" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
            </filter>
            <filter id="moon-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" result="roughEdge" />
              <feGaussianBlur in="roughEdge" stdDeviation="0.3" result="smoothRough" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="smoothRough" />
              </feMerge>
            </filter>
          </defs>

          {isDark ? (
            // 夜间模式: 显示银白月亮
            <g filter="url(#moon-glow)">
              <path
                d="M28,12 A10,10 0 1,1 12,28 A12,12 0 1,0 28,12 Z"
                fill="#ffffff"
              />
            </g>
          ) : (
            // 日间模式: 显示淡红太阳
            <g filter="url(#ink-rough)">
              {/* 光晕 */}
              <circle cx="20" cy="20" r="14" fill="#fca5a5" opacity="0.25" />
              {/* 核心 */}
              <circle cx="20" cy="20" r="8" fill="#f87171" className="drop-shadow-lg" />
            </g>
          )}
        </svg>
      </motion.div>
    </motion.button>
  )
}
