import { useState, useEffect, useCallback } from 'react'

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    setIsSupported('wakeLock' in navigator)
  }, [])

  const request = useCallback(async () => {
    if (!isSupported) return false
    try {
      const wakeLock = await navigator.wakeLock.request('screen')
      setIsActive(true)
      wakeLock.addEventListener('release', () => setIsActive(false))
      return true
    } catch {
      return false
    }
  }, [isSupported])

  return { isSupported, isActive, request }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOSSafari(): boolean {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Chrome/.test(ua)
  return isIOS && isSafari
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('pwa-install-dismissed') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as { standalone?: boolean }).standalone === true
    setIsInstalled(isStandalone)

    if (!isStandalone && isIOSSafari()) {
      setShowIOSGuide(true)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return false
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return outcome === 'accepted'
    } catch {
      setDeferredPrompt(null)
      return false
    }
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setShowIOSGuide(false)
    try {
      localStorage.setItem('pwa-install-dismissed', 'true')
    } catch {
      // ignore
    }
  }, [])

  return {
    canInstall: (!!deferredPrompt || showIOSGuide) && !isInstalled && !dismissed,
    isIOSSafari: showIOSGuide,
    isInstalled,
    install,
    dismiss
  }
}
