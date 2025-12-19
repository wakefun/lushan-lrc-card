# CLAUDE.md - AI 开发指南

本文档帮助 AI 助手快速理解项目结构和开发规范。

## 项目概述

**庐山歌词本** - 中国水墨风格的离线歌词播放器 PWA，面向音乐节现场弱网环境。

## 技术栈速查

- **框架**: React 19 + TypeScript 5.7 + Vite 6
- **样式**: Tailwind CSS 3.4 (自定义 ink 色板)
- **状态**: Zustand 5.0 (单一 store)
- **动画**: Framer Motion 12.0 (手势 + 弹簧物理)
- **PWA**: vite-plugin-pwa + Workbox
- **存储**: IndexedDB (idb-keyval 封装)

## 关键文件定位

| 功能 | 文件路径 |
|------|----------|
| 全局状态 | `src/store/app.ts` |
| 歌词解析 | `src/utils/lrc.ts` |
| 歌词卡片 | `src/components/LyricCard.tsx` |
| 山体组件 | `src/components/MountainCard.tsx` |
| 背景特效 | `src/components/BackgroundEffects.tsx` |
| PWA hooks | `src/hooks/usePWA.ts` |
| 动画预设 | `src/utils/animations.ts` |
| 自定义动画 | `src/index.css` (@keyframes) |
| Tailwind 配置 | `tailwind.config.js` |
| PWA 配置 | `vite.config.ts` |

## 状态管理

Zustand store 结构 (`src/store/app.ts`):

```typescript
interface AppState {
  artists: Artist[]              // 所有歌手
  currentArtist: Artist | null   // 当前选中歌手
  songs: Song[]                  // 当前歌手的歌曲列表
  currentSongIndex: number       // 当前播放索引
  theme: 'light' | 'dark'        // 主题

  // Actions
  setCurrentArtist(artist)       // 选择歌手
  setSongs(songs)                // 设置歌曲列表
  setCurrentSongIndex(index)     // 切换歌曲
  toggleTheme()                  // 切换主题
  initData()                     // 初始化数据
}
```

## 动画系统

### CSS 动画 (index.css)

```css
/* 祥云飘动 */
@keyframes cloud-left   /* 从右向左 */
@keyframes cloud-right  /* 从左向右 */

/* 繁星闪烁 */
@keyframes ink-splash   /* 泼墨效果: scale 0→1.6→0.5 */

/* 山体呼吸 */
@keyframes mountain-breathe  /* scale 1→1.05 */
```

### Tailwind 动画类

```javascript
// tailwind.config.js
animation: {
  'flow': 'flow 20s linear infinite',
  'float': 'float 6s ease-in-out infinite',
  'ink-splash': 'ink-splash 2s ease-out forwards',
  'cloud-left': 'cloud-left 15s linear forwards',
  'cloud-right': 'cloud-right 15s linear forwards'
}
```

## 手势处理

LyricCard 组件的手势逻辑:

```typescript
// 阈值常量
SWIPE_OFFSET_THRESHOLD = 80      // 滑动触发距离 (px)
SWIPE_VELOCITY_THRESHOLD = 500   // 滑动触发速度 (px/s)
SEEK_SENSITIVITY = 50            // 进度调节灵敏度 (ms/px)
AXIS_LOCK_THRESHOLD = 10         // 轴锁定阈值 (px)

// 手势判断
if (|deltaX| > |deltaY|) → 水平滑动 (切歌)
else → 垂直拖动 (调进度)
```

## SVG 生成

### 山体生成 (MountainCard)

```typescript
// 使用歌手名生成种子
const seed = artistName.charCodeAt(i) * (i + 1)

// 二次贝塞尔曲线生成山峰
Q controlX,controlY endX,endY

// 30% 概率生成双峰
if (random > 0.7) 添加次峰
```

### 水墨滤镜 (InkFilters)

```xml
<filter id="ink-wash">
  <feTurbulence type="fractalNoise" />
  <feDisplacementMap scale="8" />
  <feGaussianBlur stdDeviation="0.5" />
</filter>
```

## 离线策略

```
用户访问
    ↓
Service Worker 拦截
    ↓
缓存命中? → 返回缓存
    ↓ 否
网络请求 → 缓存响应 → 返回
    ↓ 失败
IndexedDB 备份数据
    ↓ 无数据
内置 db.json (打包时内嵌)
```

## 性能优化要点

1. **动画属性** - 仅使用 `transform` + `opacity`
2. **定时器** - 使用 `requestAnimationFrame` 替代 `setInterval`
3. **组件缓存** - `React.memo` 包裹频繁渲染组件
4. **搜索算法** - 二分查找定位歌词行
5. **CSS 隔离** - `contain: layout style paint` 限制重绘
6. **Ref 追踪** - 使用 ref 追踪数组长度避免 effect 重跑

## 常见开发任务

### 修改背景特效

文件: `src/components/BackgroundEffects.tsx`

- 云朵数量: `cloudsRef.current.length >= 8`
- 云朵速度: `duration: 10 + Math.random() * 8`
- 繁星数量: `starsRef.current.length >= 20`
- 繁星大小: `size: 8 + Math.random() * 16`

### 修改动画时间

文件: `src/index.css`

- 云朵动画: `@keyframes cloud-left/right`
- 繁星动画: `@keyframes ink-splash`

### 修改主题颜色

文件: `tailwind.config.js` → `colors.ink`
文件: `src/index.css` → `:root` CSS 变量

### 修改手势灵敏度

文件: `src/components/LyricCard.tsx`

- `SWIPE_OFFSET_THRESHOLD` - 滑动触发距离
- `SWIPE_VELOCITY_THRESHOLD` - 滑动触发速度
- `SEEK_SENSITIVITY` - 进度调节灵敏度

## 调试技巧

### 检查 PWA 状态
```javascript
// 浏览器控制台
navigator.serviceWorker.ready.then(r => console.log(r))
```

### 检查 IndexedDB
```javascript
import { get, keys } from 'idb-keyval'
keys().then(console.log)
```

### 禁用 Service Worker (开发时)
```typescript
// vite.config.ts
VitePWA({
  devOptions: { enabled: false }
})
```

## 注意事项

1. **双击彩蛋**: 云朵双击飞出需要先捕获 computedStyle 再停止动画
2. **繁星闪烁**: 使用 ref 追踪数量，避免 effect 依赖 state.length
3. **手势冲突**: 先判断主轴方向再锁定，避免误触
4. **SVG 方向**: 祥云 SVG 默认朝右，从左往右时需 scaleX(-1)
5. **z-index 层级**: 背景 z-0, 内容 z-10, 云层 z-20, 弹窗 z-50

## 构建命令

```bash
pnpm dev      # 开发服务器
pnpm build    # 生产构建
pnpm preview  # 预览生产版本
pnpm lint     # 代码检查
```

## 需求文档

项目需求列表维护在 `todo.ai.md`，格式:
- `[ ]` 未完成
- `[x]` 已完成

完成需求后及时更新状态。
