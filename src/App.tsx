import { useEffect, useState } from 'react'
import { useAppStore } from './store/app'
import { OfflineIndicator } from './components/OfflineIndicator'
import { InstallPrompt } from './components/InstallPrompt'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'
import HomePage from './pages/HomePage'
import LyricPage from './pages/LyricPage'

export default function App() {
  const { currentArtist, initData } = useAppStore()
  const [loading, setLoading] = useState(true)
  const music = useBackgroundMusic({ src: '/lushan.mp3' })

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
      {currentArtist ? <LyricPage /> : <HomePage music={music} />}
    </>
  )
}
