import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Sparkles, TrendingUp, TriangleAlert as AlertTriangle, Zap, Brain, ArrowUpRight, CircleCheck as CheckCircle, Clock, RefreshCw, Send, ChevronRight, GitBranch, Activity, Eye } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from "recharts"
import { useApi } from "@/hooks/useApi"
import { listAiInsights, type AiInsight as ApiAiInsight } from "@/lib/api/misc"

type InsightEntry = {
  type: string; priority: string; title: string; desc: string; confidence: number;
  impact: string; recommendation: string; app: string; age: string;
  signals: string[]; whatChanged: string;
}

function apiToInsight(a: ApiAiInsight): InsightEntry {
  return {
    type: a.insight_type, priority: a.priority, title: a.title, desc: a.description,
    confidence: a.confidence, impact: a.impact, recommendation: a.recommendation,
    app: a.app_name, age: a.generated_at, signals: a.signals || [],
    whatChanged: a.what_changed,
  }
}

const STATIC_INSIGHTS: InsightEntry[] = [
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
    signals: ["request_rate +220%", "latency p99 +44%", "cache_miss stable"],
    whatChanged: "Inbound request volume tripled from EU region between 14:31–14:38 with no matching user session growth.",
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
    signals: ["memory +2.4MB/min", "redis_conns +18%", "gc_pauses +40%"],
    whatChanged: "Memory growth rate accelerated 2.8× after session management config update at 13:22.",
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
    signals: ["latency p95 +28%", "gc_pause_ms +180ms", "db_replica_lag +12ms"],
    whatChanged: "GC pause frequency on db-replica-2 increased 3× starting at 11:45. Correlates with latency spike (r=0.91).",
  },
  {
    type: "optimization",
    priority: "low",
    title: "Catalog caching opportunity identified",
    desc: "catalog-service product detail endpoints show 89% cache-hit ratio on hot SKUs, but 100 long-tail SKUs account for 34% of database reads. Adding a secondary cache tier could reduce DB load by ~28%.",
    confidence: 82,
    impact: "Low — Cost optimization opportunity",
    recommendation: "Implement an LRU secondary cache for long-tail SKUs with a 5-minute TTL. Estimated 28% DB read reduction.",
    app: "catalog-service",
    age: "1h ago",
    signals: ["cache_miss 34% long-tail", "db_reads +28%", "response_time stable"],
    whatChanged: "Long-tail cache misses have been trending upward since new product catalog expansion last week.",
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
    signals: ["conn_pool 78% avg", "peak_conn 94%", "query_wait +12ms"],
    whatChanged: "Connection pool usage has grown 8% week-over-week for the past 3 weeks, driven by payment volume growth.",
  },
]

