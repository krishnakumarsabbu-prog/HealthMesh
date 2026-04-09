import { motion } from "framer-motion"
import { Sparkles, TriangleAlert as AlertTriangle, TrendingUp, Info, CircleCheck as CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AI_FINDINGS } from "./data"
import { useApi } from "@/hooks/useApi"
import { getAppAiSummary, type AppAiInsight } from "@/lib/api/apps"

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
  anomaly: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Anomaly",
    color: "border-l-red-500",
    badgeColor: "bg-red-500/10 text-red-600",
    iconColor: "text-red-500",
  },
  prediction: {
    icon: <TrendingUp className="w-4 h-4" />,
    label: "Prediction",
    color: "border-l-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-600",
    iconColor: "text-blue-500",
  },
  optimization: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Optimization",
    color: "border-l-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-600",
    iconColor: "text-emerald-500",
  },
}

type FindingEntry = { type: string; title: string; body: string; confidence: number }

function apiInsightToFinding(i: AppAiInsight): FindingEntry {
  return {
    type: i.insight_type || "info",
    title: i.title,
    body: i.description,
    confidence: i.confidence,
  }
}

export function TabAISummary({ appId }: { appId: string }) {
  const { data: apiInsights } = useApi(() => getAppAiSummary(appId), [appId])

  const findings: FindingEntry[] = apiInsights && apiInsights.length > 0
    ? apiInsights.map(apiInsightToFinding)
    : AI_FINDINGS

  const summaryInsight = apiInsights?.find(i => i.insight_type === "summary") ?? apiInsights?.[0]
  const summaryText = summaryInsight?.description ?? null

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="premium-card p-5 border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Health Summary</span>
          <span className="text-[10px] text-muted-foreground ml-auto">Generated recently</span>
        </div>
        {summaryText ? (
          <p className="text-sm text-foreground/80 leading-relaxed">{summaryText}</p>
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong>{appId}</strong> is being analyzed. AI-generated health insights are based on real-time signals,
            historical patterns, and anomaly detection. Review the findings below for actionable intelligence.
          </p>
        )}
      </motion.div>

      <div className="space-y-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Findings</div>
        {findings.map((finding, i) => {
          const cfg = FINDING_CONFIG[finding.type as keyof typeof FINDING_CONFIG] || FINDING_CONFIG["info"]
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

      <div className="premium-card p-5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommended Checks</div>
        <div className="space-y-2">
          {(apiInsights?.filter(i => i.recommendation).slice(0, 4) ?? []).map((insight, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-xs text-foreground/80">{insight.recommendation}</span>
            </div>
          ))}
          {(!apiInsights || apiInsights.filter(i => i.recommendation).length === 0) && [
            "Review connection pool configuration for approaching thresholds",
            "Monitor deployment impact on latency metrics across endpoints",
            "Validate auto-scaling policies against current CPU utilization trends",
            "Check memory pressure patterns on pods flagged as warning",
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
