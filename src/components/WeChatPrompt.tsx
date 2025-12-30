import { useEffect, useState, useRef } from 'react'

export const WeChatPrompt = () => {
  const [isWeChat, setIsWeChat] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('micromessenger')) {
      setIsWeChat(true)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const triggerToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setShowToast(true)
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3000)
  }

  const handleCopy = () => {
    const url = window.location.href
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 200)

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => triggerToast())
        .catch(() => fallbackCopy(url))
    } else {
      fallbackCopy(url)
    }
  }

  const fallbackCopy = (text: string) => {
    // Fallback for browsers without clipboard API (e.g., WeChat)
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      const success = document.execCommand('copy')
      if (success) {
        triggerToast()
      } else {
        alert('复制失败，请手动复制链接：' + text)
      }
    } catch {
      alert('复制失败，请手动复制链接：' + text)
    } finally {
      document.body.removeChild(textarea)
    }
  }

  if (!isWeChat) return null

  return (
    <>
      {/* Toast - outside main container to avoid stacking context issues */}
      {showToast && (
        <div
          className="fixed top-20 left-1/2 z-[200] px-6 py-3 bg-[#1a1a1a] text-white text-sm font-serif rounded-lg shadow-lg"
          style={{ transform: 'translateX(-50%)', animation: 'toast-fade-in 0.3s ease-out' }}
        >
          链接已复制到剪切板，请打开浏览器访问
        </div>
      )}
      <div className="fixed inset-0 z-[100] bg-[#f8f6f1] overflow-hidden">
        {/* Decorative Border */}
        <div className="absolute inset-4 border-4 border-double border-ink-800/80 pointer-events-none" />
        <div className="absolute inset-6 border border-ink-600/60 pointer-events-none" />

        {/* Main Content (scrollable on small screens) */}
        <div className="absolute inset-0 overflow-x-hidden overflow-y-auto">
          <div className="relative z-10 flex flex-col items-center justify-center min-h-full max-w-lg w-full mx-auto p-6 space-y-6 pt-[max(1.5rem,calc(1rem+var(--safe-area-inset-top)))] pb-[max(2rem,calc(1.5rem+var(--safe-area-inset-bottom)))]">
            {/* Vertical Title */}
            <div className="pt-2 shrink-0">
              <h1 className="writing-vertical-rl text-4xl sm:text-5xl font-serif text-ink-900 font-bold tracking-[0.15em] select-none border-l-4 border-ink-900 pl-4 sm:pl-5 py-2 sm:py-3">
                此处不宜久留
              </h1>
            </div>

            {/* Message */}
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <p className="text-lg sm:text-xl font-serif text-ink-700 leading-relaxed tracking-wide">
                阁下身处微信之中
                <br />
                难以窥见庐山真面目
              </p>

              <div className="w-8 h-8 border-t-2 border-r-2 border-ink-300 transform rotate-45 opacity-50" />

              <p className="text-base sm:text-lg font-serif text-ink-600">
                请点击右上角 <span className="font-bold text-xl">···</span>
                <br />
                选择 <span className="text-[var(--ink-red)] font-bold">在浏览器打开</span>
              </p>
            </div>

            {/* Copy Button */}
            <div className="pb-2 shrink-0">
              <button
                onClick={handleCopy}
                className={`group relative px-8 py-3 border-[3px] border-[var(--ink-red)] font-serif text-lg rounded-sm transition-all duration-200 ${
                  isPressed
                    ? 'bg-[var(--ink-red)] text-white scale-95'
                    : 'bg-[#f8f6f1] text-[var(--ink-red)]'
                }`}
              >
                <span className="relative z-10 tracking-widest font-bold">
                  复制链接
                </span>
                <div className={`absolute inset-1 border pointer-events-none ${
                  isPressed ? 'border-white/50' : 'border-[var(--ink-red)]'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Ink Atmosphere */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-ink-900 rounded-full blur-[80px] opacity-[0.06] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[var(--ink-red)] rounded-full blur-[100px] opacity-[0.05] pointer-events-none" />
      </div>
    </>
  )
}
