import { useState } from 'react'
import './App.css'
import AdventureMap from './components/AdventureMap'
import AdventureScene from './components/AdventureScene'
import BottomNavigation, { type NavigationItem } from './components/BottomNavigation'
import GameHeader from './components/GameHeader'
import LevelGame from './components/LevelGame'

type SavedProgress = { unlockedLevel: number; completedLevels: number[]; levelStars: Record<string, number>; stars: number; coins: number; xp: number }
const progressKey = 'petualangan-bangun-datar-progress'

function readProgress(): SavedProgress {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) ?? 'null') as Partial<SavedProgress> | null
    if (saved && Array.isArray(saved.completedLevels)) {
      const completedLevels = saved.completedLevels.filter((level) => Number.isInteger(level) && level >= 1 && level <= 30)
      const savedLevelStars = saved.levelStars && typeof saved.levelStars === 'object' ? saved.levelStars : {}
      const levelStars = Object.fromEntries(completedLevels.map((level) => {
        const rating = Number(savedLevelStars[String(level)])
        return [String(level), Number.isInteger(rating) && rating >= 1 && rating <= 3 ? rating : 1]
      }))
      return {
        unlockedLevel: Math.min(30, Math.max(1, Number(saved.unlockedLevel) || 1)),
        completedLevels,
        levelStars,
        stars: Math.max(0, Number(saved.stars) || 0),
        coins: Math.max(0, Number(saved.coins) || 0),
        xp: Math.max(0, Number(saved.xp) || 0),
      }
    }
  } catch {
    // Mulai dari progres baru jika data tersimpan tidak dapat dibaca.
  }
  return { unlockedLevel: 1, completedLevels: [], levelStars: {}, stars: 0, coins: 0, xp: 0 }
}

function App() {
  const [activeTab, setActiveTab] = useState<NavigationItem>('Beranda')
  const [progress, setProgress] = useState<SavedProgress>(readProgress)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [mapWorld, setMapWorld] = useState(1)
  const [mapResumeView, setMapResumeView] = useState<'overview' | 'island'>('overview')
  const [notice, setNotice] = useState('')

  function chooseLevel(level: number) {
    if (level > progress.unlockedLevel) {
      setNotice(`Selesaikan level ${progress.unlockedLevel} terlebih dahulu untuk membuka level ${level}.`)
      return
    }
    setMapWorld(Math.ceil(level / 6))
    setMapResumeView('island')
    setNotice('')
    setSelectedLevel(level)
  }

  function finishLevel(level: number, earnedStars: number, earnedCoins: number, earnedXp: number) {
    const alreadyCompleted = progress.completedLevels.includes(level)
    const previousBest = progress.levelStars[String(level)] ?? 0
    const bestStars = Math.max(previousBest, earnedStars)
    const newStars = bestStars - previousBest
    setProgress((current) => {
      const currentBest = current.levelStars[String(level)] ?? 0
      const improvedStars = Math.max(currentBest, earnedStars)
      if (current.completedLevels.includes(level) && improvedStars === currentBest) return current
      const next: SavedProgress = {
        completedLevels: [...current.completedLevels, level].sort((a, b) => a - b),
        levelStars: { ...current.levelStars, [String(level)]: improvedStars },
        unlockedLevel: Math.min(30, Math.max(current.unlockedLevel, level + 1)),
        stars: current.stars + (current.completedLevels.includes(level) ? improvedStars - currentBest : earnedStars),
        coins: current.coins + (current.completedLevels.includes(level) ? 0 : earnedCoins),
        xp: current.xp + (current.completedLevels.includes(level) ? 0 : earnedXp),
      }
      localStorage.setItem(progressKey, JSON.stringify(next))
      return next
    })
    setSelectedLevel(null)
    setActiveTab('Peta')
    setNotice(alreadyCompleted
      ? newStars > 0 ? `Rekor level ${level} meningkat menjadi ${bestStars} bintang!` : `Level ${level} selesai! Rekor terbaik ${previousBest} bintang.`
      : `Hebat! Level ${level} selesai: ${earnedStars} bintang, ${earnedCoins} koin, dan ${earnedXp} XP didapat.`)
  }

  const isPlaying = selectedLevel !== null
  const isOnMap = activeTab === 'Peta'

  return (
    <main className={`game-home${isOnMap ? ' game-home--map' : ''}${isPlaying ? ' game-home--playing' : ''}`}>
      {isPlaying ? (
        <LevelGame
          level={selectedLevel}
          completed={progress.completedLevels.includes(selectedLevel)}
          onBack={() => setSelectedLevel(null)}
          onComplete={finishLevel}
        />
      ) : isOnMap ? (
        <AdventureMap
          notice={notice}
          unlockedLevel={progress.unlockedLevel}
          completedLevels={progress.completedLevels}
          levelStars={progress.levelStars}
          initialWorld={mapWorld}
          initialView={mapResumeView}
          onBack={() => { setNotice(''); setMapResumeView('overview'); setActiveTab('Beranda') }}
          onSelectLevel={chooseLevel}
          onShowMission={() => setNotice(`Misi harian: selesaikan 3 level dengan nilai sempurna. Progres ${Math.min(progress.completedLevels.length, 3)}/3.`)}
          onShowCollection={() => setNotice(`Koleksi: ${progress.stars} bintang, ${progress.coins} koin, dan ${progress.xp} XP.`)}
          onDismissNotice={() => setNotice('')}
        />
      ) : (
        <>
          <div className="game-home__landscape" aria-hidden="true" />
          <GameHeader starCount={120 + progress.stars} />
          <AdventureScene onStartAdventure={() => { setNotice(''); setActiveTab('Peta') }} />
        </>
      )}
      {!isPlaying && <BottomNavigation activeItem={activeTab} onSelect={(item) => { setNotice(''); setMapResumeView('overview'); setActiveTab(item) }} />}
    </main>
  )
}

export default App



