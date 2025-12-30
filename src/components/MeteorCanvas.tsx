import { useEffect, useRef, memo } from 'react'

// 流星拖尾轨迹点
interface MeteorTrailPoint {
  x: number
  y: number
}

// 流星对象
interface Meteor {
  x: number
  y: number
  vx: number                    // 水平速度
  vy: number                    // 垂直速度
  gravity: number               // 重力加速度
  trail: MeteorTrailPoint[]     // 拖尾轨迹点数组
  maxTrailCount: number         // 最大拖尾长度
  currentTrailCount: number     // 当前拖尾长度（渐增）
  headSize: number              // 流星头部大小
  opacity: number               // 当前透明度
  maxOpacity: number            // 最大透明度
  fadeState: 'in' | 'out'       // 淡入/淡出状态
}

// 创建一颗新流星
const createMeteor = (width: number, height: number): Meteor => {
  const angle = Math.random() * (Math.PI / 3)  // 随机角度 0-60度
  const maxTrailCount = Math.floor(Math.random() * 15 + 10)  // 拖尾长度 10-25
  // 越长的流星越慢：尾巴长度10-25，速度映射为4-1
  const speed = 5 - (maxTrailCount - 10) * 0.27

  return {
    x: Math.random() * width + 200,   // 从右侧随机位置开始
    y: Math.random() * height * 0.8,  // 垂直位置在屏幕上方80%区域
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

/**
 * 更新流星状态，返回 false 表示流星应被移除
 * 流星移除条件：透明度<0 或 飞出屏幕边界
 */
const updateMeteor = (meteor: Meteor, height: number): boolean => {
  // 应用重力，向下加速
  meteor.vy += meteor.gravity
  // 向左下方移动
  meteor.x -= meteor.vx
  meteor.y += meteor.vy

  // 记录当前位置到轨迹头部
  meteor.trail.unshift({ x: meteor.x, y: meteor.y })

  // 拖尾渐长效果
  if (meteor.currentTrailCount < meteor.maxTrailCount) {
    meteor.currentTrailCount += 0.5
  }

  // 移除超出长度的轨迹点
  while (meteor.trail.length > meteor.currentTrailCount) {
    meteor.trail.pop()
  }

  // 透明度状态机：淡入 → 淡出
  if (meteor.fadeState === 'in') {
    meteor.opacity += 0.02
    if (meteor.opacity >= meteor.maxOpacity) {
      meteor.opacity = meteor.maxOpacity
      meteor.fadeState = 'out'
    }
  } else {
    // 淡出阶段，偶尔闪烁
    if (Math.random() > 0.95) {
      meteor.opacity = meteor.maxOpacity * (0.8 + Math.random() * 0.2)
    }
    meteor.opacity -= 0.005
  }

  // 判断流星是否存活：透明度>0 且 未飞出屏幕
  const lastPoint = meteor.trail[meteor.trail.length - 1] || { x: meteor.x, y: meteor.y }
  return !(meteor.opacity < 0 || lastPoint.x < -100 || lastPoint.y > height + 100)
}

// 绘制流星（渐变拖尾 + 发光头部）
const drawMeteor = (ctx: CanvasRenderingContext2D, meteor: Meteor) => {
  if (meteor.trail.length < 2) return

  const head = meteor.trail[0]
  const tail = meteor.trail[meteor.trail.length - 1]

  ctx.save()

  // 创建从头到尾的渐变（头部亮，尾部透明）
  const gradient = ctx.createLinearGradient(head.x, head.y, tail.x, tail.y)
  gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`)
  gradient.addColorStop(0.4, `rgba(255, 255, 255, ${meteor.opacity * 0.6})`)
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

  // 绘制拖尾轨迹
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

  // 绘制发光头部
  ctx.beginPath()
  ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`
  ctx.shadowBlur = 10
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
  ctx.arc(head.x, head.y, meteor.headSize * 0.7, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * 流星画布组件
 * - 常态：最多5颗流星随机出现
 * - 每66秒：触发66颗流星大爆发
 * - 流星自动清理：淡出或飞出屏幕后移除，不会累积
 * - 页面后台时暂停，避免累积导致崩溃
 */
export const MeteorCanvas = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const meteorsRef = useRef<Meteor[]>([])
  const animationRef = useRef<number>(0)
  const burstIntervalRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // 动画主循环
    const animate = () => {
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      // 更新并过滤：updateMeteor返回false的流星被移除
      meteorsRef.current = meteorsRef.current.filter(m => updateMeteor(m, height))
      meteorsRef.current.forEach(m => drawMeteor(ctx, m))

      // 常态下保持最多5颗流星
      if (meteorsRef.current.length < 5 && Math.random() < 0.03) {
        meteorsRef.current.push(createMeteor(width, height))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // 触发流星雨大爆发
    const triggerBurst = () => {
      const width = canvas.width
      const height = canvas.height
      for (let i = 0; i < 66; i++) {
        meteorsRef.current.push(createMeteor(width, height))
      }
    }

    // 启动定时器
    const startBurstInterval = () => {
      burstIntervalRef.current = window.setInterval(triggerBurst, 66000)
    }

    // 页面可见性变化处理：后台时暂停，前台时恢复
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面进入后台：暂停定时器和动画
        clearInterval(burstIntervalRef.current)
        cancelAnimationFrame(animationRef.current)
      } else {
        // 页面回到前台：清空累积的流星，重新启动
        meteorsRef.current = []
        startBurstInterval()
        animate()
      }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    startBurstInterval()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cancelAnimationFrame(animationRef.current)
      clearInterval(burstIntervalRef.current)
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
