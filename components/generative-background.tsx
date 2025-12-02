"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"

// Floating particles component (reduced for performance)
function Particles({ count = 100 }) {
  const mesh = useRef<THREE.Points>(null)
  const light = useRef<THREE.PointLight>(null)

  // Generate particle positions and colors
  const { geometry } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const colorPalette = [
      new THREE.Color("#3b82f6"), // blue
      new THREE.Color("#8b5cf6"), // purple
      new THREE.Color("#06b6d4"), // cyan
      new THREE.Color("#22c55e"), // green
      new THREE.Color("#f59e0b"), // amber
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 20
      positions[i3 + 2] = (Math.random() - 0.5) * 10

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    return { geometry: geo }
  }, [count])

  // Animation
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1

      // Animate individual particles
      const positions = mesh.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001
      }
      mesh.current.geometry.attributes.position.needsUpdate = true
    }

    if (light.current) {
      light.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 5
      light.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 5
    }
  })

  return (
    <>
      <pointLight ref={light} distance={15} intensity={2} color="#3b82f6" />
      <points ref={mesh} geometry={geometry}>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}

// Floating blob/orb component
function FloatingOrb({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const mesh = useRef<THREE.Mesh>(null)
  const initialPos = useRef(position)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.x = initialPos.current[0] + Math.sin(state.clock.elapsedTime * speed * 0.3) * 2
      mesh.current.position.y = initialPos.current[1] + Math.cos(state.clock.elapsedTime * speed * 0.2) * 1.5
      mesh.current.position.z = initialPos.current[2] + Math.sin(state.clock.elapsedTime * speed * 0.1) * 0.5

      // Pulse scale
      const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.1
      mesh.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  )
}

// Animated grid lines
function GridLines() {
  const mesh = useRef<THREE.LineSegments>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.01
      mesh.current.rotation.z = state.clock.elapsedTime * 0.005
    }
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions: number[] = []

    // Create grid
    const size = 20
    const divisions = 20
    const step = size / divisions

    for (let i = -size / 2; i <= size / 2; i += step) {
      // Horizontal lines
      positions.push(-size / 2, i, -5, size / 2, i, -5)
      // Vertical lines
      positions.push(i, -size / 2, -5, i, size / 2, -5)
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])

  return (
    <lineSegments ref={mesh} geometry={geometry}>
      <lineBasicMaterial color="#1e3a5f" transparent opacity={0.15} />
    </lineSegments>
  )
}

// Main scene
function Scene() {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.2} />

      {/* Particles (reduced for performance) */}
      <Particles count={80} />

      {/* Floating orbs */}
      <FloatingOrb position={[-4, 2, -3]} color="#3b82f6" speed={0.8} />
      <FloatingOrb position={[3, -1, -4]} color="#8b5cf6" speed={1.2} />
      <FloatingOrb position={[0, 3, -2]} color="#06b6d4" speed={0.6} />
      <FloatingOrb position={[-2, -3, -3]} color="#22c55e" speed={1.0} />
      <FloatingOrb position={[5, 1, -5]} color="#f59e0b" speed={0.9} />

      {/* Grid */}
      <GridLines />

      {/* Post-processing effects (simplified for performance) */}
      <EffectComposer>
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.5}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
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
        camera={{ position: [0, 0, 8], fov: 60 }}
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
