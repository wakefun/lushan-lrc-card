import { useEffect, useState } from 'react'
import { useAppStore } from './store/app'
import { OfflineIndicator } from './components/OfflineIndicator'
import { InstallPrompt } from './components/InstallPrompt'
import HomePage from './pages/HomePage'
import LyricPage from './pages/LyricPage'

export default function App() {
  const { currentArtist, initData } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initData().finally(() => setLoading(false))
  }, [initData])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-ink-500 text-lg font-serif">载入中...</div>
      </div>
    )
  }

  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
      {currentArtist ? <LyricPage /> : <HomePage />}
    </>
  )
}
