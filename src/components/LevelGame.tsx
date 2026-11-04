import { useEffect, useRef, useState } from 'react'
import explorerImage from '../assets/game-explorer.png'

type Question = {
  topic: string
  symbol: string
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

type LevelGameProps = {
  level: number
  completed: boolean
  onBack: () => void
  onComplete: (level: number, stars: number, coins: number, xp: number) => void
}

const questions: Question[] = [
  { topic: 'Pulau Bentuk', symbol: '□', prompt: 'Berapa banyak sisi yang dimiliki persegi?', options: ['3 sisi', '4 sisi', '5 sisi', '6 sisi'], answer: '4 sisi', explanation: 'Persegi mempunyai empat sisi yang sama panjang.' },
  { topic: 'Pulau Bentuk', symbol: '△', prompt: 'Bangun datar apa yang mempunyai tiga sisi?', options: ['Lingkaran', 'Persegi', 'Segitiga', 'Persegi panjang'], answer: 'Segitiga', explanation: 'Segitiga selalu mempunyai tiga sisi dan tiga sudut.' },
  { topic: 'Pulau Bentuk', symbol: '○', prompt: 'Apa yang benar tentang lingkaran?', options: ['Memiliki 3 sudut', 'Memiliki 4 sisi', 'Tidak memiliki sudut', 'Memiliki 5 sisi'], answer: 'Tidak memiliki sudut', explanation: 'Lingkaran berbentuk lengkung dan tidak memiliki titik sudut.' },
  { topic: 'Pulau Bentuk', symbol: '▭', prompt: 'Persegi panjang memiliki ... pasang sisi berhadapan yang sama panjang.', options: ['1', '2', '3', '4'], answer: '2', explanation: 'Kedua pasang sisi yang berhadapan pada persegi panjang sama panjang.' },
  { topic: 'Pulau Bentuk', symbol: '◇', prompt: 'Ciri utama persegi adalah ...', options: ['Semua sisinya sama panjang', 'Tidak punya sudut', 'Hanya punya 3 sisi', 'Sisinya melengkung'], answer: 'Semua sisinya sama panjang', explanation: 'Keempat sisi persegi sama panjang dan semua sudutnya siku-siku.' },
  { topic: 'Pulau Bentuk', symbol: '△', prompt: 'Jumlah besar sudut dalam sebuah segitiga adalah ...', options: ['90°', '180°', '270°', '360°'], answer: '180°', explanation: 'Jika dijumlahkan, tiga sudut dalam segitiga selalu 180°.' },
  { topic: 'Hutan Segi Empat', symbol: '▱', prompt: 'Bangun segi empat memiliki berapa sisi?', options: ['3', '4', '5', '6'], answer: '4', explanation: 'Segi empat adalah bangun datar yang mempunyai empat sisi.' },
  { topic: 'Hutan Segi Empat', symbol: '▱', prompt: 'Pada jajar genjang, sisi yang berhadapan selalu ...', options: ['Melengkung', 'Sejajar', 'Tegak lurus', 'Berbeda panjang'], answer: 'Sejajar', explanation: 'Jajar genjang memiliki dua pasang sisi berhadapan yang sejajar.' },
  { topic: 'Hutan Segi Empat', symbol: '◇', prompt: 'Belah ketupat memiliki ...', options: ['Empat sisi sama panjang', 'Tiga sisi sama panjang', 'Satu sisi lengkung', 'Lima sudut'], answer: 'Empat sisi sama panjang', explanation: 'Keempat sisi belah ketupat memiliki panjang yang sama.' },
  { topic: 'Hutan Segi Empat', symbol: '⏢', prompt: 'Trapesium memiliki paling sedikit ... pasang sisi sejajar.', options: ['Tidak ada', 'Satu', 'Dua', 'Tiga'], answer: 'Satu', explanation: 'Trapesium memiliki satu pasang sisi sejajar.' },
  { topic: 'Hutan Segi Empat', symbol: '▭', prompt: 'Persegi panjang berukuran 8 cm × 4 cm. Berapa kelilingnya?', options: ['12 cm', '24 cm', '32 cm', '48 cm'], answer: '24 cm', explanation: 'Keliling = 2 × (8 + 4) = 24 cm.' },
  { topic: 'Hutan Segi Empat', symbol: '□', prompt: 'Persegi memiliki sisi 5 cm. Berapa kelilingnya?', options: ['10 cm', '15 cm', '20 cm', '25 cm'], answer: '20 cm', explanation: 'Keliling persegi = 4 × sisi = 4 × 5 = 20 cm.' },
  { topic: 'Pegunungan Segitiga', symbol: '△', prompt: 'Setiap sudut pada segitiga sama sisi besarnya ...', options: ['30°', '45°', '60°', '90°'], answer: '60°', explanation: 'Tiga sudut sama besar dan jumlahnya 180°, jadi setiap sudut 60°.' },
  { topic: 'Pegunungan Segitiga', symbol: '△', prompt: 'Segitiga sama kaki memiliki ...', options: ['Dua sisi sama panjang', 'Tiga sudut siku-siku', 'Empat sisi', 'Satu sisi lengkung'], answer: 'Dua sisi sama panjang', explanation: 'Segitiga sama kaki memiliki sepasang sisi yang sama panjang.' },
  { topic: 'Pegunungan Segitiga', symbol: '◿', prompt: 'Segitiga siku-siku selalu memiliki satu sudut sebesar ...', options: ['45°', '60°', '90°', '180°'], answer: '90°', explanation: 'Sudut siku-siku besarnya tepat 90°.' },
  { topic: 'Pegunungan Segitiga', symbol: '△', prompt: 'Segitiga memiliki alas 6 cm dan tinggi 4 cm. Berapa luasnya?', options: ['10 cm²', '12 cm²', '20 cm²', '24 cm²'], answer: '12 cm²', explanation: 'Luas segitiga = ½ × alas × tinggi = ½ × 6 × 4 = 12 cm².' },
  { topic: 'Pegunungan Segitiga', symbol: '▭', prompt: 'Berapa luas persegi panjang dengan panjang 8 cm dan lebar 5 cm?', options: ['13 cm²', '26 cm²', '40 cm²', '80 cm²'], answer: '40 cm²', explanation: 'Luas persegi panjang = panjang × lebar = 8 × 5 = 40 cm².' },
  { topic: 'Pegunungan Segitiga', symbol: '□', prompt: 'Sisi persegi 6 cm. Berapa luasnya?', options: ['12 cm²', '24 cm²', '30 cm²', '36 cm²'], answer: '36 cm²', explanation: 'Luas persegi = sisi × sisi = 6 × 6 = 36 cm².' },
  { topic: 'Danau Lingkaran', symbol: '○', prompt: 'Jari-jari lingkaran 7 cm. Berapa diameternya?', options: ['3,5 cm', '7 cm', '14 cm', '21 cm'], answer: '14 cm', explanation: 'Diameter = 2 × jari-jari = 2 × 7 = 14 cm.' },
  { topic: 'Danau Lingkaran', symbol: '◉', prompt: 'Diameter sebuah lingkaran 12 cm. Jari-jarinya adalah ...', options: ['3 cm', '6 cm', '12 cm', '24 cm'], answer: '6 cm', explanation: 'Jari-jari adalah setengah diameter, jadi 12 ÷ 2 = 6 cm.' },
  { topic: 'Danau Lingkaran', symbol: '○', prompt: 'Rumus luas lingkaran adalah ...', options: ['π × r', '2 × π × r', 'π × r × r', '4 × sisi'], answer: 'π × r × r', explanation: 'Luas lingkaran dihitung dengan rumus π × jari-jari × jari-jari.' },
  { topic: 'Danau Lingkaran', symbol: '◉', prompt: 'Keliling lingkaran dengan jari-jari 7 cm adalah ... (π = 22/7)', options: ['22 cm', '44 cm', '77 cm', '154 cm'], answer: '44 cm', explanation: 'Keliling = 2 × π × r = 2 × 22/7 × 7 = 44 cm.' },
  { topic: 'Danau Lingkaran', symbol: '⬡', prompt: 'Bangun beraturan memiliki ...', options: ['Sisi dan sudut yang sama besar', 'Hanya sisi lengkung', 'Tiga sisi saja', 'Tidak memiliki sudut'], answer: 'Sisi dan sudut yang sama besar', explanation: 'Pada bangun beraturan, semua sisi dan semua sudutnya sama.' },
  { topic: 'Danau Lingkaran', symbol: '▱', prompt: 'Cara mencari keliling bangun datar adalah ...', options: ['Menjumlahkan panjang semua sisi', 'Mengalikan semua sudut', 'Membagi luas dengan sisi', 'Menghitung jumlah warna'], answer: 'Menjumlahkan panjang semua sisi', explanation: 'Keliling adalah total panjang seluruh sisi di sekeliling bangun.' },
  { topic: 'Kastil Geometri', symbol: '⬠', prompt: 'Bangun datar yang memiliki lima sisi disebut ...', options: ['Segitiga', 'Segi empat', 'Segi lima', 'Segi enam'], answer: 'Segi lima', explanation: 'Awalan penta berarti lima; segi lima memiliki lima sisi.' },
  { topic: 'Kastil Geometri', symbol: '◇', prompt: 'Jumlah sudut dalam segi empat adalah ...', options: ['180°', '270°', '360°', '540°'], answer: '360°', explanation: 'Jumlah keempat sudut dalam semua segi empat adalah 360°.' },
  { topic: 'Kastil Geometri', symbol: '⬡', prompt: 'Berapa banyak sisi yang dimiliki segi enam?', options: ['5 sisi', '6 sisi', '7 sisi', '8 sisi'], answer: '6 sisi', explanation: 'Segi enam memiliki enam sisi dan enam titik sudut.' },
  { topic: 'Kastil Geometri', symbol: '∠', prompt: 'Sudut lancip besarnya ...', options: ['Kurang dari 90°', 'Tepat 90°', 'Lebih dari 90°', 'Tepat 180°'], answer: 'Kurang dari 90°', explanation: 'Sudut lancip lebih kecil dari sudut siku-siku (90°).' },
  { topic: 'Kastil Geometri', symbol: '▭', prompt: 'Persegi panjang panjangnya 12 cm dan lebarnya 7 cm. Kelilingnya ...', options: ['19 cm', '26 cm', '38 cm', '84 cm'], answer: '38 cm', explanation: 'Keliling = 2 × (12 + 7) = 38 cm.' },
  { topic: 'Kastil Geometri', symbol: '△', prompt: 'Sebuah segitiga memiliki sisi 5 cm, 6 cm, dan 7 cm. Kelilingnya ...', options: ['11 cm', '18 cm', '30 cm', '42 cm'], answer: '18 cm', explanation: 'Keliling segitiga = 5 + 6 + 7 = 18 cm.' },
]

function LevelGame({ level, completed, onBack, onComplete }: LevelGameProps) {
  const [stage, setStage] = useState<'details' | 'explore' | 'quiz' | 'result'>('details')
  const [paused, setPaused] = useState(false)
  const [playerX, setPlayerX] = useState(7)
  const [jumping, setJumping] = useState(false)
  const [walking, setWalking] = useState(false)
  const [facing, setFacing] = useState<1 | -1>(1)
  const walkTimer = useRef<number | null>(null)
  const jumpTimer = useRef<number | null>(null)
  const [lives, setLives] = useState(3)
  const [collected, setCollected] = useState<number[]>([])
  const [collectedCoins, setCollectedCoins] = useState<number[]>([])
  const [gameMessage, setGameMessage] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [missedFirstAttempt, setMissedFirstAttempt] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [points, setPoints] = useState(0)

  const topicIndex = Math.min(4, Math.floor((level - 1) / 6))
  const topicNames = ['Pulau Bentuk', 'Hutan Segi Empat', 'Pegunungan Segitiga', 'Danau Lingkaran', 'Kastil Geometri']
  const topicQuestions = questions.filter((item) => item.topic === topicNames[topicIndex])
  const questionStart = (level - 1) % topicQuestions.length
  const levelQuestions = Array.from({ length: 5 }, (_, index) => topicQuestions[(questionStart + index) % topicQuestions.length])
  const question = levelQuestions[questionIndex]
  const isCorrect = selected === question.answer
  const earnedStars = points >= 500 ? 3 : points >= 300 ? 2 : 1
  const earnedCoins = 40 + collected.length * 10 + collectedCoins.length * 5
  const obstacles = [34, 62, 84]
  const collectibles = [18, 49, 75]
  const coinPositions = [42, 56, 69]

  function startWalkingAnimation() {
    if (jumping) return
    setWalking(true)
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current)
    walkTimer.current = window.setTimeout(() => setWalking(false), 380)
  }

  function movePlayer(direction: -1 | 1) {
    if (stage !== 'explore' || paused) return
    setFacing(direction)
    const next = Math.min(94, Math.max(5, playerX + direction * 7))
    const obstacle = direction > 0 ? obstacles.find((point) => playerX < point && next >= point) : undefined
    if (obstacle !== undefined && !jumping) {
      if (lives <= 1) {
        setLives(3)
        setPlayerX(7)
        setGameMessage('Kembali ke checkpoint. Coba lompat dengan tombol ↑!')
      } else {
        setLives((count) => count - 1)
        setPlayerX(Math.max(5, obstacle - 9))
        setGameMessage('Ada rintangan! Lompat dengan tombol ↑ untuk melewatinya.')
      }
      return
    }

    if (!jumping) startWalkingAnimation()
    const found = collectibles.findIndex((point, index) => !collected.includes(index) && playerX < point + 4 && next >= point - 4)
    const foundCoin = coinPositions.findIndex((point, index) => !collectedCoins.includes(index) && playerX < point + 4 && next >= point - 4)
    setPlayerX(next)
    if (found !== -1) {
      setCollected((items) => items.includes(found) ? items : [...items, found])
      setPoints((score) => score + 10)
      setGameMessage('Bentuk ditemukan! +10 poin')
    } else if (foundCoin !== -1) {
      setCollectedCoins((items) => items.includes(foundCoin) ? items : [...items, foundCoin])
      setPoints((score) => score + 5)
      setGameMessage('Koin ditemukan! +5 poin')
    } else {
      setGameMessage('')
    }
  }

  function jump() {
    if (stage !== 'explore' || paused || jumping) return
    setWalking(false)
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current)
    setJumping(true)
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current)
    jumpTimer.current = window.setTimeout(() => setJumping(false), 680)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (stage !== 'explore' || paused || event.repeat) return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(event.key)) event.preventDefault()
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') movePlayer(-1)
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') movePlayer(1)
      if (event.key === 'ArrowUp' || event.key === ' ' || event.key.toLowerCase() === 'w') jump()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => () => {
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current)
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current)
  }, [])

  function answerQuestion(option: string) {
    if (selected !== null) return
    setSelected(option)
    if (option === question.answer && !missedFirstAttempt) {
      setCorrectAnswers((count) => count + 1)
      setPoints((score) => score + 100)
    } else if (option !== question.answer) {
      setMissedFirstAttempt(true)
    }
  }

  function advanceQuestion() {
    if (!isCorrect) return
    if (questionIndex === levelQuestions.length - 1) {
      setStage('result')
      return
    }
    setQuestionIndex((index) => index + 1)
    setSelected(null)
    setMissedFirstAttempt(false)
  }

  function restart() {
    setStage('details')
    setPaused(false)
    setPlayerX(7)
    setJumping(false)
    setWalking(false)
    setFacing(1)
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current)
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current)
    setLives(3)
    setCollected([])
    setCollectedCoins([])
    setGameMessage('')
    setQuestionIndex(0)
    setSelected(null)
    setMissedFirstAttempt(false)
    setCorrectAnswers(0)
    setPoints(0)
  }

  return (
    <section className={`level-game level-game--${stage}`} aria-label={`Level ${level} ${stage === 'explore' ? 'petualangan' : 'bangun datar'}`}>
      <header className="level-game__header">
        <button className="level-game__back" onClick={stage === 'details' || stage === 'quiz' || stage === 'result' ? onBack : () => setPaused(true)} type="button" aria-label={stage === 'explore' ? 'Jeda permainan' : 'Kembali ke peta'}>
          {stage === 'explore' ? 'Ⅱ' : '‹'}
        </button>
        <div><span>{question.topic}</span><strong>Level {level}</strong></div>
        <span className="level-game__star">⭐ {points}</span>
      </header>

      {stage === 'details' && (
        <div className="level-game__detail-card">
          <div className="level-game__detail-banner"><span className="level-game__shape">{question.symbol}</span><div><small>SIAPKAN PERBEKALAN</small><h1>Level {level}</h1><strong>Gerbang {question.topic}</strong></div></div>
          <p className="level-game__eyebrow">Tujuan petualangan</p>
          <p className="level-game__objective">Jelajahi pulau, kumpulkan 3 bentuk, lewati rintangan, lalu jawab 5 soal dengan benar.</p>
          <div className="level-game__detail-stats"><span>⏱ 3–5 menit</span><span>🎯 3 tantangan</span></div>
          <img className="level-game__detail-character" src={explorerImage} alt="Maskot penjelajah siap berangkat" />
          <button className="level-game__continue" onClick={() => setStage('explore')} type="button">Mulai Petualangan <span>→</span></button>
        </div>
      )}

      {stage === 'explore' && (
        <div className="level-game__explore">
          <div className="level-game__explore-bar">
            <span>🪙 {12 + collectedCoins.length}　⭐ {points >= 500 ? 3 : points >= 300 ? 2 : points >= 10 ? 1 : 0}/3</span>
            <span aria-label={`${lives} nyawa`}>{'❤️'.repeat(lives)}{'🩶'.repeat(3 - lives)}</span>
          </div>
          <div className="level-game__objective-card">
            <strong>Kumpulkan semua bentuk!</strong>
            <div className="level-game__targets">
              <span className={collected.includes(0) ? 'is-found' : ''}>△</span>
              <span className={collected.includes(1) ? 'is-found' : ''}>□</span>
              <span className={collected.includes(2) ? 'is-found' : ''}>●</span>
              <b>{collected.length}/3</b>
            </div>
          </div>
          <div className="level-game__arena" aria-label="Area permainan. Gunakan tombol arah dan lompat untuk mengumpulkan bentuk.">
            <div className="level-game__arena-cloud cloud-one" /><div className="level-game__arena-cloud cloud-two" />
            <div className="level-game__platform platform-one" /><div className="level-game__platform platform-two" /><div className="level-game__platform platform-three" />
            {collectibles.map((position, index) => (
              <span key={position} className={`level-game__collectible collectible-${index + 1}${collected.includes(index) ? ' is-collected' : ''}`} style={{ left: `${position}%` }} aria-hidden="true">
                {['△', '□', '●'][index]}
              </span>
            ))}
            {coinPositions.map((position, index) => !collectedCoins.includes(index) && <span key={position} className={`level-game__coin coin-${index + 1}`} style={{ left: `${position}%` }} aria-hidden="true">★</span>)}
            {obstacles.map((position) => <span key={position} className="level-game__obstacle" style={{ left: `${position}%` }} aria-hidden="true" />)}
            <span className={`level-game__runner-shadow${jumping ? ' is-jumping' : ''}`} style={{ left: `${playerX}%` }} aria-hidden="true" />
            <div className={`level-game__runner${walking ? ' is-walking' : ''}${jumping ? ' is-jumping' : ''}${facing < 0 ? ' faces-left' : ''}`} style={{ left: `${playerX}%` }}>
              <img className="level-game__player" src={explorerImage} alt="Karakter penjelajah" />
            </div>
            <span className="level-game__finish" aria-hidden="true">🏁</span>
          </div>
          <div className="level-game__movement-help">Lewati rintangan dan kumpulkan semua bentuk</div>
          <div className="level-game__controls" aria-label="Kontrol permainan">
            <button onClick={() => movePlayer(-1)} type="button" aria-label="Bergerak ke kiri">←</button>
            <button onClick={() => movePlayer(1)} type="button" aria-label="Bergerak ke kanan">→</button>
            <button className="jump-control" onClick={jump} type="button" aria-label="Lompat">↑<small>LOMPAT</small></button>
          </div>
          <p className="level-game__game-message" role="status">{gameMessage || 'Gunakan ← → untuk bergerak dan ↑ untuk melompat.'}</p>
          <button className="level-game__continue" disabled={collected.length < 3 || playerX < 90} onClick={() => setStage('quiz')} type="button">
            {collected.length < 3 ? `Kumpulkan bentuk (${collected.length}/3)` : playerX < 90 ? 'Lewati rintangan terakhir' : 'Lanjut ke tantangan soal'} <span>→</span>
          </button>
          {paused && <div className="level-game__pause-backdrop"><div className="level-game__pause-card"><strong>Petualangan dijeda</strong><button className="level-game__continue" onClick={() => setPaused(false)} type="button">Lanjut bermain</button><button className="level-game__pause-exit" onClick={onBack} type="button">Kembali ke peta</button></div></div>}
        </div>
      )}

      {stage === 'quiz' && (
        <div className="level-game__content">
          <div className="level-game__quiz-progress"><span>Soal {questionIndex + 1}/5</span><span>🪙 {points} poin</span></div>
          <div className="level-game__progress"><i style={{ width: `${((questionIndex + 1) / 5) * 100}%` }} /></div>
          <div className="level-game__shape" aria-hidden="true">{question.symbol}</div>
          <p className="level-game__eyebrow">Tantangan bangun datar</p>
          <h1>{question.prompt}</h1>
          <div className="level-game__answers">
            {question.options.map((option) => {
              const chosen = selected === option
              const right = selected !== null && option === question.answer
              return (
                <button
                  className={`level-game__answer${chosen ? ' is-selected' : ''}${right ? ' is-correct' : ''}${chosen && !isCorrect ? ' is-wrong' : ''}`}
                  disabled={selected !== null}
                  key={option}
                  onClick={() => answerQuestion(option)}
                  type="button"
                >
                  <span className="level-game__answer-dot">{chosen ? (isCorrect ? '✓' : '×') : ''}</span>{option}
                  {right && <span className="level-game__answer-check">✓</span>}
                </button>
              )
            })}
          </div>
          {selected && (
            <div className={`level-game__feedback${isCorrect ? ' is-correct' : ' is-wrong'}`} role="status">
              <strong>{isCorrect ? missedFirstAttempt ? 'Jawaban benar! Kesempatan kedua berhasil 🎉' : 'Jawaban benar! +100 poin 🎉' : 'Belum tepat. 0 poin, coba lagi ya.'}</strong>
              <span>{isCorrect ? question.explanation : 'Pilih “Coba Lagi” untuk menjawab kembali.'}</span>
            </div>
          )}
          {isCorrect ? (
            <button className="level-game__continue" onClick={advanceQuestion} type="button">
              {questionIndex === 4 ? 'Lihat hasil level' : 'Soal berikutnya'} <span>→</span>
            </button>
          ) : selected ? (
            <button className="level-game__continue level-game__continue--retry" onClick={() => setSelected(null)} type="button">Coba Lagi</button>
          ) : (
            <button className="level-game__continue" disabled type="button">Pilih jawaban</button>
          )}
        </div>
      )}

      {stage === 'result' && (
        <div className="level-game__result">
          <div className="level-game__result-stars">{'⭐'.repeat(earnedStars)}<span>{'☆'.repeat(3 - earnedStars)}</span></div>
          <div className="level-game__result-banner">Level Selesai!</div>
          <img src={explorerImage} alt="Maskot merayakan keberhasilan" />
          <div className="level-game__score-card">
            <div className="level-game__score-row"><span>⭐ Skor</span><strong>{points}</strong></div>
            <div className="level-game__score-row"><span>🪙 Koin hadiah</span><strong>+{earnedCoins}</strong></div>
            <div className="level-game__score-row"><span>🔷 XP</span><strong>+{correctAnswers * 100}</strong></div>
            <div className="level-game__score-summary">Tantangan selesai <strong>5/5</strong><br />Benar pada percobaan pertama <strong>{correctAnswers}/5</strong><br />Bentuk terkumpul <strong>{collected.length}/3</strong><br />Koin dijelajah <strong>{collectedCoins.length}</strong></div>
          </div>
          <button className="level-game__continue level-game__continue--green" onClick={() => onComplete(level, earnedStars, earnedCoins, correctAnswers * 100)} type="button">
            {completed ? 'Kembali ke Peta' : 'Lanjutkan'} <span>→</span>
          </button>
          <button className="level-game__continue level-game__continue--retry" onClick={restart} type="button">↻　Ulangi</button>
        </div>
      )}
    </section>
  )
}

export default LevelGame















