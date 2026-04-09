import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: number
  trendLabel?: string
  status?: "healthy" | "warning" | "critical" | "neutral"
  icon?: React.ReactNode
  description?: string
  className?: string
}

export function MetricCard({
  label, value, unit, trend, trendLabel, status = "neutral",
  icon, description, className
}: MetricCardProps) {
  const statusColors = {
    healthy: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-red-500",
    neutral: "text-muted-foreground",
  }

  const trendIcon = trend && trend > 0
    ? <TrendingUp className="w-3 h-3" />
    : trend && trend < 0
    ? <TrendingDown className="w-3 h-3" />
    : <Minus className="w-3 h-3" />

  const trendColor = trend && trend > 0
    ? status === "critical" ? "text-red-500" : "text-emerald-500"
    : trend && trend < 0
    ? status === "healthy" ? "text-red-500" : "text-emerald-500"
    : "text-muted-foreground"

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "premium-card p-5 group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all duration-200">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5 mb-2">
        <span className={cn("text-2xl font-bold tracking-tight", statusColors[status])}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>}
      </div>

      {(trend !== undefined || description) && (
        <div className="flex items-center gap-1.5">
          {trend !== undefined && (
            <span className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              {trendIcon}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {trendLabel || description}
          </span>
        </div>
      )}
    </motion.div>
  )
}
