"use client"

import { useEffect } from "react"
import RPSBattleSimulator from "@/components/rps-battle-simulator"
import { registerServiceWorker } from "./pwa-register"

export default function Home() {
  // Register service worker for PWA
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-950">
      <RPSBattleSimulator />
    </main>
  )
}

