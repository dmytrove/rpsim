"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Volume2,
  VolumeX,
  History,
  Play,
  Pause,
  RefreshCw,
  Info,
  Sliders,
  Palette,
  Monitor,
  Gamepad2,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
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
  soundEnabled,
  setSoundEnabled,
  showHistory,
  setShowHistory,
  onRestart,
  isRunning,
  setIsRunning,
  variation,
  setVariation,
  variations,
  showRules,
  randomVariation,
  setRandomVariation,
  language,
  setLanguage,
  roundCompleting,
}: SettingsModalProps) {
  const isMobile = useMobile()

  // Translate function
  const t = (key: Parameters<typeof getTranslation>[1]) => {
    return getTranslation(language, key)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{t("simulationSettings")}</DialogTitle>
        </DialogHeader>

        {/* Language Switcher - More Prominent */}
        <div className="flex justify-center mb-4">
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <Button
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 rounded-none ${language === "uk" ? "bg-blue-600" : "bg-slate-800 hover:bg-slate-700"}`}
              onClick={() => setLanguage("uk")}
            >
              <FlagIcon country="uk" />
              <span>{t("ukrainian")}</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex items-center gap-2 px-4 py-2 rounded-none ${language === "en" ? "bg-blue-600" : "bg-slate-800 hover:bg-slate-700"}`}
              onClick={() => setLanguage("en")}
            >
              <FlagIcon country="en" />
              <span>{t("english")}</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="simulation" className="mt-4">
          <TooltipProvider delayDuration={300}>
            <TabsList className="grid grid-cols-4 w-full bg-slate-800">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="simulation" className="data-[state=active]:bg-slate-700" aria-label={t("simulation")}>
                    <Sliders className="h-5 w-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                  {t("simulation")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="themes" className="data-[state=active]:bg-slate-700" aria-label={t("themes")}>
                    <Palette className="h-5 w-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                  {t("themes")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="display" className="data-[state=active]:bg-slate-700" aria-label={t("display")}>
                    <Monitor className="h-5 w-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                  {t("display")}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="controls" className="data-[state=active]:bg-slate-700" aria-label={t("controls")}>
                    <Gamepad2 className="h-5 w-5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 text-white border-slate-700">
                  {t("controls")}
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>

          {/* Simulation Settings */}
          <TabsContent value="simulation" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="item-count" className="text-gray-300">
                  {t("itemCount")}: {itemCount}
                </Label>
              </div>
              <Slider
                id="item-count"
                min={1}
                max={20}
                step={1}
                value={[itemCount]}
                onValueChange={(value) => setItemCount(value[0])}
                className="[&_[role=slider]]:bg-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="speed" className="text-gray-300">
                  {t("speed")}: {speed.toFixed(1)}x
                </Label>
              </div>
              <Slider
                id="speed"
                min={0.5}
                max={3}
                step={0.1}
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                className="[&_[role=slider]]:bg-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="size" className="text-gray-300">
                  {t("size")}: {itemSize}px
                </Label>
              </div>
              <Slider
                id="size"
                min={5}
                max={60}
                step={1}
                value={[itemSize]}
                onValueChange={(value) => setItemSize(value[0])}
                className="[&_[role=slider]]:bg-blue-500"
              />
            </div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="pt-4 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(variations).map(([key, val]) => (
                <Button
                  key={key}
                  variant={variation === key ? "default" : "outline"}
                  onClick={() => setVariation(key)}
                  className={`h-auto py-2 ${variation === key ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800 hover:bg-slate-700 border-gray-700"}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs">{val.name}</span>
                    <span className="text-lg mt-1">{val.items.join("")}</span>
                  </div>
                </Button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={showRules} className="bg-slate-800 hover:bg-slate-700">
                <Info className="h-4 w-4 mr-2" />
                {t("viewRulesDiagram")}
              </Button>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <Switch id="random-variation" checked={randomVariation} onCheckedChange={setRandomVariation} />
              <Label htmlFor="random-variation" className="text-gray-300">
                {t("randomVariation")}
              </Label>
            </div>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="refresh" className="text-gray-300">
                  {t("updateRate")}: {refreshRate.toFixed(1)}s
                </Label>
              </div>
              <Slider
                id="refresh"
                min={0.1}
                max={2}
                step={0.1}
                value={[refreshRate]}
                onValueChange={(value) => setRefreshRate(value[0])}
                className="[&_[role=slider]]:bg-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-history" checked={showHistory} onCheckedChange={setShowHistory} />
              <Label htmlFor="show-history" className="flex items-center gap-2 text-gray-300">
                <History className="h-4 w-4" />
                {t("showBattleHistory")}
              </Label>
            </div>
          </TabsContent>

          {/* Controls Settings */}
          <TabsContent value="controls" className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              <Label htmlFor="sound-enabled" className="flex items-center gap-2 text-gray-300">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {t("soundEffects")}
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border-gray-700"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    {t("pause")}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {t("resume")}
                  </>
                )}
              </Button>

              <Button
                variant="default"
                onClick={onRestart}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={roundCompleting}
              >
                <RefreshCw className="h-4 w-4" />
                {t("restart")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

