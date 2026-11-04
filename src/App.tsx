import { useState } from 'react'
import './App.css'
import AdventureMap from './components/AdventureMap'
import AdventureScene from './components/AdventureScene'
import BottomNavigation, { type NavigationItem } from './components/BottomNavigation'
import GameHeader from './components/GameHeader'
import LevelGame from './components/LevelGame'

type SavedProgress = { unlockedLevel: number; completedLevels: number[]; stars: number; coins: number; xp: number }
const progressKey = 'petualangan-bangun-datar-progress'

function readProgress(): SavedProgress {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) ?? 'null') as Partial<SavedProgress> | null
    if (saved && Array.isArray(saved.completedLevels)) {
      const completedLevels = saved.completedLevels.filter((level) => Number.isInteger(level) && level >= 1 && level <= 30)
      return {
        unlockedLevel: Math.min(30, Math.max(1, Number(saved.unlockedLevel) || 1)),
        completedLevels,
        stars: Math.max(0, Number(saved.stars) || 0),
        coins: Math.max(0, Number(saved.coins) || 0),
        xp: Math.max(0, Number(saved.xp) || 0),
      }
    }
  } catch {
    // Mulai dari progres baru jika data tersimpan tidak dapat dibaca.
  }
  return { unlockedLevel: 1, completedLevels: [], stars: 0, coins: 0, xp: 0 }
}

function App() {
  const [activeTab, setActiveTab] = useState<NavigationItem>('Beranda')
  const [progress, setProgress] = useState<SavedProgress>(readProgress)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [notice, setNotice] = useState('')

  function chooseLevel(level: number) {
    if (level > progress.unlockedLevel) {
      setNotice(`Selesaikan level ${progress.unlockedLevel} terlebih dahulu untuk membuka level ${level}.`)
      return
    }
    setNotice('')
    setSelectedLevel(level)
  }

  function finishLevel(level: number, earnedStars: number, earnedCoins: number, earnedXp: number) {
    const alreadyCompleted = progress.completedLevels.includes(level)
    setProgress((current) => {
      if (current.completedLevels.includes(level)) return current
      const next: SavedProgress = {
        completedLevels: [...current.completedLevels, level].sort((a, b) => a - b),
        unlockedLevel: Math.min(30, Math.max(current.unlockedLevel, level + 1)),
        stars: current.stars + earnedStars,
        coins: current.coins + earnedCoins,
        xp: current.xp + earnedXp,
      }
      localStorage.setItem(progressKey, JSON.stringify(next))
      return next
    })
    setSelectedLevel(null)
    setActiveTab('Peta')
    setNotice(alreadyCompleted ? `Level ${level} selesai!` : `Hebat! Level ${level} selesai: ${earnedStars} bintang, ${earnedCoins} koin, dan ${earnedXp} XP didapat.`)
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
          onBack={() => { setNotice(''); setActiveTab('Beranda') }}
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
      {!isPlaying && <BottomNavigation activeItem={activeTab} onSelect={(item) => { setNotice(''); setActiveTab(item) }} />}
    </main>
  )
}

export default App



