import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

type AdventureMapProps = {
  notice: string
  unlockedLevel: number
  completedLevels: number[]
  levelStars: Record<string, number>
  initialWorld?: number
  initialView?: 'overview' | 'island'
  onBack: () => void
  onSelectLevel: (level: number) => void
  onShowMission: () => void
  onShowCollection: () => void
  onDismissNotice: () => void
}

type MapLevel = { level: number; x: number; y: number }
type WorldMap = { title: string; x: number; y: number; width: number; height: number }

const worldMaps: WorldMap[] = [
  { title: 'Pulau Bentuk', x: 40, y: 132, width: 440, height: 415 },
  { title: 'Hutan Segi Empat', x: 450, y: 255, width: 480, height: 410 },
  { title: 'Pegunungan Segitiga', x: 30, y: 585, width: 470, height: 445 },
  { title: 'Danau Lingkaran', x: 450, y: 720, width: 480, height: 400 },
  { title: 'Kastil Geometri', x: 245, y: 975, width: 450, height: 405 },
]

const islandEntries = [
  { world: 1, x: 29, y: 29, width: 48, height: 27, shape: 'polygon(15% 10%,32% 0,72% 5%,92% 25%,100% 56%,86% 82%,62% 100%,32% 94%,8% 75%,0 46%)' },
  { world: 2, x: 74, y: 44, width: 48, height: 26, shape: 'polygon(12% 24%,27% 6%,57% 0,84% 14%,100% 42%,92% 70%,70% 92%,43% 100%,14% 82%,0 54%)' },
  { world: 3, x: 29, y: 61, width: 48, height: 27, shape: 'polygon(20% 0,48% 4%,78% 0,96% 24%,100% 58%,82% 85%,56% 100%,29% 94%,4% 74%,0 40%)' },
  { world: 4, x: 76, y: 70, width: 48, height: 25, shape: 'polygon(12% 24%,35% 4%,66% 0,91% 14%,100% 45%,91% 76%,68% 96%,37% 100%,12% 82%,0 53%)' },
  { world: 5, x: 52, y: 87, width: 46, height: 24, shape: 'polygon(14% 20%,33% 3%,62% 0,87% 16%,100% 48%,91% 78%,70% 98%,42% 100%,16% 86%,0 55%)' },
]

// Titik-titik mengikuti jalur di lima pulau. Tombol menutup nomor bawaan di ilustrasi.
const levels: MapLevel[] = [
  { level: 1, x: 15.9, y: 23.4 }, { level: 2, x: 30.2, y: 23.5 }, { level: 3, x: 42.0, y: 24.9 },
  { level: 4, x: 13.5, y: 29.2 }, { level: 5, x: 26.5, y: 29.2 }, { level: 6, x: 38.0, y: 29.2 },
  { level: 7, x: 65.9, y: 32.2 }, { level: 8, x: 75.5, y: 34.5 }, { level: 9, x: 83.9, y: 34.8 },
  { level: 10, x: 62.1, y: 38.0 }, { level: 11, x: 75.5, y: 40.5 }, { level: 12, x: 88.3, y: 40.8 },
  { level: 13, x: 18.0, y: 55.6 }, { level: 14, x: 30.4, y: 55.5 }, { level: 15, x: 42.0, y: 56.2 },
  { level: 16, x: 18.8, y: 61.6 }, { level: 17, x: 29.5, y: 61.5 }, { level: 18, x: 40.0, y: 61.4 },
  { level: 19, x: 66.8, y: 64.9 }, { level: 20, x: 77.5, y: 66.5 }, { level: 21, x: 88.7, y: 64.9 },
  { level: 22, x: 69.2, y: 70.4 }, { level: 23, x: 80.3, y: 70.8 }, { level: 24, x: 90.4, y: 70.8 },
  { level: 25, x: 41.3, y: 87.4 }, { level: 26, x: 50.3, y: 87.4 }, { level: 27, x: 59.6, y: 87.4 },
  { level: 28, x: 41.8, y: 92.2 }, { level: 29, x: 50.8, y: 92.2 }, { level: 30, x: 60.4, y: 92.2 },
]

// Susunan enam titik level yang dipakai konsisten pada semua pulau.
const islandLevelPositions: Record<number, { x: number; y: number }> = {
  1: { x: 40, y: 80 },
  2: { x: 49, y: 67 },
  3: { x: 61, y: 58 },
  4: { x: 46, y: 45 },
  5: { x: 59, y: 35 },
  6: { x: 59, y: 20 },
}

