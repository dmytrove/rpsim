"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RefreshCw, Info, Users, Shuffle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { type Language, getTranslation } from "@/lib/translations"
import { FlagIcon } from "@/components/flag-icon"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemCount: number
  setItemCount: (count: number) => void
  speed: number
  setSpeed: (speed: number) => void
  itemSize: number
  setItemSize: (size: number) => void
  refreshRate: number
  setRefreshRate: (rate: number) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  showHistory: boolean
  setShowHistory: (show: boolean) => void
  onRestart: () => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void
  variation: string
  setVariation: (variation: string) => void
  variations: Record<string, { name: string; items: string[] }>
  showRules: () => void
  randomVariation: boolean
  setRandomVariation: (random: boolean) => void
  language: Language
  setLanguage: (lang: Language) => void
  roundCompleting: boolean
  players: string[]
  setPlayers: (players: string[]) => void
  playersEnabled: boolean
  setPlayersEnabled: (enabled: boolean) => void
}

export function SettingsModal({
  open,
  onOpenChange,
  itemCount,
  setItemCount,
  speed,
  setSpeed,
  itemSize,
  setItemSize,
  refreshRate,
  setRefreshRate,
  onRestart,
  variation,
  setVariation,
  variations,
  showRules,
  randomVariation,
  setRandomVariation,
  language,
  setLanguage,
  roundCompleting,
  players,
  setPlayers,
  playersEnabled,
  setPlayersEnabled,
}: SettingsModalProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key)

  const sampleNames = {
    uk: [
      "Олексій", "Марія", "Дмитро", "Анна", "Іван", "Олена", "Андрій", "Катерина",
      "Сергій", "Наталія", "Михайло", "Юлія", "Володимир", "Тетяна", "Петро", "Ірина"
    ],
    en: [
      "Alex", "Maria", "James", "Emma", "John", "Olivia", "Michael", "Sophie",
      "David", "Emily", "Chris", "Julia", "Daniel", "Sarah", "Andrew", "Lisa"
    ]
  }

  const generateSamplePlayers = () => {
    const names = sampleNames[language]
    const shuffled = [...names].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 6) + 6
    setPlayers(shuffled.slice(0, count))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] bg-slate-900 text-white border-gray-700 max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white text-base">{t("simulationSettings")}</DialogTitle>
        </DialogHeader>

        {/* Language */}
        <div className="flex justify-center gap-1 mb-3">
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 py-1 ${language === "uk" ? "bg-blue-600" : "bg-slate-800"}`}
            onClick={() => setLanguage("uk")}
          >
            <FlagIcon country="uk" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 py-1 ${language === "en" ? "bg-blue-600" : "bg-slate-800"}`}
            onClick={() => setLanguage("en")}
          >
            <FlagIcon country="en" />
          </Button>
        </div>

        {/* Simulation Controls */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">{t("itemCount")}: {itemCount}</Label>
            <Slider min={1} max={300} step={1} value={[itemCount]} onValueChange={(v) => setItemCount(v[0])} />
          </div>

          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">{t("speed")}: {speed.toFixed(1)}x</Label>
            <Slider min={0.5} max={3} step={0.1} value={[speed]} onValueChange={(v) => setSpeed(v[0])} />
          </div>

          <div className="space-y-1">
            <Label className="text-gray-400 text-xs">{t("size")}: {itemSize}px</Label>
            <Slider min={5} max={60} step={1} value={[itemSize]} onValueChange={(v) => setItemSize(v[0])} />
          </div>
        </div>

        {/* Variation Selection */}
        <div className="mt-3">
          <Label className="text-gray-400 text-xs mb-2 block">{t("themes")}</Label>
          <div className="grid grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto">
            {Object.entries(variations).map(([key, val]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => setVariation(key)}
                className={`h-auto py-1.5 px-2 text-xs ${variation === key ? "bg-blue-600" : "bg-slate-800"}`}
              >
                <span>{val.items.slice(0, 3).join("")}</span>
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Switch id="random-var" checked={randomVariation} onCheckedChange={setRandomVariation} className="scale-75" />
              <Label htmlFor="random-var" className="text-gray-400 text-xs">{t("randomVariation")}</Label>
            </div>
            <Button variant="ghost" size="sm" onClick={showRules} className="text-xs px-2 py-1 h-auto">
              <Info className="h-3 w-3 mr-1" />{t("rules")}
            </Button>
          </div>
        </div>

        {/* Players */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Switch id="players" checked={playersEnabled} onCheckedChange={setPlayersEnabled} className="scale-75" />
              <Label htmlFor="players" className="text-gray-400 text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />{t("players")}
              </Label>
            </div>
            {playersEnabled && (
              <Button variant="ghost" size="sm" onClick={generateSamplePlayers} className="text-xs px-2 py-1 h-auto">
                <Shuffle className="h-3 w-3 mr-1" />{t("generateSample")}
              </Button>
            )}
          </div>
          {playersEnabled && (
            <Textarea
              placeholder={t("playersPlaceholder")}
              className="bg-slate-800 border-gray-700 text-white text-xs min-h-[80px] resize-none"
              value={players.join("\n")}
              onChange={(e) => setPlayers(e.target.value.split("\n").map(n => n.trim()).filter(n => n))}
            />
          )}
        </div>

        {/* Restart Button */}
        <Button
          onClick={onRestart}
          disabled={roundCompleting}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />{t("restart")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
