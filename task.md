# 歌词播放器 PWA 项目规划

## 技术栈

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | React + TypeScript | 组件化开发，类型安全 |
| 构建 | Vite | 快速开发，PWA支持好 |
| 样式 | Tailwind CSS | 快速UI开发 |
| 动画/手势 | Framer Motion | 内置drag+动画，避免多库冲突 |
| 状态管理 | Zustand | 轻量级，适合小型应用 |
| PWA | vite-plugin-pwa (Workbox) | Service Worker自动生成 |
| 持久存储 | IndexedDB (idb-keyval) | 双保险备份，防止缓存被清除 |

## 核心技术难点

### 1. 离线优先策略（双保险）

**存储方案：Service Worker Cache + IndexedDB**

- Service Worker Cache（主）：拦截请求，提供离线体验
- IndexedDB（备份）：持久化存储，防止iOS Safari清除缓存
- 启动流程：
  1. 优先从 Service Worker Cache 读取
  2. Cache 失效时从 IndexedDB 恢复
  3. 首次加载时同时写入两处
- 更新策略：后台静默更新，不打断使用

### 2. 无音频的"播放"引擎
- 传统播放器：`Audio.currentTime` → 歌词行
- 本应用：`滑动手势/进度` → 歌词行
- 需要虚拟时间轴，滑动修改 progress 状态

### 3. 手势冲突处理
- 同一界面：上下滑动调进度 vs 左右滑动切歌
- 解决方案：手势锁定（根据初始移动方向锁定轴向）
- 速度阈值：快速滑动切歌，慢速拖动调进度

### 4. 水墨山水视觉效果
- SVG + 滤镜（feTurbulence + feDisplacementMap）
- 半透明黑灰渐变营造层次感
- 山的大小 = f(歌曲数量)

### 5. LRC 解析
- 支持格式：`[mm:ss.xx]`、`[mm:ss.xxx]`、`[m:ss]`
- 多时间戳：`[00:10.00][00:12.00]歌词`
- 元数据标签：`[ti:]`、`[ar:]`、`[offset:]`
- 时间查找：二分搜索

## 数据结构设计

当前 db.json 结构已包含：
- `list[].singer`: 歌手信息
- `list[].song_list[]`: 歌曲列表，含 `lyric` 字段（LRC原文）

解析后的歌词结构：
```typescript
interface LyricLine {
  timeMs: number;  // 毫秒时间戳
  text: string;    // 歌词文本
}

interface ParsedLyric {
  title?: string;
  artist?: string;
  offset?: number;
  lines: LyricLine[];
}
```

