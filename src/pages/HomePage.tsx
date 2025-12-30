import { useAppStore } from '../store/app'
import { MountainCard } from '../components/MountainCard'
import { InkFilters } from '../components/InkFilters'
import { ThemeToggle } from '../components/ThemeToggle'
import { BackgroundEffects } from '../components/BackgroundEffects'
import { MusicToggle } from '../components/MusicToggle'
import { useBreathingAnimation } from '../hooks/useBreathingAnimation'
import type { BackgroundMusicController } from '../hooks/useBackgroundMusic'

interface HomePageProps {
  music: BackgroundMusicController
}

export default function HomePage({ music }: HomePageProps) {
  const { artists, setCurrentArtist } = useAppStore()
  const activeIds = useBreathingAnimation(artists, 2)

  return (
    <div className="relative h-full w-full bg-[var(--bg-paper)] bg-paper-texture overflow-x-hidden overflow-y-auto transition-colors duration-500">
      <InkFilters />
      <BackgroundEffects />

      <header className="relative z-10 pt-[max(2.5rem,calc(1rem+var(--safe-area-inset-top)))] pb-4 px-6 flex flex-col items-center">
        <div className="absolute top-[max(1rem,var(--safe-area-inset-top))] left-4">
          <MusicToggle
            enabled={music.enabled}
            playing={music.playing}
            blocked={music.blocked}
            onToggle={music.toggle}
          />
        </div>
        <div className="absolute top-[max(1rem,var(--safe-area-inset-top))] right-4 overflow-visible">
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-serif font-bold text-ink-900 dark:text-ink-100 tracking-[0.1em]">《庐山音乐节》</h1>
        <div className="w-10 h-0.5 bg-ink-900/20 dark:bg-ink-100/20 mt-3 rounded-full" />
        <p className="text-ink-500 dark:text-ink-400 font-serif text-sm mt-2 tracking-widest">歌词本</p>
      </header>

      <main className="relative z-10 px-4 pb-[max(4rem,calc(2rem+var(--safe-area-inset-bottom)))] max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 items-end">
          {artists.map((artist, index) => (
            <MountainCard
              key={artist.id}
              artist={artist}
              onClick={setCurrentArtist}
              index={index}
              isBreathing={activeIds.has(artist.id)}
            />
          ))}
        </div>
      </main>

    </div>
  )
}