const TYPE_META = {
  anomaly: { label: "Anomaly", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", accent: "border-l-red-500", icon: <AlertTriangle className="w-4 h-4" /> },
  prediction: { label: "Prediction", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", accent: "border-l-amber-500", icon: <TrendingUp className="w-4 h-4" /> },
  correlation: { label: "Correlation", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", accent: "border-l-blue-500", icon: <GitBranch className="w-4 h-4" /> },
  optimization: { label: "Optimization", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", accent: "border-l-emerald-500", icon: <Zap className="w-4 h-4" /> },
  capacity: { label: "Capacity", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", accent: "border-l-orange-500", icon: <Activity className="w-4 h-4" /> },
}

const SUGGESTED_PROMPTS = [
  "Why did search-api latency spike today?",
  "Which apps are most at risk in the next 24h?",
  "What changed in auth-service recently?",
  "Show me anomalies affecting payments-api",
  "What's driving the increase in error rates?",
]

const ACCURACY_DATA = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}h`,
  accuracy: 88 + Math.sin(i * 0.3) * 4 + Math.random() * 2,
  insights: Math.floor(3 + Math.random() * 8),
}))

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "11px",
    color: "hsl(var(--foreground))",
  }
}

const PRIORITY_META = {
  high: { label: "HIGH", cls: "bg-red-500/10 text-red-500 border border-red-500/20" },
  medium: { cls: "bg-amber-500/10 text-amber-500 border border-amber-500/20", label: "MED" },
  low: { cls: "bg-muted text-muted-foreground border border-border/40", label: "LOW" },
}

export function AIInsights() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [askInput, setAskInput] = useState("")
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null)

  const { data: apiInsights } = useApi(listAiInsights)
  const INSIGHTS: InsightEntry[] = apiInsights && apiInsights.length > 0
    ? apiInsights.map(apiToInsight)
    : STATIC_INSIGHTS

  const filtered = INSIGHTS.filter(i => {
    const matchType = typeFilter === "all" || i.type === typeFilter
    const matchPriority = priorityFilter === "all" || i.priority === priorityFilter
    return matchType && matchPriority
  })

  const handleAsk = (prompt?: string) => {
    const q = prompt || askInput
    if (!q.trim()) return
    setAskInput(prompt || askInput)
    setIsThinking(true)
    setAiResponse(null)
    setTimeout(() => {
      setIsThinking(false)
      setAiResponse(`Based on the last 2 hours of telemetry: The most significant change was a 3× increase in EU traffic to search-api at 14:31 UTC. This correlated with a P99 latency increase from 180ms to 2100ms. The root cause appears to be DB connection pool saturation on db-primary, compounded by an ongoing GC pause issue on db-replica-2. Recommendation: address the connection pool limit first, then investigate the source of EU traffic anomaly.`)
    }, 1800)
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="AI Insights"
        description="Machine learning-powered anomaly detection, predictions, root cause analysis, and operational intelligence"
        badge={<Badge variant="secondary" size="sm"><Brain className="w-3 h-3 mr-1" />{filtered.length} insights</Badge>}
        actions={
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Model Accuracy", value: "94.2%", sub: "Last 30 days", icon: <Brain className="w-4 h-4 text-primary" />, trend: "+1.2%", trendColor: "text-emerald-500" },
            { label: "Insights Generated", value: "1,284", sub: "This month", icon: <Sparkles className="w-4 h-4 text-primary" />, trend: "+18%", trendColor: "text-emerald-500" },
            { label: "Incidents Predicted", value: "47", sub: "Before occurrence", icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, trend: "81% early", trendColor: "text-emerald-500" },
            { label: "False Positives", value: "3.8%", sub: "Industry avg: 12%", icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, trend: "−2.1%", trendColor: "text-emerald-500" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="premium-card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/15">
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold tabular-nums text-foreground leading-tight">{s.value}</div>
                <div className="section-label mt-0.5">{s.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
                <div className={cn("text-[10px] font-semibold mt-1", s.trendColor)}>{s.trend}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="premium-card p-5 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground leading-none">Ask AI</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">GPT-4o powered · Real-time telemetry analysis</div>
            </div>
            <Badge variant="secondary" size="sm" className="ml-auto">GPT-4o</Badge>
          </div>

          <div className="flex gap-2 mb-3">
            <Input value={askInput} onChange={e => setAskInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAsk()}
              placeholder="Ask anything about your platform health, anomalies, or root causes…"
              className="text-sm" />
            <Button size="sm" className="gap-2 shrink-0" onClick={() => handleAsk()} disabled={isThinking}>
              {isThinking
                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
              Ask
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} onClick={() => { setAskInput(p); handleAsk(p) }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-150">
                {p}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {isThinking && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 text-sm text-muted-foreground py-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(j => (
                    <motion.div key={j} className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.2 }} />
                  ))}
                </div>
                <span>Analyzing telemetry across all services…</span>
              </motion.div>
            )}
            {aiResponse && !isThinking && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center">
                    <Brain className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary">AI Analysis</span>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed">{aiResponse}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", "anomaly", "prediction", "correlation", "optimization", "capacity"].map(f => {
              const meta = f !== "all" ? TYPE_META[f as keyof typeof TYPE_META] : null
              return (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className={cn("px-2.5 py-1.5 text-[11px] font-medium rounded-full border transition-all capitalize",
                    typeFilter === f
                      ? meta
                        ? cn(meta.bg, meta.color, meta.border, "shadow-sm")
                        : "bg-foreground/8 text-foreground border-foreground/20"
                      : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                  )}>{f}</button>
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            {["all", "high", "medium", "low"].map(f => (
              <button key={f} onClick={() => setPriorityFilter(f)}
                className={cn("px-2.5 py-1.5 text-[11px] font-medium rounded-full border transition-all capitalize",
                  priorityFilter === f
                    ? f === "high" ? "bg-red-500/10 text-red-500 border-red-500/30"
                    : f === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    : f === "low" ? "bg-muted text-muted-foreground border-border/40"
                    : "bg-foreground/8 text-foreground border-foreground/20"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}>{f}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((insight, i) => {
            const meta = TYPE_META[insight.type as keyof typeof TYPE_META]
            const priorityMeta = PRIORITY_META[insight.priority as keyof typeof PRIORITY_META]
            const isExpanded = expandedInsight === i
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }}
                className={cn(
                  "premium-card group cursor-pointer transition-all overflow-hidden border-l-[3px] hover:border-primary/20",
                  meta.accent
                )}
                onClick={() => setExpandedInsight(isExpanded ? null : i)}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", meta.bg, meta.color, meta.border)}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", meta.bg, meta.color, meta.border)}>{meta.label}</span>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">{insight.app}</span>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", priorityMeta.cls)}>{priorityMeta.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> {insight.age}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-foreground mb-1.5 leading-snug">{insight.title}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed mb-3">{insight.desc}</div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {insight.signals.map(s => (
                          <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 text-muted-foreground">{s}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground/70">Confidence:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${insight.confidence}%` }}
                                transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: "easeOut" }}
                                className={cn("h-full rounded-full",
                                  insight.confidence >= 90 ? "bg-emerald-500" :
                                  insight.confidence >= 80 ? "bg-amber-500" : "bg-muted-foreground"
                                )} />
                            </div>
                            <span className="text-xs font-bold tabular-nums text-foreground">{insight.confidence}%</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                          {isExpanded ? "Collapse" : "View Analysis"} <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50 overflow-hidden">
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="section-label mb-2">What Changed</div>
                          <div className="text-xs text-foreground/80 leading-relaxed inset-panel p-3">
                            {insight.whatChanged}
                          </div>
                        </div>
                        <div>
                          <div className="section-label mb-2">Recommendation</div>
                          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 mb-3">
                            <div className="text-xs text-foreground/80 leading-relaxed">{insight.recommendation}</div>
                          </div>
                          <div className="section-label mb-1">Impact</div>
                          <div className="text-xs text-muted-foreground">{insight.impact}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="premium-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-label mb-0.5">AI Model Confidence</div>
              <div className="text-xs text-muted-foreground">Last 24 hours rolling accuracy</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums text-foreground">94.2%</div>
              <div className="text-[10px] text-emerald-500 font-semibold">+1.2% vs prior period</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={ACCURACY_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={5} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
