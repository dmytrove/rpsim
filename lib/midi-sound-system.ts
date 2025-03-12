// MIDI Sound System for RPS Battle Simulator

// Instrument definitions with their characteristics
const INSTRUMENTS = {
  piano: {
    oscillatorType: "triangle",
    attackTime: 0.01,
    releaseTime: 0.5,
    filterFreq: 2000,
    filterQ: 1,
  },
  synth: {
    oscillatorType: "sawtooth",
    attackTime: 0.05,
    releaseTime: 0.3,
    filterFreq: 3000,
    filterQ: 5,
  },
  pad: {
    oscillatorType: "sine",
    attackTime: 0.2,
    releaseTime: 1.5,
    filterFreq: 1000,
    filterQ: 2,
  },
  ambient: {
    oscillatorType: "sine",
    attackTime: 0.3,
    releaseTime: 2.0,
    filterFreq: 800,
    filterQ: 1,
  },
  pluck: {
    oscillatorType: "triangle",
    attackTime: 0.005,
    releaseTime: 0.2,
    filterFreq: 4000,
    filterQ: 3,
  },
  marimba: {
    oscillatorType: "sine",
    attackTime: 0.01,
    releaseTime: 0.3,
    filterFreq: 5000,
    filterQ: 2,
  },
  digital: {
    oscillatorType: "square",
    attackTime: 0.01,
    releaseTime: 0.1,
    filterFreq: 3000,
    filterQ: 8,
  },
  vocal: {
    oscillatorType: "sine",
    attackTime: 0.1,
    releaseTime: 0.4,
    filterFreq: 1500,
    filterQ: 2,
  },
  harp: {
    oscillatorType: "triangle",
    attackTime: 0.005,
    releaseTime: 1.0,
    filterFreq: 3000,
    filterQ: 1,
  },
  guitar: {
    oscillatorType: "sawtooth",
    attackTime: 0.01,
    releaseTime: 0.5,
    filterFreq: 2500,
    filterQ: 2,
  },
  brass: {
    oscillatorType: "sawtooth",
    attackTime: 0.1,
    releaseTime: 0.3,
    filterFreq: 1200,
    filterQ: 3,
  },
  water: {
    oscillatorType: "sine",
    attackTime: 0.1,
    releaseTime: 0.8,
    filterFreq: 600,
    filterQ: 1,
  },
  kalimba: {
    oscillatorType: "sine",
    attackTime: 0.01,
    releaseTime: 1.2,
    filterFreq: 4000,
    filterQ: 1,
  },
  engine: {
    oscillatorType: "square",
    attackTime: 0.05,
    releaseTime: 0.2,
    filterFreq: 800,
    filterQ: 4,
  },
}

// MIDI note to frequency conversion
const midiToFreq = (note: number): number => {
  return 440 * Math.pow(2, (note - 69) / 12)
}

// Create the MIDI sound system
export const createMidiSoundSystem = () => {
  // Create audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  // Current instrument settings
  let currentInstrument = "piano"

  // Active notes for cleanup
  const activeOscillators: OscillatorNode[] = []
  const activeGains: GainNode[] = []

  // Create a master gain node
  const masterGain = audioContext.createGain()
  masterGain.gain.value = 0.5
  masterGain.connect(audioContext.destination)

  // Set the instrument type
  const setInstrument = (instrument: string) => {
    if (INSTRUMENTS[instrument]) {
      currentInstrument = instrument
    }
  }

  // Play a note with the current instrument
  const playNote = (note: number, duration = 0.3, velocity = 0.5) => {
    const instrument = INSTRUMENTS[currentInstrument]

    // Create oscillator
    const oscillator = audioContext.createOscillator()
    oscillator.type = instrument.oscillatorType as OscillatorType
    oscillator.frequency.value = midiToFreq(note)

    // Create filter
    const filter = audioContext.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = instrument.filterFreq
    filter.Q.value = instrument.filterQ

    // Create gain node for envelope
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 0

    // Connect nodes
    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(masterGain)

    // Apply envelope
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(velocity, now + instrument.attackTime)
    gainNode.gain.linearRampToValueAtTime(0, now + duration + instrument.releaseTime)

    // Start oscillator
    oscillator.start()
    oscillator.stop(now + duration + instrument.releaseTime + 0.1)

    // Store for cleanup
    activeOscillators.push(oscillator)
    activeGains.push(gainNode)

    // Remove from active list when done
    oscillator.onended = () => {
      const index = activeOscillators.indexOf(oscillator)
      if (index > -1) {
        activeOscillators.splice(index, 1)
        activeGains.splice(index, 1)
      }
    }
  }

  // Play a transformation sound (from one type to another)
  const playTransformationSound = (fromNote: number, toNote: number) => {
    // Play a sequence of notes for transformation
    playNote(fromNote, 0.1, 0.4)
    setTimeout(() => {
      playNote(toNote, 0.2, 0.6)
    }, 100)
  }

  // Play a bounce sound (same type collision)
  const playBounceSound = (type: number) => {
    // Base note for each type
    const baseNote = 60 + type * 4
    playNote(baseNote, 0.1, 0.3)
  }

  // Play a victory sound
  const playVictorySound = (winnerType: number) => {
    // Play an arpeggio based on winner type
    const baseNote = 60 + winnerType * 4
    const notes = [baseNote, baseNote + 4, baseNote + 7, baseNote + 12]

    notes.forEach((note, index) => {
      setTimeout(() => {
        playNote(note, 0.3, 0.7)
      }, index * 150)
    })
  }

  // Cleanup function
  const cleanup = () => {
    activeOscillators.forEach((osc) => {
      try {
        osc.stop()
      } catch (e) {
        // Ignore errors if already stopped
      }
    })

    activeOscillators.length = 0
    activeGains.length = 0
  }

  return {
    setInstrument,
    playNote,
    playTransformationSound,
    playBounceSound,
    playVictorySound,
    cleanup,
  }
}

