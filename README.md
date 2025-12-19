# 庐山歌词本 (Lushan Lyrics PWA)

一款中国水墨风格的离线歌词播放器 PWA 应用，专为音乐节现场弱网环境设计。

## 特性

### 核心功能
- **离线优先架构** - Service Worker + IndexedDB 双重缓存，无网络也可使用
- **实时歌词同步** - 基于 LRC 格式的精准时间轴歌词显示
- **手势交互** - 点击歌词跳转进度，水平滑动切换歌曲
- **PWA 安装** - 可添加至主屏幕，全屏应用体验
- **背景音乐** - 自动播放背景音乐，支持静音切换
- **微信引导** - 检测微信浏览器并引导用户使用外部浏览器打开

### 视觉设计
- **水墨山水风格** - 程序化生成的山体 SVG，每位歌手独特造型
- **日夜主题切换** - 日间祥云飘动，夜间繁星闪烁
- **呼吸动画** - 山体此起彼伏的缩放效果
- **卡片堆叠感** - 歌词卡片层叠展示剩余歌曲数量

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| UI 框架 | React 19 + TypeScript 5.7 | 组件化架构 |
| 构建工具 | Vite 6.0 | 快速开发 + PWA 支持 |
| 样式 | Tailwind CSS 3.4 | 原子化 CSS + 自定义动画 |
| 状态管理 | Zustand 5.0 | 轻量级全局状态 |
| 动画 | Framer Motion 12.0 | 手势识别 + 弹簧物理 |
| PWA | vite-plugin-pwa (Workbox) | SW 生成 + 离线缓存 |
| 存储 | IndexedDB (idb-keyval) | 持久化离线数据 |

## 项目结构

```
src/
├── components/           # UI 组件
│   ├── LyricCard.tsx      # 歌词卡片（手势 + 滚动）
│   ├── MountainCard.tsx   # 水墨山体（程序化 SVG）
│   ├── BackgroundEffects  # 背景特效（祥云/繁星）
│   ├── ThemeToggle.tsx    # 主题切换按钮
│   ├── MusicToggle.tsx    # 音乐开关按钮
│   ├── InstallPrompt.tsx  # PWA 安装提示
│   └── WeChatPrompt.tsx   # 微信浏览器引导页
├── pages/
│   ├── HomePage.tsx       # 歌手选择页
│   └── LyricPage.tsx      # 歌词播放页
├── store/
│   └── app.ts             # Zustand 状态管理
├── services/
│   └── storage.ts         # IndexedDB 封装
├── hooks/
│   ├── usePWA.ts          # PWA 相关 hooks
│   ├── useBackgroundMusic.ts  # 背景音乐控制
│   └── useBreathingAnimation.ts  # 呼吸动画
├── utils/
│   ├── lrc.ts             # LRC 解析工具
│   └── animations.ts      # Framer Motion 预设
├── assets/
│   ├── clouds/            # 祥云 SVG (5 种)
│   └── stars/             # 泼墨繁星 SVG
└── types/
    └── music.ts           # 类型定义
```

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览生产版本
```bash
pnpm preview
```

## 核心组件说明

### LyricCard - 歌词卡片
- **手势处理**: 区分 X 轴（切歌）和 Y 轴（调进度）
- **歌词同步**: RAF 定时器 + 二分查找定位当前行
- **平滑滚动**: Framer Motion 弹簧动画居中当前歌词

### MountainCard - 水墨山体
- **程序化生成**: 歌手名作为种子生成确定性山形
- **贝塞尔曲线**: 二次贝塞尔生成自然山峰轮廓
- **水墨滤镜**: SVG turbulence + displacement 实现墨晕效果

### BackgroundEffects - 背景特效
- **日间祥云**: 5 种 SVG 变体，10-18秒穿越屏幕，双击可加速飞出
- **夜间繁星**: 泼墨风格随机闪烁，控制 8-20 颗同时可见

## 数据格式

### db.json 结构
```typescript
interface DbRoot {
  latest_update: number       // 更新时间戳
  list: DbEntry[]
}

interface DbEntry {
  singer: { id, mid, name }
  song_list: DbSong[]
}

interface DbSong {
  songid: number
  songname: string
  albumname: string
  interval: number            // 时长（秒）
  lyric: string               // LRC 格式歌词
}
```

### LRC 格式
```
[ti:歌曲名]
[ar:歌手名]
[al:专辑名]
[00:10.50]第一行歌词
[00:15.00]第二行歌词
```

## 离线策略

采用双重备份机制确保可靠性：

1. **Service Worker 缓存** - Workbox 自动预缓存静态资源
2. **IndexedDB 存储** - 数据持久化，抵御缓存清理
3. **内置 db.json** - 打包时内嵌，保证基础可用

## 动画性能优化

- 仅使用 `transform` + `opacity` 属性（GPU 加速）
- RAF 定时器替代 setInterval（避免掉帧）
- React.memo 避免不必要重渲染
- CSS `contain` 属性限制重绘范围
- 二分查找歌词行（O(log n) 复杂度）

## 自定义配色

Tailwind 配置了水墨灰度色板：

```javascript
// tailwind.config.js
colors: {
  ink: {
    50: '#f7f7f7',   // 最浅
    100: '#e3e3e3',
    // ...
    900: '#171c28',
    950: '#0b1220'   // 最深
  }
}
```

## 浏览器 API

- **Screen Wake Lock** - 防止歌词页面息屏
- **beforeinstallprompt** - 自定义 PWA 安装流程
- **IndexedDB** - 离线数据持久化
- **History API** - 浏览器返回按钮正确导航
- **Clipboard API** - 复制链接（含 execCommand 回退）

## 浏览器兼容

- 微信内置浏览器会显示引导页，提示用户使用外部浏览器打开
- 支持 iOS Safari "添加到主屏幕"
- 支持 Android Chrome PWA 安装

## 许可证

MIT License
