import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useAppStore } from '../store/app'

// 导入祥云 SVG
import cloud1Url from '../assets/clouds/cloud1.svg'
import cloud2Url from '../assets/clouds/cloud2.svg'
import cloud3Url from '../assets/clouds/cloud3.svg'
import cloud4Url from '../assets/clouds/cloud4.svg'
import cloud5Url from '../assets/clouds/cloud5.svg'

// 导入繁星 SVG
import pomoUrl from '../assets/stars/pomo.svg'

const CLOUD_URLS = [cloud1Url, cloud2Url, cloud3Url, cloud4Url, cloud5Url]

interface Cloud {
  id: string
  type: number
  top: number
  width: number
  duration: number
  direction: 'left' | 'right'
  zIndex: number
}

interface Star {
  id: string
  left: number
  top: number
  size: number
  duration: number
}

// 云朵组件
const CloudItem = memo(({
  cloud,
  onComplete,
  imageUrl
}: {
  cloud: Cloud
  onComplete: (id: string) => void
  imageUrl: string
}) => {
  const divRef = useRef<HTMLDivElement>(null)
  const flyingOutRef = useRef(false)
  const removeTimerRef = useRef<number | null>(null)

  const handleDoubleClick = useCallback(() => {
    if (flyingOutRef.current || !divRef.current) return
    flyingOutRef.current = true

    const el = divRef.current
    const computed = window.getComputedStyle(el)
    const baseTransform = computed.transform === 'none' ? '' : computed.transform
    const baseOpacity = computed.opacity

    // 停止动画并冻结当前位置
    el.style.animation = 'none'
    el.style.transform = baseTransform
    el.style.opacity = baseOpacity
    el.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out'

    // 强制样式刷新
    void el.offsetHeight

    requestAnimationFrame(() => {
      el.style.transform = `${baseTransform} translate3d(0, -200px, 0) scale(1.5)`
      el.style.opacity = '0'
    })

    removeTimerRef.current = window.setTimeout(() => onComplete(cloud.id), 500)
  }, [cloud.id, onComplete])

  const handleAnimationEnd = useCallback(() => {
    if (!flyingOutRef.current) {
      onComplete(cloud.id)
    }
  }, [cloud.id, onComplete])

  useEffect(() => {
    return () => {
      if (removeTimerRef.current != null) window.clearTimeout(removeTimerRef.current)
    }
  }, [])

  return (
    <div
      ref={divRef}
      className="absolute will-change-transform pointer-events-auto"
      style={{
        top: `${cloud.top}%`,
        left: 0,
        width: `${cloud.width}px`,
        height: '50px',
        zIndex: cloud.zIndex,
        animation: `${cloud.direction === 'left' ? 'cloud-left' : 'cloud-right'} ${cloud.duration}s linear forwards`,
        contain: 'layout style paint'
      }}
      onAnimationEnd={handleAnimationEnd}
      onDoubleClick={handleDoubleClick}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-contain cursor-pointer"
        loading="eager"
        decoding="async"
        style={{
          transform: cloud.direction === 'left' ? 'scaleX(-1)' : undefined,
          filter: 'drop-shadow(1px -1px 2px rgba(255,248,220,0.2))'
        }}
      />
    </div>
  )
})

CloudItem.displayName = 'CloudItem'

