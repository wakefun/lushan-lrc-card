import type { LrcMetadata, LyricLine, ParsedLrc } from '../types/music'

const TAG_RE = /\[([^\]]*)\]/g
const TIME_RE = /^(\d+):(\d{1,2})(?:\.(\d{1,3}))?$/
const META_RE = /^([a-zA-Z][a-zA-Z0-9_-]*):(.*)$/

function parseTimeToMs(tag: string): number | undefined {
  const match = TIME_RE.exec(tag.trim())
  if (!match) return undefined

  const minutes = Number(match[1])
  const seconds = Number(match[2])
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return undefined

  let ms = 0
  const fraction = match[3]
  if (fraction) {
    const fracNum = Number(fraction)
    if (!Number.isFinite(fracNum)) return undefined
    if (fraction.length === 3) ms = fracNum
    else if (fraction.length === 2) ms = fracNum * 10
    else ms = fracNum * 100
  }

  return minutes * 60_000 + seconds * 1_000 + ms
}

function tryApplyMetadata(metadata: LrcMetadata, tag: string): void {
  const m = META_RE.exec(tag.trim())
  if (!m) return

  const key = m[1].trim().toLowerCase()
  const value = m[2].trim()

  if (key === 'ti') metadata.title = value
  else if (key === 'ar') metadata.artist = value
  else if (key === 'al') metadata.album = value
  else if (key === 'offset') {
    const n = Number(value)
    if (Number.isFinite(n)) metadata.offset = n
  }
}

export function parseLrc(lrc: string): ParsedLrc {
  const metadata: LrcMetadata = {}
  const rawLines: Array<{ timeMs: number; text: string; order: number }> = []

  const rows = lrc.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  let order = 0

  for (const row of rows) {
    if (!row) continue

    const tags: string[] = []
    TAG_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = TAG_RE.exec(row)) !== null) tags.push(m[1])

    if (tags.length === 0) continue

    for (const t of tags) tryApplyMetadata(metadata, t)

    const times: number[] = []
    for (const t of tags) {
      const ms = parseTimeToMs(t)
      if (ms != null) times.push(ms)
    }

    if (times.length === 0) continue

    const text = row.replace(TAG_RE, '').trim()
    if (text.length === 0) continue

    for (const timeMs of times) {
      rawLines.push({ timeMs, text, order: order++ })
    }
  }

  const globalOffset = metadata.offset ?? 0
  const lines: LyricLine[] = rawLines
    .map((l) => ({
      timeMs: Math.max(0, l.timeMs + globalOffset),
      text: l.text,
      order: l.order
    }))
    .sort((a, b) => a.timeMs - b.timeMs || a.order - b.order)
    .map(({ timeMs, text }) => ({ timeMs, text }))

  return { metadata, lines }
}

export function findLineIndex(lines: LyricLine[], timeMs: number): number {
  if (lines.length === 0) return -1
  if (timeMs < lines[0].timeMs) return -1

  let lo = 0
  let hi = lines.length - 1

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const t = lines[mid].timeMs
    if (t === timeMs) return mid
    if (t < timeMs) lo = mid + 1
    else hi = mid - 1
  }

  return hi
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}
