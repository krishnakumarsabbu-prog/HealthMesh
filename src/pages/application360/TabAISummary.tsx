import { motion } from "framer-motion"
import { Sparkles, TriangleAlert as AlertTriangle, TrendingUp, Info, CircleCheck as CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AI_FINDINGS } from "./data"

const FINDING_CONFIG = {
  risk: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Risk",
    color: "border-l-amber-500",
    badgeColor: "bg-amber-500/10 text-amber-600",
    iconColor: "text-amber-500",
  },
  insight: {
    icon: <TrendingUp className="w-4 h-4" />,
    label: "Insight",
    color: "border-l-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-600",
    iconColor: "text-blue-500",
  },
  positive: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Positive",
    color: "border-l-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-600",
    iconColor: "text-emerald-500",
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    label: "Info",
    color: "border-l-slate-400",
    badgeColor: "bg-muted text-muted-foreground",
    iconColor: "text-muted-foreground",
  },
}

export function TabAISummary() {
  return (
    <div className="space-y-4">
      {/* AI summary card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="premium-card p-5 border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Health Summary</span>
          <span className="text-[10px] text-muted-foreground ml-auto">Generated 2 min ago</span>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          <strong>payments-api</strong> is in a <strong className="text-emerald-600">healthy state</strong> with a composite score of 94/100.
          Performance has improved notably since the v2.14.1 deployment 14 hours ago, with P99 latency decreasing by 22ms.
          Two signals are approaching threshold — Redis connection pool utilization (74%) and memory pressure on pod{" "}
          <span className="font-mono">payments-api-d8f9b-vq2xs</span> (81%). No active incidents.
          The{" "}
          <span className="font-mono text-red-500">GET /v2/payments/methods</span>{" "}
          endpoint continues to show elevated P99 latency (445ms) and an error rate of 1.2%, possibly due to a regression introduced in v2.14.0.
        </p>
      </motion.div>

      {/* Finding cards */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Findings</div>
        {AI_FINDINGS.map((finding, i) => {
          const cfg = FINDING_CONFIG[finding.type as keyof typeof FINDING_CONFIG]
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
              className={cn("premium-card p-4 border-l-2", cfg.color)}>
              <div className="flex items-start gap-3">
                <span className={cn("mt-0.5 shrink-0", cfg.iconColor)}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", cfg.badgeColor)}>{cfg.label}</span>
                    <span className="text-sm font-semibold text-foreground">{finding.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">Confidence: {finding.confidence}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{finding.body}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recommended checks */}
      <div className="premium-card p-5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommended Checks</div>
        <div className="space-y-2">
          {[
            "Review Redis connection pool configuration and consider increasing max pool size from 50 to 80",
            "Investigate GET /payments/methods query introduced in v2.14.0 for N+1 or unindexed join",
            "Set a memory alert at 78% for pod payments-api-d8f9b-vq2xs to get early warning before threshold",
            "Review auto-scaling policy: current CPU trigger (85%) may be too conservative given 88% usage on one pod",
          ].map((check, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-xs text-foreground/80">{check}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
