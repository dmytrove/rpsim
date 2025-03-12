"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, History, Info, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { SettingsModal } from "@/components/settings-modal"
import { BattleHistory } from "@/components/battle-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createMidiSoundSystem } from "@/lib/midi-sound-system"
import { RulesModal } from "@/components/rules-modal"
import { type Language, getTranslation, getVariationTranslation, VARIATIONS_TRANSLATIONS } from "@/lib/translations"
import variationRules from "@/lib/variations.json"

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

  constructor(x: number, y: number, type: number, size: number) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 2
    this.vy = (Math.random() - 0.5) * 2
    this.type = type
    this.size = size
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.1
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

// Winner item type to preserve across variation changes
interface Winner {
  type: number
  emoji: string
}

// Sound system reference
let soundSystem: ReturnType<typeof createMidiSoundSystem> | null = null

export default function RPSBattleSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const [items, setItems] = useState<Item[]>([])
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

    // Create equal number of each type
    for (let type = 0; type < elemCount; type++) {
      for (let i = 0; i < itemCount; i++) {
        const x = Math.random() * (width - itemSize * 2) + itemSize
        const y = Math.random() * (height - itemSize * 2) + itemSize
        newItems.push(new Item(x, y, type, itemSize))
      }
    }

    setItems(newItems)
    setCounts(initialCounts)
    setChartData([{ time: 0, counts: initialCounts }])
    setRoundStartTime(Date.now())
    lastUpdateRef.current = 0
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
  }, [itemCount, itemSize, variation])

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

      // Move items and check for collisions
      const newItems = [...items]
      const newCounts = Array(elemCount).fill(0)

      // Process movement
      for (const item of newItems) {
        item.move(width, height, speed)
        newCounts[item.type]++
      }

      // Process collisions
      for (let i = 0; i < newItems.length; i++) {
        for (let j = i + 1; j < newItems.length; j++) {
          const itemA = newItems[i]
          const itemB = newItems[j]

          if (itemA.collidesWith(itemB)) {
            // Apply game rules
            if (itemA.type !== itemB.type) {
              // Check if one beats the other based on variation rules
              let winner, loser

              if (doesTypeBeat(itemA.type, itemB.type)) {
                winner = itemA
                loser = itemB
              } else if (doesTypeBeat(itemB.type, itemA.type)) {
                winner = itemB
                loser = itemA
              } else {
                // If neither beats the other, just bounce
                itemA.bounceOff(itemB)
                continue
              }

              // Play sound if enabled
              if (soundEnabled) {
                playCollisionSound(loser.type, winner.type)
              }

              // Transform loser to winner type
              loser.type = winner.type

              // Update counts
              newCounts[loser.type]++
              newCounts[winner.type === loser.type ? winner.type : winner.type]--
            } else {
              // Same type, just bounce off each other
              itemA.bounceOff(itemB)

              // Play bounce sound with same type
              if (soundEnabled) {
                soundSystem?.playBounceSound(itemA.type)
              }
            }
          }
        }
      }

      // Update chart data at specified refresh rate
      const elapsedTime = (Date.now() - roundStartTime) / 1000
      if (elapsedTime - lastUpdateRef.current >= refreshRate) {
        setChartData((prev) => [...prev, { time: elapsedTime, counts: [...newCounts] }])
        lastUpdateRef.current = elapsedTime
      }

      // Draw items
      for (const item of newItems) {
        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.rotate(item.rotation)

        // Draw only the emoji
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

        // Save winner with emoji to preserve across variation changes
        const winner: Winner = {
          type: winnerType,
          emoji: getVariation(variation).items[winnerType],
        }

        // Add to history
        setHistory((prev) => [
          { winner, counts: [...newCounts], duration: roundDuration },
          ...prev.slice(0, 9), // Keep only last 10 rounds
        ])

        // Show toast notification
        toast({
          title: t("roundComplete"),
          description: `${winner.emoji} ${t("wins")} ${roundDuration.toFixed(1)} ${t("seconds")}!`,
          variant: "default",
        })

        // Play victory sound
        if (soundEnabled) {
          soundSystem?.playVictorySound(winnerType)
        }

        // Select random variation if enabled
        if (randomVariation) {
          const variationKeys = Object.keys(VARIATIONS_TRANSLATIONS[language])
          const randomKey = variationKeys[Math.floor(Math.random() * variationKeys.length)]
          setVariation(randomKey)
        }

        // Freeze the current state for display
        setItems(newItems)
        setCounts(newCounts)

        // Start new round after delay
        setTimeout(() => {
          initSimulation()
          setRoundCompleting(false)
        }, 2000)
      } else if (!roundCompleting) {
        // Continue animation only if not in round completion state
        setItems(newItems)
        setCounts(newCounts)
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [items, speed, soundEnabled, refreshRate, variation, isRunning, randomVariation, language, roundCompleting])

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
    <div className="w-screen h-screen overflow-auto bg-slate-950 relative">
      {/* Fullscreen Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Population Counter and Info Button */}
      <div className="absolute top-4 left-4 flex gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
        {counts.map((count, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${COLORS[i]}40` }}
          >
            <span className="text-xl">{getVariation(variation).items[i]}</span>
            <span className="text-sm font-mono text-white">{count}</span>
          </div>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="ml-2 bg-blue-600/70 hover:bg-blue-600 border-blue-500 w-10 h-10"
          onClick={showRules}
        >
          <Info className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Battle History Panel (when visible) */}
      {showHistory && (
        <div className="absolute top-16 right-4 w-64 z-10">
          <Card className="bg-black/70 backdrop-blur-sm border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">{t("history")}</CardTitle>
            </CardHeader>
            <CardContent>
              <BattleHistory history={history} variations={VARIATIONS_TRANSLATIONS[language]} language={language} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Control Buttons - Icon only */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center z-20">
        <div className="flex gap-2">
          <Button
            variant="default"
            size="icon"
            className={`rounded-l-full ${showHistory ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} w-14 h-14`}
            onClick={toggleHistory}
          >
            <History className="h-7 w-7" />
          </Button>

          <Button
            variant="default"
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 w-14 h-14"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-7 w-7" /> : <VolumeX className="h-7 w-7" />}
          </Button>

          <Button
            variant="default"
            size="icon"
            className="rounded-r-full bg-blue-600 hover:bg-blue-700 w-14 h-14"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="h-7 w-7" />
          </Button>
        </div>
      </div>

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