// 繁星组件
const StarItem = memo(({
  star,
  onComplete
}: {
  star: Star
  onComplete: (id: string) => void
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(star.id), star.duration * 1000)
    return () => clearTimeout(timer)
  }, [star.id, star.duration, onComplete])

  return (
    <div
      className="absolute animate-ink-splash pointer-events-none"
      style={{
        left: `${star.left}%`,
        top: `${star.top}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        animationDuration: `${star.duration}s`,
        filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.6))'
      }}
    >
      <img
        src={pomoUrl}
        alt=""
        className="w-full h-full"
      />
    </div>
  )
})

StarItem.displayName = 'StarItem'

export const BackgroundEffects = () => {
  const { theme } = useAppStore()
  const isDark = theme === 'dark'

  // 云朵状态
  const [clouds, setClouds] = useState<Cloud[]>([])
  const cloudsRef = useRef<Cloud[]>([])

  // 繁星状态
  const [stars, setStars] = useState<Star[]>([])
  const starsRef = useRef<Star[]>([])

  const addCloud = useCallback(() => {
    if (cloudsRef.current.length >= 8) return

    const newCloud: Cloud = {
      id: `${Date.now()}-${Math.random()}`,
      type: Math.floor(Math.random() * CLOUD_URLS.length),
      top: 5 + Math.random() * 80,
      width: 50 + Math.random() * 60,
      duration: 10 + Math.random() * 8, // 更快: 10-18s
      direction: Math.random() > 0.5 ? 'left' : 'right',
      zIndex: 10 + Math.floor(Math.random() * 10)
    }

    setClouds(prev => {
      const next = [...prev, newCloud]
      cloudsRef.current = next
      return next
    })
  }, [])

  const removeCloud = useCallback((id: string) => {
    setClouds(prev => {
      const next = prev.filter(c => c.id !== id)
      cloudsRef.current = next
      return next
    })
  }, [])

  const addStar = useCallback(() => {
    if (starsRef.current.length >= 20) return

    const newStar: Star = {
      id: `${Date.now()}-${Math.random()}`,
      left: Math.random() * 95,
      top: Math.random() * 90,
      size: 8 + Math.random() * 16, // 8-24px
      duration: 1.5 + Math.random() * 1.5 // 1.5-3s
    }
    setStars(prev => {
      const next = [...prev, newStar]
      starsRef.current = next
      return next
    })
  }, [])

  const removeStar = useCallback((id: string) => {
    setStars(prev => {
      const next = prev.filter(s => s.id !== id)
      starsRef.current = next
      return next
    })
  }, [])

  // 云朵生成
  useEffect(() => {
    const timeouts: number[] = []

    if (isDark) {
      setClouds([])
      cloudsRef.current = []
      return () => {
        timeouts.forEach((t) => window.clearTimeout(t))
      }
    }

    for (let i = 0; i < 3; i++) {
      timeouts.push(window.setTimeout(addCloud, i * 1200))
    }

    const interval = window.setInterval(addCloud, 2500)
    return () => {
      timeouts.forEach((t) => window.clearTimeout(t))
      window.clearInterval(interval)
    }
  }, [isDark, addCloud])

  // 繁星生成
  useEffect(() => {
    const timeouts: number[] = []

    if (!isDark) {
      setStars([])
      starsRef.current = []
      return () => {
        timeouts.forEach((t) => window.clearTimeout(t))
      }
    }

    // 初始繁星
    for (let i = 0; i < 8; i++) {
      timeouts.push(window.setTimeout(addStar, i * 200))
    }

    // 持续添加繁星，控制同时数量8-20
    const interval = window.setInterval(() => {
      if (starsRef.current.length < 20 && Math.random() > 0.3) {
        addStar()
      }
    }, 400)

    return () => {
      timeouts.forEach((t) => window.clearTimeout(t))
      window.clearInterval(interval)
    }
  }, [isDark, addStar])

  return (
    <>
      {/* 繁星层 (夜间) */}
      {isDark && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {stars.map(star => (
            <StarItem
              key={star.id}
              star={star}
              onComplete={removeStar}
            />
          ))}
        </div>
      )}

      {/* 祥云层 (日间) */}
      {!isDark && (
        <div className="fixed inset-0 z-20 overflow-hidden pointer-events-none">
          {clouds.map((cloud) => (
            <CloudItem
              key={cloud.id}
              cloud={cloud}
              onComplete={removeCloud}
              imageUrl={CLOUD_URLS[cloud.type]}
            />
          ))}
        </div>
      )}
    </>
  )
}
