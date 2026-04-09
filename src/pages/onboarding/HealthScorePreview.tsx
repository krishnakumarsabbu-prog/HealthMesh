import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { WeightConfig } from "./data"

interface Props {
  weights: WeightConfig[]
  appName: string
}

const SIMULATED_VALUES = [88, 99, 96, 72, 100]

function ring(score: number) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444"
  return { r, circ, offset, color }
}

export function HealthScorePreview({ weights, appName }: Props) {
  const totalWeight = weights.reduce((s, w) => s + w.weight, 0)
  const normalizedScore = Math.round(
    weights.reduce((sum, w, i) => sum + (SIMULATED_VALUES[i] || 90) * (w.weight / Math.max(totalWeight, 1)), 0)
  )
  const { r, circ, offset, color } = ring(normalizedScore)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="premium-card p-5">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Health Score Preview</div>

      <div className="flex items-center gap-6">
        <div className="shrink-0">
          <svg width="108" height="108" viewBox="0 0 108 108">
            <circle cx="54" cy="54" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="9" />
            <motion.circle
              cx="54" cy="54" r={r} fill="none"
              stroke={color} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              transform="rotate(-90 54 54)"
            />
            <text x="54" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>{normalizedScore}</text>
            <text x="54" y="63" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">Score</text>
          </svg>
        </div>

        <div className="flex-1 space-y-2">
          {weights.map((w, i) => (
            <div key={w.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: w.color }} />
              <span className="text-[11px] text-muted-foreground w-24 shrink-0">{w.label}</span>
              <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: w.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${SIMULATED_VALUES[i] || 90}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] font-mono text-foreground w-6 text-right">{SIMULATED_VALUES[i]}</span>
              <span className="text-[10px] text-muted-foreground">({w.weight}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
        Simulated score based on typical baselines for <span className="font-mono font-semibold text-foreground">{appName || "your-app"}</span>. Real values will update within 30s of activation.
      </div>
    </motion.div>
  )
}
