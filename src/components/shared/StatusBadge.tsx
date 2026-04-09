import { cn } from "@/lib/utils"
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Circle as XCircle, Circle, CircleAlert as AlertCircle } from "lucide-react"

type Status = "healthy" | "warning" | "critical" | "degraded" | "unknown"

interface StatusBadgeProps {
  status: Status
  showIcon?: boolean
  showDot?: boolean
  size?: "sm" | "default" | "lg"
  className?: string
}

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
    Icon: CheckCircle2,
  },
  warning: {
    label: "Warning",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]",
    Icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)] animate-pulse",
    Icon: XCircle,
  },
  degraded: {
    label: "Degraded",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    dot: "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]",
    Icon: AlertCircle,
  },
  unknown: {
    label: "Unknown",
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
    Icon: Circle,
  },
}

export function StatusBadge({ status, showIcon = false, showDot = true, size = "default", className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.Icon

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    default: "text-xs px-2.5 py-0.5 gap-1.5",
    lg: "text-sm px-3 py-1 gap-2",
  }

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    default: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    default: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-medium border",
      cfg.bg, cfg.color, cfg.border,
      sizeClasses[size],
      className
    )}>
      {showDot && !showIcon && (
        <span className={cn("rounded-full shrink-0", cfg.dot, dotSizes[size])} />
      )}
      {showIcon && (
        <Icon className={cn("shrink-0", cfg.color, iconSizes[size])} />
      )}
      {cfg.label}
    </span>
  )
}
