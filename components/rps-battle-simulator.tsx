"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, History, Info, Volume2, VolumeX, Pause, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { SettingsModal } from "@/components/settings-modal"
import { BattleHistory } from "@/components/battle-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createMidiSoundSystem } from "@/lib/midi-sound-system"
import { RulesModal } from "@/components/rules-modal"
import { type Language, getTranslation, getVariationTranslation, VARIATIONS_TRANSLATIONS } from "@/lib/translations"
import variationRules from "@/lib/variations.json"
import { GenerativeBackground } from "@/components/generative-background"

// Colors for different item types (expanded to support more items)
const COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#0ea5e9", // sky
  "#14b8a6", // teal
]

// Avatar colors for player profiles
const AVATAR_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
]

// Sample player names by language
const SAMPLE_NAMES = {
  uk: [
    "Олексій", "Марія", "Дмитро", "Анна", "Іван", "Олена", "Андрій", "Катерина",
    "Сергій", "Наталія", "Михайло", "Юлія", "Володимир", "Тетяна", "Петро", "Ірина",
    "Василь", "Оксана", "Максим", "Світлана", "Артем", "Вікторія", "Назар", "Дарина",
    "Богдан", "Софія", "Олег", "Аліна", "Ярослав", "Христина", "Роман", "Людмила"
  ],
  en: [
    "Alex", "Maria", "James", "Emma", "John", "Olivia", "Michael", "Sophie",
    "David", "Emily", "Chris", "Julia", "Daniel", "Sarah", "Andrew", "Lisa",
    "Thomas", "Anna", "Max", "Rachel", "Arthur", "Victoria", "Nathan", "Diana",
    "Brian", "Sofia", "Oliver", "Alice", "Jason", "Christina", "Ryan", "Lucy"
  ]
}

// Generate avatar color from name
const getAvatarColor = (name: string): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// Get initials from name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Item class for simulation
class Item {
  x: number
  y: number
  vx: number
  vy: number
  type: number
  size: number
  rotation: number
  rotationSpeed: number
  playerName: string

  constructor(x: number, y: number, type: number, size: number, playerName: string = "") {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 2
    this.vy = (Math.random() - 0.5) * 2
    this.type = type
    this.size = size
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.1
    this.playerName = playerName
  }

  move(width: number, height: number, speed: number) {
    this.x += this.vx * speed
    this.y += this.vy * speed
    this.rotation += this.rotationSpeed

    // Bounce off walls
    if (this.x < this.size || this.x > width - this.size) {
      this.vx *= -1
      this.x = Math.max(this.size, Math.min(this.x, width - this.size))
      // Change rotation direction slightly when bouncing
      this.rotationSpeed = (Math.random() - 0.5) * 0.1
    }

    if (this.y < this.size || this.y > height - this.size) {
      this.vy *= -1
      this.y = Math.max(this.size, Math.min(this.y, height - this.size))
      // Change rotation direction slightly when bouncing
      this.rotationSpeed = (Math.random() - 0.5) * 0.1
    }
  }

  collidesWith(other: Item) {
    const dx = this.x - other.x
    const dy = this.y - other.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < this.size + other.size
  }

  bounceOff(other: Item) {
    // Calculate collision normal
    const dx = other.x - this.x
    const dy = other.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Avoid division by zero
    if (distance === 0) return

    // Normalize the collision vector
    const nx = dx / distance
    const ny = dy / distance

    // Calculate relative velocity
    const dvx = this.vx - other.vx
    const dvy = this.vy - other.vy

    // Calculate impulse
    const impulse = (2 * (dvx * nx + dvy * ny)) / 2

    // Apply impulse to velocities
    this.vx -= impulse * nx
    this.vy -= impulse * ny
    other.vx += impulse * nx
    other.vy += impulse * ny

    // Adjust rotation based on collision
    this.rotationSpeed = (Math.random() - 0.5) * 0.2
    other.rotationSpeed = (Math.random() - 0.5) * 0.2

    // Move items apart to prevent sticking
    const overlap = this.size + other.size - distance
    if (overlap > 0) {
      this.x -= (overlap / 2) * nx
      this.y -= (overlap / 2) * ny
      other.x += (overlap / 2) * nx
      other.y += (overlap / 2) * ny
    }
  }
}

