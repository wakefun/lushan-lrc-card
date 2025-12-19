import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '../hooks/usePWA'

export const InstallPrompt = () => {
  const { canInstall, install, dismiss } = useInstallPrompt()

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-[var(--bg-paper)] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-ink-200/30 dark:border-ink-700/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
                <span className="text-lg">山</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-serif font-semibold text-ink-900 dark:text-ink-100">
                  添加到主屏幕
                </p>
                <p className="text-xs text-ink-500 dark:text-ink-400 font-serif mt-0.5">
                  安装后可离线使用，体验更佳
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={dismiss}
                className="flex-1 py-2 text-sm font-serif text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
              >
                稍后
              </button>
              <button
                onClick={install}
                className="flex-1 py-2 text-sm font-serif font-semibold text-ink-900 dark:text-ink-100 bg-ink-100 dark:bg-ink-700 rounded-lg hover:bg-ink-200 dark:hover:bg-ink-600 transition-colors"
              >
                安装
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
