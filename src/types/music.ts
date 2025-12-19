export interface DbSinger {
  id: number
  mid: string
  name: string
}

export interface DbSong {
  songid: number
  songmid: string
  songname: string
  albumname: string
  singer: DbSinger[]
  interval: number
  lyric: string
}

export interface DbEntry {
  singer: DbSinger
  song_list: DbSong[]
}

export interface DbRoot {
  latest_update: number
  list: DbEntry[]
}

export interface Artist {
  id: string
  name: string
  songCount: number
}

export interface Song {
  id: string
  name: string
  albumName: string
  artistName: string
  durationSec: number
  lyricRaw: string
}

export interface LyricLine {
  timeMs: number
  text: string
}

export interface LrcMetadata {
  title?: string
  artist?: string
  album?: string
  offset?: number
}

export interface ParsedLrc {
  metadata: LrcMetadata
  lines: LyricLine[]
}
