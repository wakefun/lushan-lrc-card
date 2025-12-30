import { useCallback, useEffect, useRef, useState } from 'react'

const MUSIC_ENABLED_KEY = 'ui:musicEnabled'

function isAutoplayBlockedError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  if (!('name' in error)) return false
  const name = (error as { name?: unknown }).name
  return typeof name === 'string' && name === 'NotAllowedError'
}

export interface BackgroundMusicController {
  enabled: boolean
  playing: boolean
  blocked: boolean
  toggle: () => void
}

interface UseBackgroundMusicOptions {
  src?: string
  volume?: number
}

export function useBackgroundMusic(options: UseBackgroundMusicOptions = {}): BackgroundMusicController {
  const { src = '/lushan.mp3', volume = 0.5 } = options

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [enabled, setEnabled] = useState(() => {
    try {
      const raw = localStorage.getItem(MUSIC_ENABLED_KEY)
      if (raw === null) return true
      return raw === 'true'
    } catch {
      return true
    }
  })
  const [playing, setPlaying] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(MUSIC_ENABLED_KEY, String(enabled))
    } catch {
      // ignore
    }
  }, [enabled])

  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'none'
    audio.volume = volume
    audio.src = src
    audioRef.current = audio

    const onPlaying = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.pause()
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audioRef.current = null
    }
  }, [src, volume])

  const tryPlay = useCallback(async (fromGesture: boolean) => {
    const audio = audioRef.current
    if (!audio) return false

    try {
      await audio.play()
      setBlocked(false)
      return true
    } catch (error) {
      setPlaying(false)
      const autoplayBlocked = isAutoplayBlockedError(error)
      if (fromGesture) {
        setBlocked((prev) => prev || autoplayBlocked)
      } else {
        setBlocked(autoplayBlocked)
      }
      return false
    }
  }, [])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
  }, [])

  useEffect(() => {
    if (!enabled) {
      setBlocked(false)
      pause()
      return
    }

    const timeoutId = window.setTimeout(() => {
      void tryPlay(false)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [enabled, pause, tryPlay])

  useEffect(() => {
    if (!blocked || !enabled) return

    const onFirstInteraction = (e: Event) => {
      // Ignore events from music toggle button (handled by toggle())
      if ((e.target as HTMLElement)?.closest?.('[aria-label*="背景音乐"]')) return

      const audio = audioRef.current
      if (audio) {
        try { audio.currentTime = 0 } catch { /* ignore */ }
      }
      void tryPlay(true)
    }

    const listenerOptions = { capture: true }
    window.addEventListener('pointerdown', onFirstInteraction, listenerOptions)
    window.addEventListener('keydown', onFirstInteraction, listenerOptions)

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction, listenerOptions)
      window.removeEventListener('keydown', onFirstInteraction, listenerOptions)
    }
  }, [blocked, enabled, tryPlay])

  const toggle = useCallback(() => {
    if (!enabled) {
      setEnabled(true)
      void tryPlay(true)
      return
    }

    if (playing) {
      setEnabled(false)
      setBlocked(false)
      pause()
      return
    }

    if (!blocked) {
      setEnabled(false)
      setBlocked(false)
      pause()
      return
    }

    // When blocked, reset to beginning before playing
    const audio = audioRef.current
    if (audio) {
      try { audio.currentTime = 0 } catch { /* ignore */ }
    }
    void tryPlay(true)
  }, [blocked, enabled, pause, playing, tryPlay])

  return { enabled, playing, blocked, toggle }
}