// Spatial hash for O(n) collision detection
class SpatialHash {
  private cellSize: number
  private cells: Map<string, Item[]>

  constructor(cellSize: number) {
    this.cellSize = cellSize
    this.cells = new Map()
  }

  clear() {
    this.cells.clear()
  }

  private getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize)
    const cy = Math.floor(y / this.cellSize)
    return `${cx},${cy}`
  }

  insert(item: Item) {
    const key = this.getKey(item.x, item.y)
    if (!this.cells.has(key)) {
      this.cells.set(key, [])
    }
    this.cells.get(key)!.push(item)
  }

  getNearby(item: Item): Item[] {
    const nearby: Item[] = []
    const cx = Math.floor(item.x / this.cellSize)
    const cy = Math.floor(item.y / this.cellSize)

    // Check 3x3 grid of cells around item
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`
        const cell = this.cells.get(key)
        if (cell) {
          for (const other of cell) {
            if (other !== item) {
              nearby.push(other)
            }
          }
        }
      }
    }
    return nearby
  }
}

// Winner item type to preserve across variation changes
interface Winner {
  type: number
  emoji: string
  playerName?: string
}

// Sound system reference
let soundSystem: ReturnType<typeof createMidiSoundSystem> | null = null

export default function RPSBattleSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const itemsRef = useRef<Item[]>([]) // Use ref for animation loop
  const spatialHashRef = useRef<SpatialHash>(new SpatialHash(50)) // Cell size ~50px
  const [counts, setCounts] = useState<number[]>([])
  const [chartData, setChartData] = useState<{ time: number; counts: number[] }[]>([])
  const [soundEnabled, setSoundEnabled] = useState(false) // Default to muted
  const [showHistory, setShowHistory] = useState(false)
  const [itemCount, setItemCount] = useState(10)
  const [speed, setSpeed] = useState(1)
  const [itemSize, setItemSize] = useState(5)
  const [refreshRate, setRefreshRate] = useState(0.5)
  const [history, setHistory] = useState<{ winner: Winner; counts: number[]; duration: number }[]>([])
  const [roundStartTime, setRoundStartTime] = useState(Date.now())
  const [variation, setVariation] = useState<string>("classic")
  const [isRunning, setIsRunning] = useState(true)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const lastUpdateRef = useRef(0)
  const { toast } = useToast()
  const isMobile = useMobile()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [randomVariation, setRandomVariation] = useState(false)
  const [language, setLanguage] = useState<Language>("uk") // Default to Ukrainian
  const [roundCompleting, setRoundCompleting] = useState(false)
  const [players, setPlayers] = useState<string[]>([])
  const [playersEnabled, setPlayersEnabled] = useState(true) // Enabled by default
  const [showTopPanel, setShowTopPanel] = useState(false) // Hidden by default
  const [showBottomPanel, setShowBottomPanel] = useState(false) // Hidden by default
  const [winningPlayer, setWinningPlayer] = useState<string | null>(null)
  const [roundWinner, setRoundWinner] = useState<{ emoji: string; duration: number; playerName?: string } | null>(null)
  const [pendingVariation, setPendingVariation] = useState<string | null>(null)
  const [playerRatings, setPlayerRatings] = useState<{ name: string; count: number; position: number; eliminated: boolean; eliminatedAt?: number }[]>([])
  const prevRatingsRef = useRef<Map<string, number>>(new Map())
  const eliminatedPlayersRef = useRef<Map<string, number>>(new Map()) // Track eliminated players and their final position

  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err)
          },
        )
      })
    }
  }, [])

  // Seed players on mount
  useEffect(() => {
    const names = SAMPLE_NAMES[language]
    const shuffled = [...names].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 8) + 8 // 8-15 players
    setPlayers(shuffled.slice(0, count))
  }, []) // Only run once on mount

  // Get current variation data based on language
  const getVariation = (key: string) => {
    return getVariationTranslation(language, key)
  }

  // Translate function
  const t = (key: Parameters<typeof getTranslation>[1]) => {
    return getTranslation(language, key)
  }

  // Initialize sound system
  useEffect(() => {
    if (soundEnabled && !soundSystem) {
      soundSystem = createMidiSoundSystem()
    }
    return () => {
      if (soundSystem) {
        soundSystem.cleanup()
      }
    }
  }, [soundEnabled])

  // Update sound system when variation changes
  useEffect(() => {
    if (soundSystem) {
      soundSystem.setInstrument(getVariation(variation).instrument)
    }
  }, [variation, language])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or when modals are open
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case " ": // Space - Pause/Resume
          e.preventDefault()
          if (!showSettingsModal && !showRulesModal) {
            setIsRunning((prev) => !prev)
          }
          break
        case "r": // R - Restart
          if (!e.ctrlKey && !e.metaKey && !showSettingsModal && !showRulesModal) {
            handleRestart()
          }
          break
        case "m": // M - Toggle mute/sound
          setSoundEnabled((prev) => !prev)
          break
        case "h": // H - Toggle history
          setShowHistory((prev) => !prev)
          break
        case "s": // S - Open settings
          if (!e.ctrlKey && !e.metaKey) {
            setShowSettingsModal(true)
          }
          break
        case "i": // I - Show rules/info
          setShowRulesModal(true)
          break
        case "escape": // Escape - Close modals
          if (showSettingsModal) setShowSettingsModal(false)
          if (showRulesModal) setShowRulesModal(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showSettingsModal, showRulesModal])

  // Play collision sound
  const playCollisionSound = (fromType: number, toType: number) => {
    if (!soundEnabled || !soundSystem) return

    // Calculate note based on types
    const baseNote = 60 // Middle C
    const fromNote = baseNote + fromType * 4
    const toNote = baseNote + toType * 4

    // Play transformation sound
    soundSystem.playTransformationSound(fromNote, toNote)
  }

  // Get number of elements for current variation
  const getElementCount = () => {
    return variationRules[variation as keyof typeof variationRules].elements
  }

  // Check if one type beats another in current variation
  const doesTypeBeat = (type1: number, type2: number) => {
    const beats = variationRules[variation as keyof typeof variationRules].beats
    return beats[type1].includes(type2)
  }

  const initSimulation = () => {
    // Cancel any existing animation frame to avoid overlap
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const width = canvas.width
    const height = canvas.height
    const elemCount = getElementCount()

    const newItems: Item[] = []
    const initialCounts = Array(elemCount).fill(itemCount)

    // Clear winning player and reset eliminated tracking
    setWinningPlayer(null)
    eliminatedPlayersRef.current = new Map()

    // Shuffle players for random assignment
    const shuffledPlayers = playersEnabled && players.length > 0
      ? [...players].sort(() => Math.random() - 0.5)
      : []
    let playerIndex = 0

    // Create equal number of each type
    for (let type = 0; type < elemCount; type++) {
      for (let i = 0; i < itemCount; i++) {
        const x = Math.random() * (width - itemSize * 2) + itemSize
        const y = Math.random() * (height - itemSize * 2) + itemSize
        // Assign player name if players are enabled
        const playerName = shuffledPlayers.length > 0
          ? shuffledPlayers[playerIndex++ % shuffledPlayers.length]
          : ""
        newItems.push(new Item(x, y, type, itemSize, playerName))
      }
    }

    itemsRef.current = newItems
    setCounts(initialCounts)
    setChartData([{ time: 0, counts: initialCounts }])
    setRoundStartTime(Date.now())
    lastUpdateRef.current = 0

    // Calculate initial player ratings
    if (playersEnabled && players.length > 0) {
      const playerCounts = new Map<string, number>()
      for (const item of newItems) {
        if (item.playerName) {
          playerCounts.set(item.playerName, (playerCounts.get(item.playerName) || 0) + 1)
        }
      }

      const sortedRatings = Array.from(playerCounts.entries())
        .map(([name, count]) => ({ name, count, position: 0, eliminated: false }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((rating, idx) => ({ ...rating, position: idx + 1 }))

      setPlayerRatings(sortedRatings)
    } else {
      setPlayerRatings([])
    }
  }

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Initialize simulation on mount and when settings change
  useEffect(() => {
    initSimulation()
  }, [itemCount, itemSize, variation, players, playersEnabled])

  // Main animation loop
  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height
      const elemCount = getElementCount()

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Move items and check for collisions - use ref directly, no copying
      const items = itemsRef.current
      const newCounts = Array(elemCount).fill(0)

      // Build spatial hash and process movement
      const spatialHash = spatialHashRef.current
      spatialHash.clear()
      for (const item of items) {
        item.move(width, height, speed)
        newCounts[item.type]++
        spatialHash.insert(item)
      }

      // Process collisions using spatial hash (O(n) instead of O(n²))
      const checked = new Set<string>()
      for (const item of items) {
        const nearby = spatialHash.getNearby(item)
        for (const other of nearby) {
          // Create unique pair key to avoid checking same pair twice
          const pairKey = item.x < other.x || (item.x === other.x && item.y < other.y)
            ? `${item.x},${item.y}-${other.x},${other.y}`
            : `${other.x},${other.y}-${item.x},${item.y}`
          if (checked.has(pairKey)) continue
          checked.add(pairKey)

          if (item.collidesWith(other)) {
            if (item.type !== other.type) {
              let winner, loser
              if (doesTypeBeat(item.type, other.type)) {
                winner = item
                loser = other
              } else if (doesTypeBeat(other.type, item.type)) {
                winner = other
                loser = item
              } else {
                item.bounceOff(other)
                continue
              }

              if (soundEnabled) {
                playCollisionSound(loser.type, winner.type)
              }

              loser.type = winner.type
              loser.playerName = winner.playerName
              newCounts[loser.type]++
              newCounts[winner.type === loser.type ? winner.type : winner.type]--
            } else {
              item.bounceOff(other)
              if (soundEnabled) {
                soundSystem?.playBounceSound(item.type)
              }
            }
          }
        }
      }

      // Update chart data and counts at specified refresh rate
      const elapsedTime = (Date.now() - roundStartTime) / 1000
      if (elapsedTime - lastUpdateRef.current >= refreshRate) {
        setCounts([...newCounts])
        setChartData((prev) => [...prev, { time: elapsedTime, counts: [...newCounts] }])
        lastUpdateRef.current = elapsedTime

        // Update player ratings if players are enabled
        if (playersEnabled && players.length > 0) {
          const playerCounts = new Map<string, number>()
          for (const item of items) {
            if (item.playerName) {
              playerCounts.set(item.playerName, (playerCounts.get(item.playerName) || 0) + 1)
            }
          }

          // Get active players sorted by count
          const activeRatings = Array.from(playerCounts.entries())
            .map(([name, count]) => ({ name, count, position: 0, eliminated: false }))
            .sort((a, b) => b.count - a.count)

          // Check for newly eliminated players (had items before, now have 0)
          const previousCounts = prevRatingsRef.current
          players.forEach(playerName => {
            const currentCount = playerCounts.get(playerName) || 0
            const wasActive = previousCounts.has(playerName) && !eliminatedPlayersRef.current.has(playerName)
            if (wasActive && currentCount === 0 && !eliminatedPlayersRef.current.has(playerName)) {
              // Player just got eliminated - record their position
              const eliminationPosition = activeRatings.length + eliminatedPlayersRef.current.size + 1
              eliminatedPlayersRef.current.set(playerName, eliminationPosition)
            }
          })

          // Assign positions to active players
          const activeWithPositions = activeRatings
            .slice(0, 10)
            .map((rating, idx) => ({ ...rating, position: idx + 1 }))

          // Add eliminated players at the end
          const eliminatedRatings = Array.from(eliminatedPlayersRef.current.entries())
            .map(([name, eliminatedAt]) => ({
              name,
              count: 0,
              position: eliminatedAt,
              eliminated: true,
              eliminatedAt
            }))
            .sort((a, b) => (a.eliminatedAt || 0) - (b.eliminatedAt || 0))

          // Combine active and eliminated (limit total to 10)
          const allRatings = [...activeWithPositions, ...eliminatedRatings].slice(0, 10)

          setPlayerRatings(allRatings)

          // Store current counts for next frame
          const newPositions = new Map<string, number>()
          activeRatings.forEach((r) => newPositions.set(r.name, r.count))
          prevRatingsRef.current = newPositions
        }
      }

      // Draw items
      for (const item of items) {
        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.rotate(item.rotation)

        // Draw player color ring if players enabled (lightweight - no shadow)
        if (playersEnabled && item.playerName) {
          ctx.beginPath()
          ctx.arc(0, 0, item.size * 1.15, 0, Math.PI * 2)
          ctx.strokeStyle = getAvatarColor(item.playerName) + "60"
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Draw the emoji
        ctx.font = `${item.size * 2}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(getVariation(variation).items[item.type], 0, 0)

        ctx.restore()
      }

      // Check if round is over (all items are the same type)
      if (newCounts.filter((count) => count > 0).length === 1 && !roundCompleting) {
        // Set round as completing to prevent multiple winners
        setRoundCompleting(true)

        // Cancel the animation frame to stop all movement immediately
        cancelAnimationFrame(animationRef.current)

        const winnerType = newCounts.findIndex((count) => count > 0)
        const roundDuration = (Date.now() - roundStartTime) / 1000

        // Find a winning player (pick randomly from surviving items)
        const survivingItems = items.filter(item => item.type === winnerType)
        const winnerPlayerNames = [...new Set(survivingItems.map(item => item.playerName).filter(Boolean))]
        const randomWinnerName = winnerPlayerNames.length > 0
          ? winnerPlayerNames[Math.floor(Math.random() * winnerPlayerNames.length)]
          : undefined

        // Save winner with emoji to preserve across variation changes
        const winner: Winner = {
          type: winnerType,
          emoji: getVariation(variation).items[winnerType],
          playerName: randomWinnerName,
        }

        // Set winning player for display
        if (randomWinnerName) {
          setWinningPlayer(randomWinnerName)
        }

        // Add to history
        setHistory((prev) => [
          { winner, counts: [...newCounts], duration: roundDuration },
          ...prev.slice(0, 9), // Keep only last 10 rounds
        ])

        // Show toast notification
        const winnerText = randomWinnerName
          ? `${winner.emoji} ${randomWinnerName} ${t("wins")} ${roundDuration.toFixed(1)} ${t("seconds")}!`
          : `${winner.emoji} ${t("wins")} ${roundDuration.toFixed(1)} ${t("seconds")}!`
        toast({
          title: t("roundComplete"),
          description: winnerText,
          variant: "default",
        })

        // Play victory sound
        if (soundEnabled) {
          soundSystem?.playVictorySound(winnerType)
        }

        // Set round winner for overlay display
        setRoundWinner({ emoji: winner.emoji, duration: roundDuration, playerName: randomWinnerName })

        // Store random variation for next round (don't apply yet)
        let nextVariation: string | null = null
        if (randomVariation) {
          const variationKeys = Object.keys(VARIATIONS_TRANSLATIONS[language])
          nextVariation = variationKeys[Math.floor(Math.random() * variationKeys.length)]
          setPendingVariation(nextVariation)
        }

        // Update counts for display
        setCounts(newCounts)

        // Start new round after delay
        setTimeout(() => {
          setRoundWinner(null)
          setPendingVariation(null)
          setRoundCompleting(false)

          // Apply pending variation at start of new round
          // The useEffect on variation change will trigger initSimulation
          if (nextVariation) {
            setVariation(nextVariation)
          } else {
            // No variation change, manually init
            initSimulation()
          }
        }, 3000)
      } else if (!roundCompleting) {
        // Continue animation - update counts only at refresh interval (already done above)
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [speed, soundEnabled, refreshRate, variation, isRunning, randomVariation, language, roundCompleting, playersEnabled, players])

  const handleRestart = () => {
    // Cancel any existing animation frame
    cancelAnimationFrame(animationRef.current)

    // Reset round completing state
    setRoundCompleting(false)

    // Initialize new simulation
    initSimulation()
    setIsRunning(true)
  }

  // Toggle history visibility
  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  // Show rules modal
  const showRules = () => {
    setShowRulesModal(true)
  }

  return (
    <div className="w-screen h-screen overflow-auto relative bg-[#020617]">
      {/* Generative Background */}
      <GenerativeBackground />

      {/* Fullscreen Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Pause Overlay */}
      {!isRunning && !showSettingsModal && !roundWinner && (
        <div
          className="absolute inset-0 bg-black/40 flex items-center justify-center z-5 cursor-pointer backdrop-blur-[2px]"
          onClick={() => setIsRunning(true)}
        >
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="bg-white/20 rounded-full p-6 backdrop-blur-sm">
              <Play className="h-16 w-16 text-white" />
            </div>
            <span className="text-white/80 text-lg font-medium">{t("pause")} - {isMobile ? "Tap" : "Space"}</span>
          </div>
        </div>
      )}

      {/* Round Winner Overlay */}
      {roundWinner && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 backdrop-blur-[3px]">
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-50 duration-500">
            <div className="text-8xl sm:text-9xl animate-bounce">
              {roundWinner.emoji}
            </div>
            {roundWinner.playerName && (
              <div className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-transparent bg-clip-text">
                <h1 className="text-3xl sm:text-5xl font-bold text-center px-4">{roundWinner.playerName}</h1>
              </div>
            )}
            <div className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 bg-clip-text text-transparent text-2xl sm:text-3xl font-bold tracking-wide">
              {t("winner")}
            </div>
            <div className="text-white/80 text-lg sm:text-xl font-medium">
              {roundWinner.duration.toFixed(1)} {t("seconds")}
            </div>
            {pendingVariation && (
              <div className="mt-4 text-white/60 text-sm flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <span>{t("nextRound")}:</span>
                <span className="text-white/90 font-medium">
                  {getVariation(pendingVariation).name}
                </span>
                <span className="text-xl">
                  {getVariation(pendingVariation).items.join("")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Population Counter Toggle Button */}
      {!showTopPanel && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 w-10 h-10 rounded-full transition-all duration-200 z-10"
          onClick={() => setShowTopPanel(true)}
          aria-label="Show stats"
        >
          <Info className="h-5 w-5 text-white/70" />
        </Button>
      )}

      {/* Population Counter and Info Button */}
      {showTopPanel && (
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 bg-black/60 p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-lg max-w-[calc(100vw-2rem)] z-10">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
            onClick={() => setShowTopPanel(false)}
            aria-label="Hide stats"
          >
            ×
          </Button>
          {counts.map((count, i) => {
            const total = counts.reduce((a, b) => a + b, 0)
            const percentage = total > 0 ? (count / total) * 100 : 0
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300"
                style={{
                  backgroundColor: `${COLORS[i]}30`,
                  borderColor: `${COLORS[i]}60`,
                  boxShadow: count > 0 ? `0 0 10px ${COLORS[i]}40` : "none",
                  opacity: count === 0 ? 0.5 : 1,
                }}
              >
                <span className="text-xl">{getVariation(variation).items[i]}</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold font-mono text-white leading-tight">{count}</span>
                  <span className="text-[10px] font-mono text-white/60 leading-tight">{percentage.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
          <Button
            variant="outline"
            size="icon"
            className="ml-1 bg-blue-600/70 hover:bg-blue-500 border-blue-400/50 w-10 h-10 rounded-full transition-all duration-200 active:scale-95"
            onClick={showRules}
            aria-label={t("rules")}
          >
            <Info className="h-5 w-5 text-white" />
          </Button>
        </div>
      )}

      {/* Battle History Panel (when visible) */}
      {showHistory && (
        <div className={`absolute z-10 ${isMobile ? "top-auto bottom-24 left-4 right-4 w-auto" : "top-4 right-4 w-72"}`}>
          <Card className="bg-black/80 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                {t("history")}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => setShowHistory(false)}
                aria-label="Close history"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <BattleHistory history={history} variations={VARIATIONS_TRANSLATIONS[language]} language={language} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Player Leaderboard - Racing style with position animations */}
      {playersEnabled && playerRatings.length > 0 && !roundWinner && (
        <div className={`absolute z-10 ${isMobile ? "top-4 right-2 w-44" : showHistory ? "top-4 left-4 mt-16 w-56" : "top-4 right-4 w-56"}`}>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/5 overflow-hidden p-1.5">
            <div className="relative" style={{ height: `${playerRatings.length * 32}px` }}>
              {playerRatings.map((player, idx) => {
                const isTop3 = idx < 3 && !player.eliminated
                const isEliminated = player.eliminated
                const medal = !isEliminated ? (idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "") : "💀"

                return (
                  <div
                    key={player.name}
                    className="absolute left-0 right-0 flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all duration-300 ease-out"
                    style={{
                      transform: `translateY(${idx * 32}px)`,
                      opacity: isEliminated ? 0.5 : 1,
                    }}
                  >
                    <span className={`w-5 text-center flex-shrink-0 ${isTop3 ? "text-sm" : "text-xs text-white/50"}`}>
                      {medal || `${idx + 1}`}
                    </span>
                    <div
                      className={`flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white w-6 h-6 text-[10px] ${isEliminated ? "grayscale" : ""}`}
                      style={{ backgroundColor: getAvatarColor(player.name) }}
                    >
                      {getInitials(player.name)}
                    </div>
                    <div className={`flex-1 min-w-0 truncate text-xs ${isEliminated ? "text-white/40 line-through" : isTop3 ? "text-white font-medium" : "text-white/70"}`}>
                      {player.name}
                    </div>
                    <span className={`text-xs font-mono ${isEliminated ? "text-red-400/60" : isTop3 ? "text-white font-bold" : "text-white/50"}`}>
                      {isEliminated ? "×" : player.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Panel Toggle Button */}
      {!showBottomPanel && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 w-10 h-10 rounded-full z-20"
          onClick={() => setShowBottomPanel(true)}
          aria-label="Show controls"
        >
          <Settings className="h-5 w-5 text-white/70" />
        </Button>
      )}

      {/* Floating Control Buttons - Icon only */}
      {showBottomPanel && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center z-20">
          <div className="flex gap-1 bg-black/30 p-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 hover:bg-white/10 text-white/60"
              onClick={() => setShowBottomPanel(false)}
              aria-label="Hide controls"
            >
              ×
            </Button>

            <Button
              variant="default"
              size="icon"
              className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 ${
                isRunning
                  ? "bg-slate-600/60 hover:bg-slate-500/60"
                  : "bg-amber-600/80 hover:bg-amber-500"
              }`}
              onClick={() => setIsRunning(!isRunning)}
              aria-label={isRunning ? t("pause") : t("resume")}
              aria-pressed={!isRunning}
            >
              {isRunning ? <Pause className="h-6 w-6 sm:h-7 sm:w-7" /> : <Play className="h-6 w-6 sm:h-7 sm:w-7" />}
            </Button>

            <Button
              variant="default"
              size="icon"
              className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 ${
                showHistory
                  ? "bg-blue-500/80 hover:bg-blue-600"
                  : "bg-blue-600/60 hover:bg-blue-600"
              }`}
              onClick={toggleHistory}
              aria-label={t("history")}
              aria-pressed={showHistory}
            >
              <History className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 ${
                soundEnabled
                  ? "bg-green-600/80 hover:bg-green-700"
                  : "bg-blue-600/60 hover:bg-blue-600"
              }`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? t("soundEffects") + " on" : t("soundEffects") + " off"}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 className="h-6 w-6 sm:h-7 sm:w-7" /> : <VolumeX className="h-6 w-6 sm:h-7 sm:w-7" />}
            </Button>

            <Button
              variant="default"
              size="icon"
              className="rounded-full bg-blue-600/60 hover:bg-blue-600 w-12 h-12 sm:w-14 sm:h-14"
              onClick={() => setShowSettingsModal(true)}
              aria-label={t("settings")}
            >
              <Settings className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        itemCount={itemCount}
        setItemCount={setItemCount}
        speed={speed}
        setSpeed={setSpeed}
        itemSize={itemSize}
        setItemSize={setItemSize}
        refreshRate={refreshRate}
        setRefreshRate={setRefreshRate}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        onRestart={handleRestart}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        variation={variation}
        setVariation={setVariation}
        variations={VARIATIONS_TRANSLATIONS[language]}
        showRules={showRules}
        randomVariation={randomVariation}
        setRandomVariation={setRandomVariation}
        language={language}
        setLanguage={setLanguage}
        roundCompleting={roundCompleting}
        players={players}
        setPlayers={setPlayers}
        playersEnabled={playersEnabled}
        setPlayersEnabled={setPlayersEnabled}
      />

      {/* Rules Modal */}
      <RulesModal
        open={showRulesModal}
        onOpenChange={setShowRulesModal}
        variation={variation}
        variations={VARIATIONS_TRANSLATIONS[language]}
        colors={COLORS}
        language={language}
        rules={variationRules}
      />
    </div>
  )
}

