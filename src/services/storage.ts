import { createStore, get, set, del, clear } from 'idb-keyval'
import type { DbRoot, ParsedLrc } from '../types/music'

const store = createStore('lushan-lrc-card', 'data')

const KEYS = {
  DB_JSON: 'library:dbJson',
  IMPORTED_AT: 'library:importedAt',
  lyric: (songId: string) => `lyric:${songId}`,
  theme: 'ui:theme'
}

export const Storage = {
  async getDbJson(): Promise<DbRoot | undefined> {
    return get<DbRoot>(KEYS.DB_JSON, store)
  },

  async setDbJson(data: DbRoot): Promise<void> {
    await set(KEYS.DB_JSON, data, store)
    await set(KEYS.IMPORTED_AT, Date.now(), store)
  },

  async getParsedLyric(songId: string): Promise<ParsedLrc | undefined> {
    return get<ParsedLrc>(KEYS.lyric(songId), store)
  },

  async setParsedLyric(songId: string, parsed: ParsedLrc): Promise<void> {
    await set(KEYS.lyric(songId), parsed, store)
  },

  async getTheme(): Promise<'light' | 'dark' | undefined> {
    return get(KEYS.theme, store)
  },

  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await set(KEYS.theme, theme, store)
  },

  async clearLyric(songId: string): Promise<void> {
    await del(KEYS.lyric(songId), store)
  },

  async clearAll(): Promise<void> {
    await clear(store)
  }
}