function AdventureMap({ notice, unlockedLevel, completedLevels, levelStars, initialWorld = 1, initialView = 'overview', onBack, onSelectLevel, onShowMission, onShowCollection, onDismissNotice }: AdventureMapProps) {
  const [view, setView] = useState<'overview' | 'island'>(initialView)
  const [selectedWorld, setSelectedWorld] = useState(initialWorld)
  const [transitioning, setTransitioning] = useState(false)
  const transitionTimers = useRef<number[]>([])
  const world = worldMaps[selectedWorld - 1]
  const worldLevels = levels.filter(({ level }) => level >= (selectedWorld - 1) * 6 + 1 && level <= selectedWorld * 6)

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(onDismissNotice, 3200)
    return () => window.clearTimeout(timeout)
  }, [notice, onDismissNotice])

  useEffect(() => () => transitionTimers.current.forEach((timer) => window.clearTimeout(timer)), [])

  function changeMap(target: 'overview' | 'island', worldNumber = selectedWorld) {
    if (transitioning) return
    setSelectedWorld(worldNumber)
    setTransitioning(true)
    transitionTimers.current.forEach((timer) => window.clearTimeout(timer))
    transitionTimers.current = [
      window.setTimeout(() => setView(target), 950),
      window.setTimeout(() => setTransitioning(false), 1900),
    ]
  }

  return (
    <section className={`adventure-map adventure-map--${view}${view === 'island' ? ` adventure-map--world-${selectedWorld}` : ''}${transitioning ? ' is-transitioning' : ''}`} aria-label={view === 'overview' ? 'Peta semua pulau' : `Peta ${world.title}`}>
      <div className={`adventure-map__artwork${view === 'island' ? ' adventure-map__artwork--island' : ''}`}>
        <img src={view === 'overview' ? '/adventure-map.jpg' : '/island-map.png'} alt={view === 'overview' ? 'Peta petualangan dengan lima pulau' : `Peta ${world.title}`} />
        {view === 'overview' ? (
          <>
            <button className="adventure-map__back" type="button" onClick={onBack} aria-label="Kembali ke beranda"><Icon name="chevron" /></button>
            <button className="adventure-map__mission-link" onClick={onShowMission} type="button" aria-label="Lihat misi harian" />
            <button className="adventure-map__collection-link" onClick={onShowCollection} type="button" aria-label="Lihat koleksi bintang" />
            {levels.map(({ level, x, y }) => {
              const completed = completedLevels.includes(level)
              const rating = levelStars[String(level)] ?? 0
              const locked = level > unlockedLevel
              const current = level === unlockedLevel
              return <button key={level} aria-label={`Lihat level ${level} di Pulau ${Math.ceil(level / 6)}${completed ? `, selesai, ${rating} dari 3 bintang` : locked ? ', terkunci' : ', terbuka'}`} className={`adventure-map__hotspot adventure-map__hotspot--overview${locked ? ' is-locked' : ''}${completed ? ' is-completed' : ''}${current ? ' is-current' : ''}`} onClick={() => changeMap('island', Math.ceil(level / 6))} style={{ left: `${x}%`, top: `${y}%` }} type="button"><span className="adventure-map__badge">{level}</span>{completed && <span className="adventure-map__rating" aria-label={`${rating} dari 3 bintang`}>{[1, 2, 3].map((star) => <i key={star} className={star <= rating ? 'is-earned' : ''} aria-hidden="true">★</i>)}</span>}</button>
            })}
            {islandEntries.map(({ world: worldNumber, x, y, width, height, shape }) => <button key={worldNumber} className="adventure-map__island-entry" style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%`, clipPath: shape }} onClick={() => changeMap('island', worldNumber)} aria-label={`Masuk ${worldMaps[worldNumber - 1].title}`} type="button"><span>Masuk pulau <b>{worldNumber}</b>　→</span></button>)}
          </>
        ) : (
          <>
            <button className="adventure-map__back adventure-map__back--island" type="button" onClick={() => changeMap('overview')} aria-label="Kembali ke semua pulau"><Icon name="chevron" /></button>
            {worldLevels.map(({ level, x, y }) => {
              const completed = completedLevels.includes(level)
              const rating = levelStars[String(level)] ?? 0
              const locked = level > unlockedLevel
              const current = level === unlockedLevel
              const localLevel = ((level - 1) % 6) + 1
              const customIslandPosition = islandLevelPositions[localLevel]
              const localX = customIslandPosition?.x ?? ((x * 941 / 100 - world.x) / world.width) * 100
              const localY = customIslandPosition?.y ?? ((y * 1380 / 100 - world.y) / world.height) * 100
              return <button key={level} aria-label={`Level ${level}${completed ? `, selesai, ${rating} dari 3 bintang` : locked ? ', terkunci' : ', terbuka'}`} className={`adventure-map__hotspot${locked ? ' is-locked' : ''}${completed ? ' is-completed' : ''}${current ? ' is-current' : ''}`} onClick={() => onSelectLevel(level)} style={{ left: `${localX}%`, top: `${localY}%` }} type="button"><span className="adventure-map__badge">{level}</span>{completed && <span className="adventure-map__rating" aria-label={`${rating} dari 3 bintang`}>{[1, 2, 3].map((star) => <i key={star} className={star <= rating ? 'is-earned' : ''} aria-hidden="true">★</i>)}</span>}</button>
            })}
          </>
        )}
      </div>
      {transitioning && <div className="adventure-map__cloud-transition" aria-hidden="true">
        <img className="adventure-map__cloud-bank adventure-map__cloud-bank--left" src="/cloud-bank.png" alt="" />
        <img className="adventure-map__cloud-bank adventure-map__cloud-bank--right" src="/cloud-bank.png" alt="" />
        <img className="adventure-map__cloud-puff adventure-map__cloud-puff--center" src="/cloud-puff.png" alt="" />
        <img className="adventure-map__cloud-puff adventure-map__cloud-puff--upper" src="/cloud-puff.png" alt="" />
        <img className="adventure-map__cloud-puff adventure-map__cloud-puff--lower" src="/cloud-puff.png" alt="" />
        <img className="adventure-map__cloud-puff adventure-map__cloud-puff--bottom" src="/cloud-puff.png" alt="" />
      </div>}
      {notice && <button className="adventure-map__notice" onClick={onDismissNotice} type="button">{notice}<span aria-hidden="true">　×</span></button>}
    </section>
  )
}

export default AdventureMap





