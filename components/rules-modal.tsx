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

  // Calculate positions for elements in a circle
  const calculatePositions = (count: number, radius: number, centerX: number, centerY: number) => {
    const positions = []
    for (let i = 0; i < count; i++) {
      // Start from the top and go clockwise
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      positions.push({ x, y, angle })
    }
    return positions
  }

  // Calculate curved path between two positions
  const getCurvedPath = (start: { x: number; y: number }, end: { x: number; y: number }, curvature = 0.2) => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Midpoint
    const mx = start.x + dx / 2
    const my = start.y + dy / 2

    // Get perpendicular direction
    const perpX = -dy / distance
    const perpY = dx / distance

    // Control point
    const cpx = mx + perpX * distance * curvature
    const cpy = my + perpY * distance * curvature

    return `M${start.x},${start.y} Q${cpx},${cpy} ${end.x},${end.y}`
  }

  // Generate the rules diagram SVG
  const generateRulesDiagram = () => {
    const centerX = 200
    const centerY = 200
    const radius = 120

    const positions = calculatePositions(elements, radius, centerX, centerY)

    return (
      <svg width="400" height="400" viewBox="0 0 400 400">
        {/* Background polygon connecting items */}
        {elements > 2 && (
          <polygon
            points={positions.map((pos) => `${pos.x},${pos.y}`).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        )}

        {/* Relationship arrows */}
        {currentRules.beats.map((beatsArr, fromIdx) =>
          beatsArr.map((toIdx) => {
            const start = {
              x: positions[fromIdx].x + 15 * Math.cos(positions[fromIdx].angle),
              y: positions[fromIdx].y + 15 * Math.sin(positions[fromIdx].angle),
            }
            const end = {
              x: positions[toIdx].x + 15 * Math.cos(positions[toIdx].angle),
              y: positions[toIdx].y + 15 * Math.sin(positions[toIdx].angle),
            }

            // Define label position
            const pathMidpoint = {
              x: (start.x + end.x) / 2,
              y: (start.y + end.y) / 2,
            }

            return (
              <g key={`${fromIdx}-${toIdx}`}>
                <path
                  d={getCurvedPath(start, end, 0.3)}
                  fill="none"
                  stroke={colors[fromIdx % colors.length]}
                  strokeWidth="3"
                  markerEnd={`url(#arrowhead${fromIdx})`}
                />
                <text
                  x={pathMidpoint.x}
                  y={pathMidpoint.y}
                  textAnchor="middle"
                  fill={colors[fromIdx % colors.length]}
                  fontSize="12"
                  dy="-5"
                >
                  {currentVariation.verbs[fromIdx]}
                </text>
              </g>
            )
          }),
        )}

        {/* Item circles */}
        {positions.map((pos, idx) => (
          <g key={idx}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="40"
              fill={`${colors[idx % colors.length]}40`}
              stroke={colors[idx % colors.length]}
              strokeWidth="2"
            />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="30">
              {currentVariation.items[idx]}
            </text>
          </g>
        ))}

        {/* Arrow definitions */}
        <defs>
          {positions.map((_, idx) => (
            <marker
              key={idx}
              id={`arrowhead${idx}`}
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={colors[idx % colors.length]} />
            </marker>
          ))}
        </defs>
      </svg>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            {currentVariation.items.join(" ")} {t("rules")}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium mb-2">
              {currentVariation.name} {t("variation")}
            </h3>
            <p className="text-gray-300">{t("eachItemHasStrengthWeakness")}</p>
          </div>

          {/* SVG Rules Diagram */}
          <div className="flex justify-center">{generateRulesDiagram()}</div>

          {/* Text explanation */}
          <div className="mt-6 space-y-2 text-gray-300">
            {currentRules.beats.map((beatsArr, fromIdx) =>
              beatsArr.map((toIdx) => (
                <p key={`${fromIdx}-${toIdx}`} className="flex items-center">
                  <span className="text-2xl mr-2">{currentVariation.items[fromIdx]}</span>
                  <span style={{ color: colors[fromIdx % colors.length] }}>{currentVariation.verbs[fromIdx]}</span>
                  <span className="text-2xl mx-2">{currentVariation.items[toIdx]}</span>
                </p>
              )),
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

