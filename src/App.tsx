import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from './store/app'
import { OfflineIndicator } from './components/OfflineIndicator'
import { InstallPrompt } from './components/InstallPrompt'
import { WeChatPrompt } from './components/WeChatPrompt'
import { useBackgroundMusic } from './hooks/useBackgroundMusic'
import HomePage from './pages/HomePage'
import LyricPage from './pages/LyricPage'

export default function App() {
  const { currentArtist, initData, setCurrentArtist } = useAppStore()
  const [loading, setLoading] = useState(true)
  const music = useBackgroundMusic({ src: '/lushan.mp3' })

  useEffect(() => {
    initData().finally(() => setLoading(false))
  }, [initData])

  // Handle browser back button
  const handlePopState = useCallback((e: PopStateEvent) => {
    if (e.state?.page === 'lyric') {
      // Forward navigation to lyric page - restore artist from state
      const artistId = e.state.artistId
      const artists = useAppStore.getState().artists
      const artist = artists.find(a => a.id === artistId)
      if (artist) setCurrentArtist(artist)
    } else {
      // Back navigation or no state - go to home
      setCurrentArtist(null)
    }
  }, [setCurrentArtist])

  useEffect(() => {
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handlePopState])

  // Push history state when entering lyric page
  useEffect(() => {
    if (currentArtist) {
      const currentState = history.state
      if (currentState?.page !== 'lyric' || currentState?.artistId !== currentArtist.id) {
        history.pushState({ page: 'lyric', artistId: currentArtist.id }, '', `#${currentArtist.id}`)
      }
    }
  }, [currentArtist])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-paper)]">
        <div className="text-ink-500 text-lg font-serif">载入中...</div>
      </div>
    )
  }

  return (
    <>
      <WeChatPrompt />
      <OfflineIndicator />
      <InstallPrompt />
      {currentArtist ? <LyricPage /> : <HomePage music={music} />}
    </>
  )
}
