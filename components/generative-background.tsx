"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"

// Color palettes for variety
const COLOR_PALETTES = [
  ["#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b"], // Default
  ["#ec4899", "#f43f5e", "#f97316", "#fbbf24", "#a3e635"], // Warm sunset
  ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"], // Cool blues
  ["#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9"], // Ocean
  ["#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6"], // Purple pink
]

// Random scene configuration generated once per mount
function useSceneConfig() {
  return useMemo(() => {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]
    const particleCount = Math.floor(Math.random() * 60) + 60 // 60-120
    const orbCount = Math.floor(Math.random() * 4) + 4 // 4-8 orbs
    const rotationSpeed = (Math.random() * 0.02) + 0.01
    const driftSpeed = (Math.random() * 0.3) + 0.2
    const bloomIntensity = Math.random() * 0.3 + 0.2

    // Generate random orb configurations
    const orbs = Array.from({ length: orbCount }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10,
        (Math.random() * -4) - 2,
      ] as [number, number, number],
      color: palette[Math.floor(Math.random() * palette.length)],
      speed: Math.random() * 0.8 + 0.4,
      size: Math.random() * 0.6 + 0.4,
    }))

    return { palette, particleCount, orbs, rotationSpeed, driftSpeed, bloomIntensity }
  }, [])
}

// Particles with variable behavior
function Particles({ count, palette, rotationSpeed, driftSpeed }: {
  count: number
  palette: string[]
  rotationSpeed: number
  driftSpeed: number
}) {
  const mesh = useRef<THREE.Points>(null)
  const velocities = useRef<Float32Array>()

  const { geometry } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const vels = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 25
      positions[i3 + 1] = (Math.random() - 0.5) * 20
      positions[i3 + 2] = (Math.random() - 0.5) * 15

      // Random velocities for drifting
      vels[i3] = (Math.random() - 0.5) * driftSpeed * 0.02
      vels[i3 + 1] = (Math.random() - 0.5) * driftSpeed * 0.02
      vels[i3 + 2] = (Math.random() - 0.5) * driftSpeed * 0.01

      const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)])
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    velocities.current = vels

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    return { geometry: geo }
  }, [count, palette, driftSpeed])

  useFrame((state) => {
    if (mesh.current && velocities.current) {
      // Rotate entire particle system
      mesh.current.rotation.y = state.clock.elapsedTime * rotationSpeed
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * rotationSpeed * 0.5) * 0.15

      // Drift individual particles
      const positions = mesh.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3] += velocities.current[i3]
        positions[i3 + 1] += velocities.current[i3 + 1]
        positions[i3 + 2] += velocities.current[i3 + 2]

        // Wrap around bounds
        if (Math.abs(positions[i3]) > 15) velocities.current[i3] *= -1
        if (Math.abs(positions[i3 + 1]) > 12) velocities.current[i3 + 1] *= -1
        if (Math.abs(positions[i3 + 2]) > 10) velocities.current[i3 + 2] *= -1
      }
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Floating orb with variable size
function FloatingOrb({ position, color, speed, size }: {
  position: [number, number, number]
  color: string
  speed: number
  size: number
}) {
  const mesh = useRef<THREE.Mesh>(null)
  const initialPos = useRef(position)
  const phase = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (mesh.current) {
      const t = state.clock.elapsedTime * speed + phase.current
      mesh.current.position.x = initialPos.current[0] + Math.sin(t * 0.3) * 2.5
      mesh.current.position.y = initialPos.current[1] + Math.cos(t * 0.2) * 2
      mesh.current.position.z = initialPos.current[2] + Math.sin(t * 0.15) * 1

      const scale = size * (1 + Math.sin(t * 0.8) * 0.15)
      mesh.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.8, 24, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.25}
        roughness={0.3}
      />
    </mesh>
  )
}

// Animated nebula clouds
function NebulaClouds({ palette }: { palette: string[] }) {
  const group = useRef<THREE.Group>(null)

  const clouds = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, -8 - i * 2] as [number, number, number],
      color: palette[i % palette.length],
      scale: Math.random() * 3 + 2,
      speed: Math.random() * 0.1 + 0.05,
    }))
  }, [palette])

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <group ref={group}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.position}>
          <planeGeometry args={[cloud.scale * 2, cloud.scale * 2]} />
          <meshBasicMaterial
            color={cloud.color}
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// Grid with variable style
function GridLines({ palette }: { palette: string[] }) {
  const mesh = useRef<THREE.LineSegments>(null)
  const gridColor = useMemo(() => {
    const color = new THREE.Color(palette[0])
    color.multiplyScalar(0.3)
    return color
  }, [palette])

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.008
      mesh.current.rotation.z = state.clock.elapsedTime * 0.004
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions: number[] = []
    const size = 24
    const divisions = 16
    const step = size / divisions

    for (let i = -size / 2; i <= size / 2; i += step) {
      positions.push(-size / 2, i, -6, size / 2, i, -6)
      positions.push(i, -size / 2, -6, i, size / 2, -6)
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  return (
    <lineSegments ref={mesh} geometry={geometry}>
      <lineBasicMaterial color={gridColor} transparent opacity={0.12} />
    </lineSegments>
  )
}

// Main scene with randomized configuration
function Scene() {
  const config = useSceneConfig()

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color={config.palette[0]} />

      <Particles
        count={config.particleCount}
        palette={config.palette}
        rotationSpeed={config.rotationSpeed}
        driftSpeed={config.driftSpeed}
      />

      {config.orbs.map((orb, i) => (
        <FloatingOrb
          key={i}
          position={orb.position}
          color={orb.color}
          speed={orb.speed}
          size={orb.size}
        />
      ))}

      <NebulaClouds palette={config.palette} />
      <GridLines palette={config.palette} />

      <EffectComposer>
        <Bloom
          intensity={config.bloomIntensity}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  )
}

interface GenerativeBackgroundProps {
  className?: string
}

export function GenerativeBackground({ className = "" }: GenerativeBackgroundProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
