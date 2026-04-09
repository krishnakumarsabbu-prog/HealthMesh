import { motion } from "framer-motion"
import { Sparkles, TrendingUp, TriangleAlert as AlertTriangle, Zap, Brain, ArrowUpRight, CircleCheck as CheckCircle2, Clock, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const INSIGHTS = [
  {
    type: "anomaly",
    priority: "high",
    title: "Unusual traffic surge — EU region",
    desc: "search-api is receiving 3.2× the normal request volume from European IP ranges. Pattern matches synthetic load or scraping activity rather than organic user traffic. No corresponding CDN cache-miss uplift detected.",
    confidence: 94,
    impact: "High — Potential SLO breach in 20min",
    recommendation: "Investigate WAF logs and consider rate limiting for EU/DE subnet ranges. Alert the security team.",
    app: "search-api",
    age: "6m ago",
  },
  {
    type: "prediction",
    priority: "high",
    title: "Memory exhaustion predicted — auth-service",
    desc: "Current memory growth rate of 2.4MB/min will cause auth-service pods to reach OOM threshold (95%) in approximately 4 hours. Root cause traces to unclosed Redis connections in session refresh path.",
    confidence: 87,
    impact: "High — Service degradation / outage risk",
    recommendation: "Fix Redis connection leak in session refresh handler. Consider increasing pod memory limits as a temporary measure.",
    app: "auth-service",
    age: "12m ago",
  },
  {
    type: "correlation",
    priority: "medium",
    title: "GC pause correlation with recommendation latency",
    desc: "recommendation-engine latency spikes show strong positive correlation (r=0.91) with GC pause events on database-replica-2. The latency spikes are secondary effects, not primary causes.",
    confidence: 91,
    impact: "Medium — Contributes to P95 degradation",
    recommendation: "Tune JVM GC settings on database-replica-2. Consider migrating recommendation reads to db-replica-3.",
    app: "recommendation-engine",
    age: "34m ago",
  },
  {
    type: "optimization",
    priority: "low",
    title: "Catalog caching opportunity",
    desc: "catalog-service product detail endpoints show 89% cache-hit ratio on hot SKUs, but 100 long-tail SKUs account for 34% of database reads. Adding a secondary cache tier could reduce DB load by ~28%.",
    confidence: 82,
    impact: "Low — Cost optimization opportunity",
    recommendation: "Implement an LRU secondary cache for long-tail SKUs with a 5-minute TTL. Estimated 28% DB read reduction.",
    app: "catalog-service",
    age: "1h ago",
  },
  {
    type: "capacity",
    priority: "medium",
    title: "payments-api approaching connection limit",
    desc: "Database connection pool utilization has averaged 78% for the past 6 hours during peak hours. Projected to hit 95% threshold during next business day peak at current growth rate.",
    confidence: 89,
    impact: "Medium — Connection exhaustion risk during peak",
    recommendation: "Increase connection pool size from 50 to 75. Consider PgBouncer for connection multiplexing.",
    app: "payments-api",
    age: "2h ago",
  },
]

const TYPE_META = {
  anomaly: { label: "Anomaly", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  prediction: { label: "Prediction", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  correlation: { label: "Correlation", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  optimization: { label: "Optimization", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  capacity: { label: "Capacity", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
}

const CONFIDENCE_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  accuracy: 72 + i * 2 + Math.random() * 4,
}))

export function AIInsights() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="AI Insights"
        description="Machine learning-powered anomaly detection, predictions, and root cause analysis"
        badge={<Badge variant="secondary" size="sm"><Brain className="w-3 h-3 mr-1" />5 new insights</Badge>}
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Model stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Model Accuracy", value: "94.2%", sub: "Last 30 days", icon: <Brain className="w-4 h-4 text-primary" /> },
            { label: "Insights Generated", value: "1,284", sub: "This month", icon: <Sparkles className="w-4 h-4 text-primary" /> },
            { label: "Incidents Predicted", value: "47", sub: "Before they occurred", icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
            { label: "False Positives", value: "3.8%", sub: "Industry avg: 12%", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="premium-card p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">{s.icon}</div>
              <div>
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Insights list */}
        <div className="space-y-4">
          {INSIGHTS.map((insight, i) => {
            const meta = TYPE_META[insight.type as keyof typeof TYPE_META]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="premium-card p-5 group cursor-pointer hover:border-primary/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", meta.bg)}>
                    <Sparkles className={cn("w-4 h-4", meta.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", meta.bg, meta.color, meta.border)}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{insight.app}</span>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        insight.priority === "high" ? "bg-red-500/10 text-red-500" :
                        insight.priority === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                      )}>
                        {insight.priority.toUpperCase()}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {insight.age}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-foreground mb-2">{insight.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-3">{insight.desc}</div>

                    <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 mb-3">
                      <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Recommendation</div>
                      <div className="text-xs text-foreground/80">{insight.recommendation}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${insight.confidence}%` }}
                              transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                              className={cn("h-full rounded-full", insight.confidence >= 90 ? "bg-emerald-500" : insight.confidence >= 80 ? "bg-amber-500" : "bg-muted-foreground")}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground">{insight.confidence}%</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                        View details <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
