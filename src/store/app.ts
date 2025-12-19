import { create } from 'zustand'
import type { Artist, Song, DbRoot, DbEntry } from '../types/music'
import { Storage } from '../services/storage'
import dbJson from '../../db.json'

interface AppState {
  artists: Artist[]
  currentArtist: Artist | null
  songs: Song[]
  currentSongIndex: number
  theme: 'light' | 'dark'
  setCurrentArtist: (artist: Artist | null) => void
  setSongs: (songs: Song[]) => void
  setCurrentSongIndex: (index: number) => void
  toggleTheme: () => Promise<void>
  initData: () => Promise<void>
}

function mapDbToArtists(data: DbRoot): Artist[] {
  return data.list.map((entry: DbEntry) => ({
    id: String(entry.singer.id),
    name: entry.singer.name,
    songCount: entry.song_list.length
  }))
}

function mapDbToSongs(entry: DbEntry): Song[] {
  return entry.song_list.map((song) => ({
    id: String(song.songid),
    name: song.songname,
    albumName: song.albumname,
    artistName: entry.singer.name,
    durationSec: song.interval,
    lyricRaw: song.lyric
  }))
}

export const useAppStore = create<AppState>((set, get) => ({
  artists: [],
  currentArtist: null,
  songs: [],
  currentSongIndex: 0,
  theme: 'dark',

  setCurrentArtist: (artist) => {
    if (!artist) {
      set({ currentArtist: null, songs: [], currentSongIndex: 0 })
      return
    }
    const data = dbJson as DbRoot
    const entry = data.list.find((e) => String(e.singer.id) === artist.id)
    if (entry) {
      set({
        currentArtist: artist,
        songs: mapDbToSongs(entry),
        currentSongIndex: 0
      })
    }
  },

  setSongs: (songs) => set({ songs }),

  setCurrentSongIndex: (index) => {
    const { songs } = get()
    if (index >= 0 && index < songs.length) {
      set({ currentSongIndex: index })
    }
  },

  toggleTheme: async () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: newTheme })
    await Storage.setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  },

  initData: async () => {
    const data = dbJson as DbRoot
    await Storage.setDbJson(data)
    const theme = await Storage.getTheme()
    const artists = mapDbToArtists(data)
    set({ artists, theme: theme ?? 'dark' })
    document.documentElement.classList.toggle('dark', (theme ?? 'dark') === 'dark')
  }
}))
