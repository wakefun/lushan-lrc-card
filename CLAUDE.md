# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

庐山歌词本 - 中国水墨风格的离线歌词播放器 PWA，面向音乐节现场弱网环境。

技术栈: React 19 + TypeScript + Vite 6 + Tailwind CSS + Zustand + Framer Motion + vite-plugin-pwa

## 构建命令

```bash
pnpm dev      # 开发服务器 (localhost:5173)
pnpm build    # 生产构建 (tsc + vite build)
pnpm preview  # 预览生产版本
pnpm lint     # ESLint 检查
```

## 架构概览

### 数据流

```
db.json (歌词数据库，打包时内嵌)
    ↓ initData()
Zustand store (src/store/app.ts)
    ↓
IndexedDB 持久化 (主题偏好)
    ↓
Service Worker 缓存 (离线访问)
```

### 页面结构

- **HomePage** (`src/pages/HomePage.tsx`) - 歌手选择，水墨山体网格
- **LyricPage** (`src/pages/LyricPage.tsx`) - 歌词播放，卡片堆叠

### 核心组件职责

| 组件 | 职责 |
|------|------|
| `LyricCard` | 歌词显示 + 手势控制 (垂直拖动调进度, 水平滑动切歌) |
| `MountainCard` | 程序化生成水墨山体 SVG (歌手名作为种子) |
| `BackgroundEffects` | 日间祥云飘动 / 夜间繁星闪烁 |

### 动画系统

- **CSS 动画** (`src/index.css`): `cloud-left`, `cloud-right`, `ink-splash`
- **Tailwind 扩展** (`tailwind.config.js`): 自定义 ink 灰度色板
- **Framer Motion**: 歌词卡片切换、手势识别

### 状态管理

单一 Zustand store (`src/store/app.ts`):
- `artists` / `currentArtist` - 歌手数据
- `songs` / `currentSongIndex` - 当前播放状态
- `theme` - 日夜主题

## 关键实现细节

### 云朵双击飞出

停止 CSS 动画时需先捕获 `getComputedStyle` 冻结当前位置，再应用飞出动画:

```typescript
const baseTransform = window.getComputedStyle(el).transform
el.style.animation = 'none'
el.style.transform = baseTransform
void el.offsetHeight // 强制样式刷新
el.style.transform = `${baseTransform} translate3d(0, -200px, 0)`
```

### 繁星动态生成

使用 ref 追踪数量避免 effect 依赖 `state.length` 导致重复执行:

```typescript
const starsRef = useRef<Star[]>([])
// effect 依赖 [isDark, addStar] 而非 stars.length
```

### z-index 层级

```
z-0:  繁星背景
z-10: 页面内容
z-20: 祥云层 (pointer-events-none)
z-50: 弹窗/提示
```

## 需求管理

项目需求列表维护在 `todo.ai.md`，格式:
- `[ ]` 未完成
- `[x]` 已完成
