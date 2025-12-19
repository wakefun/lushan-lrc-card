import { motion, AnimatePresence } from 'framer-motion'
import { useInstallPrompt } from '../hooks/usePWA'

export const InstallPrompt = () => {
  const { canInstall, isIOSSafari, install, dismiss } = useInstallPrompt()

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
              <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
                <img src="/icons/logo-192.png" alt="庐山歌词本" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-serif font-semibold text-[#c23a32]">
                  添加到主屏幕
                </p>
                <div className="text-sm text-ink-500 dark:text-ink-400 font-serif mt-1 space-y-1">
                  <p>安装后可离线查看庐山跨年演唱会歌词</p>
                  {isIOSSafari && (
                    <p className="text-ink-400 dark:text-ink-500">
                      浏览器菜单-选择"添加到主屏幕"
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={dismiss}
                className="flex-1 py-2 text-base font-serif text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
              >
                {isIOSSafari ? '知道了' : '稍后'}
              </button>
              {!isIOSSafari && (
                <button
                  onClick={install}
                  className="flex-1 py-2 text-base font-serif font-semibold text-white bg-[#c23a32] rounded-lg hover:bg-[#a6312a] transition-colors"
                >
                  安装
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
