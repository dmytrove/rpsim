"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { type Language, getTranslation } from "@/lib/translations"

interface Winner {
  type: number
  emoji: string
}

interface BattleHistoryProps {
  history: { winner: Winner; counts: number[]; duration: number }[]
  variations: Record<string, { name: string; items: string[] }>
  language: Language
}

export function BattleHistory({ history, variations, language }: BattleHistoryProps) {
  // Translate function
  const t = (key: Parameters<typeof getTranslation>[1]) => {
    return getTranslation(language, key)
  }

  if (history.length === 0) {
    return <div className="text-center text-sm text-gray-400 py-4">{t("noBattlesYet")}</div>
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {history.map((round, index) => (
          <div key={index} className="border border-gray-700 rounded-md p-3 bg-black/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">
                {t("round")} {history.length - index}
              </span>
              <span className="text-sm font-mono text-gray-300">{round.duration.toFixed(1)}s</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">{round.winner.emoji}</span>
              <span className="font-medium text-white">{t("winner")}</span>
              <span className="text-sm ml-auto text-gray-300">
                {round.counts[round.winner.type]} {t("items")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

