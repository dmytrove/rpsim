"use client"

import { useEffect, useRef } from "react"

interface GenerativeBackgroundProps {
  className?: string
}

// Particle class for background effects
class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  pulse: number
  pulseSpeed: number

  constructor(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 2 + 0.5
    this.speedX = (Math.random() - 0.5) * 0.3
    this.speedY = (Math.random() - 0.5) * 0.3
    this.opacity = Math.random() * 0.3 + 0.1
    this.pulse = Math.random() * Math.PI * 2
    this.pulseSpeed = Math.random() * 0.02 + 0.01

    // Random color from palette
    const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b"]
    this.color = colors[Math.floor(Math.random() * colors.length)]
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY
    this.pulse += this.pulseSpeed

    // Wrap around edges
    if (this.x < 0) this.x = width
    if (this.x > width) this.x = 0
    if (this.y < 0) this.y = height
    if (this.y > height) this.y = 0
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pulseOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse))
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color + Math.floor(pulseOpacity * 255).toString(16).padStart(2, '0')
    ctx.fill()
  }
}

// Connection line between nearby particles
function drawConnections(ctx: CanvasRenderingContext2D, particles: Particle[], maxDistance: number) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < maxDistance) {
        const opacity = (1 - distance / maxDistance) * 0.1
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
}

// Create gradient blob
function drawGradientBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  time: number
) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  const pulseRadius = Math.sin(time * 0.001) * 0.2 + 0.8

  gradient.addColorStop(0, color + "20")
  gradient.addColorStop(0.5 * pulseRadius, color + "10")
  gradient.addColorStop(1, color + "00")

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

export function GenerativeBackground({ className = "" }: GenerativeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)
  const blobsRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Reinitialize particles on resize
      initParticles()
      initBlobs()
    }

    // Initialize particles
    const initParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000)
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height))
      }
    }

    // Initialize gradient blobs
    const initBlobs = () => {
      const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e"]
      blobsRef.current = colors.map(color => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 200 + 150,
        color,
      }))
    }

    updateSize()
    window.addEventListener("resize", updateSize)

    // Animation loop
    const animate = (timestamp: number) => {
      timeRef.current = timestamp

      // Clear with slight trail effect
      ctx.fillStyle = "rgba(2, 6, 23, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw blobs
      for (const blob of blobsRef.current) {
        blob.x += blob.vx
        blob.y += blob.vy

        // Bounce off edges
        if (blob.x < -blob.radius || blob.x > canvas.width + blob.radius) blob.vx *= -1
        if (blob.y < -blob.radius || blob.y > canvas.height + blob.radius) blob.vy *= -1

        drawGradientBlob(ctx, blob.x, blob.y, blob.radius, blob.color, timestamp)
      }

      // Update and draw particles
      for (const particle of particlesRef.current) {
        particle.update(canvas.width, canvas.height)
        particle.draw(ctx)
      }

      // Draw connections (only check subset for performance)
      const connectionSubset = particlesRef.current.slice(0, Math.min(50, particlesRef.current.length))
      drawConnections(ctx, connectionSubset, 100)

      // Add subtle noise/dither effect
      if (Math.random() < 0.3) {
        const noiseCount = 20
        for (let i = 0; i < noiseCount; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          const size = Math.random() * 1 + 0.5
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`
          ctx.fillRect(x, y, size, size)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", updateSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  )
}
