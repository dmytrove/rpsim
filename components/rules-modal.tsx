"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type Language, getTranslation } from "@/lib/translations"

interface RulesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variation: string
  variations: Record<string, { name: string; items: string[]; verbs: string[] }>
  colors: string[]
  language: Language
  rules: Record<string, { elements: number; beats: number[][] }>
}

export function RulesModal({ open, onOpenChange, variation, variations, colors, language, rules }: RulesModalProps) {
  const currentVariation = variations[variation]
  const currentRules = rules[variation as keyof typeof rules]
  const elements = currentRules.elements

  // Translate function
  const t = (key: Parameters<typeof getTranslation>[1]) => {
    return getTranslation(language, key)
  }

  // Adjust size based on element count
  const size = elements <= 3 ? 280 : elements <= 4 ? 320 : 360
  const radius = elements <= 3 ? 90 : elements <= 4 ? 110 : 130
  const nodeRadius = elements <= 3 ? 36 : elements <= 4 ? 32 : 28
  const fontSize = elements <= 3 ? 28 : elements <= 4 ? 24 : 20
  const center = size / 2

  // Calculate positions for elements in a circle
  const calculatePositions = (count: number) => {
    const positions = []
    for (let i = 0; i < count; i++) {
      // Start from the top and go clockwise
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2
      const x = center + radius * Math.cos(angle)
      const y = center + radius * Math.sin(angle)
      positions.push({ x, y, angle })
    }
    return positions
  }

  const positions = calculatePositions(elements)

  // Calculate curved arrow path with proper offset from nodes
  const getArrowPath = (fromIdx: number, toIdx: number) => {
    const from = positions[fromIdx]
    const to = positions[toIdx]

    // Calculate direction vector
    const dx = to.x - from.x
    const dy = to.y - from.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / distance
    const ny = dy / distance

    // Start and end points offset from node centers
    const startX = from.x + nx * (nodeRadius + 4)
    const startY = from.y + ny * (nodeRadius + 4)
    const endX = to.x - nx * (nodeRadius + 12)
    const endY = to.y - ny * (nodeRadius + 12)

    // Control point for curve (perpendicular offset)
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const curvature = 0.25
    const cpx = midX - ny * distance * curvature
    const cpy = midY + nx * distance * curvature

    return `M${startX},${startY} Q${cpx},${cpy} ${endX},${endY}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-fit bg-slate-900/95 text-white border-slate-700/50 backdrop-blur-md p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white text-lg flex items-center justify-center gap-2">
            {currentVariation.name}
          </DialogTitle>
        </DialogHeader>

        {/* SVG Rules Diagram */}
        <div className="flex justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-lg"
          >
            {/* Gradient definitions */}
            <defs>
              {/* Arrow markers for each color */}
              {colors.map((color, idx) => (
                <marker
                  key={`arrow-${idx}`}
                  id={`arrowhead-${idx}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="6"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 8 3, 0 6" fill={color} />
                </marker>
              ))}

              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Connection arrows */}
            {currentRules.beats.map((beatsArr, fromIdx) =>
              beatsArr.map((toIdx) => (
                <path
                  key={`arrow-${fromIdx}-${toIdx}`}
                  d={getArrowPath(fromIdx, toIdx)}
                  fill="none"
                  stroke={colors[fromIdx % colors.length]}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead-${fromIdx % colors.length})`}
                  opacity="0.8"
                />
              ))
            )}

            {/* Item nodes */}
            {positions.map((pos, idx) => (
              <g key={`node-${idx}`} filter="url(#glow)">
                {/* Node background circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={`${colors[idx % colors.length]}30`}
                  stroke={colors[idx % colors.length]}
                  strokeWidth="2"
                />
                {/* Emoji */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                >
                  {currentVariation.items[idx]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Compact legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2 text-sm text-gray-300">
          {currentRules.beats.map((beatsArr, fromIdx) =>
            beatsArr.map((toIdx) => (
              <span key={`legend-${fromIdx}-${toIdx}`} className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-base">{currentVariation.items[fromIdx]}</span>
                <span className="text-xs" style={{ color: colors[fromIdx % colors.length] }}>→</span>
                <span className="text-base">{currentVariation.items[toIdx]}</span>
              </span>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
