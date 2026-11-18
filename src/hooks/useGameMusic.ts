import { useCallback, useEffect, useRef, useState } from 'react'

const musicPreferenceKey = 'petualangan-bangun-datar-music'

type MusicEngine = {
  context: AudioContext
  volume: GainNode
  timer: number | null
  step: number
}

function readMusicPreference() {
  try {
    return localStorage.getItem(musicPreferenceKey) !== 'off'
  } catch {
    return true
  }
}

function useGameMusic() {
  const [enabled, setEnabled] = useState(readMusicPreference)
  const enabledRef = useRef(enabled)
  const engineRef = useRef<MusicEngine | null>(null)

  const playMusic = useCallback(() => {
    let engine = engineRef.current
    if (!engine) {
      const context = new AudioContext()
      const volume = context.createGain()
      volume.gain.value = 0
      volume.connect(context.destination)
      engine = { context, volume, timer: null, step: 0 }
      engineRef.current = engine
    }

    void engine.context.resume().then(() => {
      if (!enabledRef.current || !engine) return
      engine.volume.gain.cancelScheduledValues(engine.context.currentTime)
      engine.volume.gain.setTargetAtTime(0.17, engine.context.currentTime, 0.35)
      if (engine.timer !== null) return

      const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 987.77, 880, 783.99, 659.25]
      const bass = [130.81, 130.81, 98, 98, 110, 110, 87.31, 98]
      const playTone = (frequency: number, start: number, duration: number, type: OscillatorType, loudness: number, endFrequency = frequency) => {
        const oscillator = engine!.context.createOscillator()
        const envelope = engine!.context.createGain()
        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, start)
        if (endFrequency !== frequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)
        envelope.gain.setValueAtTime(0.0001, start)
        envelope.gain.exponentialRampToValueAtTime(loudness, start + 0.018)
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
        oscillator.connect(envelope)
        envelope.connect(engine!.volume)
        oscillator.start(start)
        oscillator.stop(start + duration + 0.02)
      }

      const tick = () => {
        const activeEngine = engineRef.current
        if (!activeEngine || !enabledRef.current) return
        const beat = activeEngine.context.currentTime + 0.025
        const step = activeEngine.step
        playTone(melody[step], beat, 0.2, 'triangle', 0.11)
        if (step % 2 === 0) playTone(bass[Math.floor(step / 2)], beat, 0.32, 'sine', 0.12)
        if (step % 4 === 0) playTone(105, beat, 0.15, 'sine', 0.2, 48)
        else if (step % 2 === 1) playTone(1250, beat, 0.045, 'square', 0.018)
        activeEngine.step = (step + 1) % melody.length
      }

      tick()
      engine.timer = window.setInterval(tick, 250)
    }).catch(() => {
      // Browser audio can wait until the next user gesture.
    })
  }, [])

  const toggleMusic = useCallback(() => {
    const nextEnabled = !enabledRef.current
    enabledRef.current = nextEnabled
    setEnabled(nextEnabled)
    try {
      localStorage.setItem(musicPreferenceKey, nextEnabled ? 'on' : 'off')
    } catch {
      // Musik tetap dapat diatur selama halaman ini terbuka.
    }

    const engine = engineRef.current
    if (nextEnabled) {
      playMusic()
    } else if (engine) {
      if (engine.timer !== null) window.clearInterval(engine.timer)
      engine.timer = null
      engine.volume.gain.cancelScheduledValues(engine.context.currentTime)
      engine.volume.gain.setTargetAtTime(0, engine.context.currentTime, 0.08)
    }
  }, [playMusic])

  useEffect(() => {
    const startAfterGesture = () => {
      if (enabledRef.current) playMusic()
    }
    window.addEventListener('pointerdown', startAfterGesture)
    window.addEventListener('keydown', startAfterGesture)
    return () => {
      window.removeEventListener('pointerdown', startAfterGesture)
      window.removeEventListener('keydown', startAfterGesture)
      const engine = engineRef.current
      if (engine?.timer !== null && engine?.timer !== undefined) window.clearInterval(engine.timer)
      if (engine) void engine.context.close()
      engineRef.current = null
    }
  }, [playMusic])

  return { enabled, toggleMusic }
}

export default useGameMusic
