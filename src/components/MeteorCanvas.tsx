import { useEffect, useRef, memo } from 'react'

interface MeteorTrailPoint {
  x: number
  y: number
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  trail: MeteorTrailPoint[]
  maxTrailCount: number
  currentTrailCount: number
  headSize: number
  opacity: number
  maxOpacity: number
  fadeState: 'in' | 'out'
}

const createMeteor = (width: number, height: number): Meteor => {
  const angle = Math.random() * (Math.PI / 3)
  const maxTrailCount = Math.floor(Math.random() * 15 + 10)
  // 越长的流星越慢：尾巴长度10-25，速度映射为4-1
  const speed = 5 - (maxTrailCount - 10) * 0.27

  return {
    x: Math.random() * width + 200,
    y: Math.random() * height * 0.8,
    vx: speed * Math.cos(angle),
    vy: speed * Math.sin(angle),
    gravity: Math.random() * 0.015 + 0.003,
    trail: [],
    maxTrailCount,
    currentTrailCount: 2,
    headSize: Math.random() * 1.25 + 0.75,
    opacity: 0,
    maxOpacity: Math.random() * 0.7 + 0.3,
    fadeState: 'in'
  }
}

const updateMeteor = (meteor: Meteor, height: number): boolean => {
  meteor.vy += meteor.gravity
  meteor.x -= meteor.vx
  meteor.y += meteor.vy

  meteor.trail.unshift({ x: meteor.x, y: meteor.y })

  if (meteor.currentTrailCount < meteor.maxTrailCount) {
    meteor.currentTrailCount += 0.5
  }

  while (meteor.trail.length > meteor.currentTrailCount) {
    meteor.trail.pop()
  }

  if (meteor.fadeState === 'in') {
    meteor.opacity += 0.02
    if (meteor.opacity >= meteor.maxOpacity) {
      meteor.opacity = meteor.maxOpacity
      meteor.fadeState = 'out'
    }
  } else {
    if (Math.random() > 0.95) {
      meteor.opacity = meteor.maxOpacity * (0.8 + Math.random() * 0.2)
    }
    meteor.opacity -= 0.005
  }

  const lastPoint = meteor.trail[meteor.trail.length - 1] || { x: meteor.x, y: meteor.y }
  return !(meteor.opacity < 0 || lastPoint.x < -100 || lastPoint.y > height + 100)
}

const drawMeteor = (ctx: CanvasRenderingContext2D, meteor: Meteor) => {
  if (meteor.trail.length < 2) return

  const head = meteor.trail[0]
  const tail = meteor.trail[meteor.trail.length - 1]

  ctx.save()

  const gradient = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y)
  gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`)
  gradient.addColorStop(0.4, `rgba(255, 255, 255, ${meteor.opacity * 0.6})`)
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  // 基底层
  ctx.beginPath()
  ctx.moveTo(meteor.trail[0].x, meteor.trail[0].y)
  for (let i = 1; i < meteor.trail.length; i++) {
    ctx.lineTo(meteor.trail[i].x, meteor.trail[i].y)
  }
  ctx.strokeStyle = gradient
  ctx.lineWidth = meteor.headSize * 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowBlur = 5
  ctx.shadowColor = `rgba(255, 255, 255, ${meteor.opacity * 0.5})`
  ctx.stroke()

  // 头部
  ctx.beginPath()
  ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`
  ctx.shadowBlur = 10
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
  ctx.arc(head.x, head.y, meteor.headSize * 0.7, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export const MeteorCanvas = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const meteorsRef = useRef<Meteor[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const animate = () => {
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      meteorsRef.current = meteorsRef.current.filter(m => updateMeteor(m, height))
      meteorsRef.current.forEach(m => drawMeteor(ctx, m))

      if (meteorsRef.current.length < 5 && Math.random() < 0.03) {
        meteorsRef.current.push(createMeteor(width, height))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
})

MeteorCanvas.displayName = 'MeteorCanvas'
