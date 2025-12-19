import { useOnlineStatus } from '../hooks/usePWA'
import { motion, AnimatePresence } from 'framer-motion'

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-ink-800 text-ink-100 text-center py-2 text-sm font-serif"
        >
          离线模式 · 已缓存数据可用
        </motion.div>
      )}
    </AnimatePresence>
  )
}
