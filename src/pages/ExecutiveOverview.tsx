import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Clock, TrendingDown, Shield, ArrowUpRight, Sparkles, RefreshCw, Server, ChevronRight, Circle as XCircle, CircleAlert as AlertCircle, Flame, ArrowRight } from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar
} from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getDashboardOverview } from "@/lib/api/dashboard"
import { LoadingShimmer } from "@/components/shared/LoadingShimmer"

const FALLBACK_INCIDENT_TREND = Array.from({ length: 14 }, (_, i) => ({
  d: `D${i + 1}`,
  critical: Math.max(0, Math.round(2 + Math.cos(i * 0.5) * 1.5)),
  warning: Math.max(0, Math.round(5 + Math.sin(i * 0.4) * 3)),
}))

const FALLBACK_SPARKLINES: Record<string, number[]> = {
  score: [88, 91, 89, 93, 90, 94, 91, 95, 92, 91, 94, 91],
  latency: [102, 98, 110, 95, 89, 87, 92, 85, 83, 87, 82, 87],
  incidents: [8, 6, 9, 5, 7, 4, 6, 3, 5, 4, 3, 3],
  uptime: [99.91, 99.94, 99.88, 99.96, 99.97, 99.95, 99.98, 99.99, 99.97, 99.98, 99.97, 99.98],
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    const duration = 900
    const step = (end - start) / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(parseFloat(start.toFixed(decimals)))
    }, 16)
    return () => clearInterval(timer)
  }, [value, decimals])
  return <>{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}

function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const d = data.map((v, i) => ({ i, v }))
  const gradId = `sg-${color.replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gradId})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function HealthRing({ score }: { score: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444"
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} strokeWidth="8" stroke="hsl(var(--border))" fill="none" />
        <motion.circle
          cx="48" cy="48" r={r} strokeWidth="8"
          stroke={color} fill="none" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">/100</span>
      </div>
    </div>
  )
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "10px",
    fontSize: "11px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
}

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

export function ExecutiveOverview() {
  const [refreshing, setRefreshing] = useState(false)
  const [envFilter, setEnvFilter] = useState("All")

  const { data: overview, loading, refetch } = useApi(getDashboardOverview)

  const handleRefresh = () => {
    setRefreshing(true)
    refetch()
    setTimeout(() => setRefreshing(false), 1400)
  }

  const total = overview?.total_apps ?? 0
  const healthy = overview?.healthy_apps ?? 0
  const degraded = overview?.degraded_apps ?? 0
  const critical = overview?.critical_apps ?? 0
  const avgScore = overview?.avg_health_score ?? 0
  const activeIncidents = overview?.active_incidents ?? 0
  const activeAlerts = overview?.active_alerts ?? 0
  const uptime = overview?.overall_uptime ?? 99.9
  const avgLatency = overview?.avg_latency ?? 0

  const health24h = overview?.health_24h?.map(h => ({
    h: h.hour,
    healthy: h.score,
    incidents: h.incidents,
    latency: 85,
  })) ?? Array.from({ length: 24 }, (_, i) => ({
    h: `${String(i).padStart(2, "0")}:00`,
    healthy: 91,
    incidents: 0,
    latency: 85,
  }))

  const topApps = overview?.top_impacted ?? []
  const activeIncidentList = overview?.active_incident_list ?? []
  const envHealth = overview?.environment_health ?? []
  const connectorHealth = overview?.connector_health ?? []
  const aiHighlights = overview?.ai_highlights ?? []
  const heatmapData = overview?.heatmap_data ?? []

  const incidentTrend = health24h.length >= 14
    ? health24h.slice(-14).map((h, i) => ({
        d: `D${i + 1}`,
        critical: Math.max(0, h.incidents > 2 ? Math.round(h.incidents * 0.4) : 0),
        warning: Math.max(0, h.incidents > 0 ? Math.round(h.incidents * 0.6) : 0),
      }))
    : FALLBACK_INCIDENT_TREND

  const sparklines: Record<string, number[]> = health24h.length >= 12
    ? {
        score: health24h.slice(-12).map(h => h.healthy),
        latency: FALLBACK_SPARKLINES.latency,
        incidents: health24h.slice(-12).map(h => h.incidents),
        uptime: health24h.slice(-12).map(h => Math.min(100, 99 + (h.healthy - 90) * 0.1)),
      }
    : FALLBACK_SPARKLINES

  const SUMMARY = [
    { label: "Total Apps", value: total, icon: <Server className="w-4 h-4" />, color: "text-foreground", bg: "" },
    { label: "Healthy", value: healthy, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/8 border-emerald-500/15" },
    { label: "Warning", value: degraded, icon: <AlertTriangle className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/8 border-amber-500/15" },
    { label: "Degraded", value: degraded, icon: <AlertCircle className="w-4 h-4" />, color: "text-orange-500", bg: "bg-orange-500/8 border-orange-500/15" },
    { label: "Critical", value: critical, icon: <XCircle className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/8 border-red-500/15" },
    { label: "Incidents", value: activeIncidents, icon: <Flame className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/8 border-red-500/15" },
    { label: "MTTR (7d)", value: -1, display: "32m", icon: <Clock className="w-4 h-4" />, color: "text-foreground", bg: "" },
    { label: "SLA Breaches", value: activeAlerts, icon: <Shield className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/8 border-amber-500/15" },
  ]

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <PageHeader title="Executive Overview" description="Unified real-time health intelligence" />
        <div className="px-6 pb-8 space-y-5">
          <LoadingShimmer rows={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title="Executive Overview"
        description="Unified real-time health intelligence across your entire application portfolio"
        badge={
          <Badge variant="healthy" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
            Live
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            {["All", "Production", "Staging", "Dev"].map(e => (
              <button key={e} onClick={() => setEnvFilter(e)} className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border",
                envFilter === e
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}>{e}</button>
            ))}
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-8">
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="px-6 pb-8 space-y-5">

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
          {SUMMARY.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "rounded-xl border px-3 py-3 flex flex-col gap-1 transition-all duration-150 hover:shadow-elevation-1",
                s.bg || "bg-card border-border/60"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("opacity-70", s.color)}>{s.icon}</span>
                {i >= 1 && i <= 5 && (
                  <div className={cn("w-1.5 h-1.5 rounded-full",
                    s.label === "Healthy" ? "bg-emerald-500" :
                    s.label === "Warning" ? "bg-amber-500" :
                    s.label === "Degraded" ? "bg-orange-500" : "bg-red-500"
                  )} />
                )}
              </div>
              <div className={cn("text-xl font-bold leading-none tracking-tight", s.color)}>
                {s.display ? s.display : (
                  s.value >= 0 ? <AnimatedNumber value={s.value} /> : "—"
                )}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium leading-none">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Health Pulse + Score + Incidents ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Health pulse chart */}
          <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.35 }} className="lg:col-span-5 premium-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">System Health Pulse — 24h</div>
                <div className="text-sm text-muted-foreground">% healthy applications over time</div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-emerald-500 inline-block" /> Healthy %</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full bg-red-400 inline-block" /> Incidents</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={health24h} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="h" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={[75, 100]} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="healthy" stroke="#10b981" strokeWidth={2} fill="url(#hg1)" name="Health Score" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Overall health score */}
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.35 }} className="lg:col-span-3 premium-card p-5 flex flex-col items-center justify-center gap-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Overall Health Score</div>
            <HealthRing score={Math.round(avgScore)} />
            <div className="w-full space-y-2.5">
              {[
                { label: "Availability", value: uptime, color: "bg-emerald-500" },
                { label: "Performance", value: Math.min(100, Math.round(100 - (avgLatency / 10))), color: "bg-emerald-500" },
                { label: "Reliability", value: Math.round(avgScore), color: avgScore >= 90 ? "bg-emerald-500" : "bg-amber-500" },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 shrink-0">{m.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", m.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-foreground w-12 text-right">{m.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active incidents */}
          <motion.div {...fadeUp} transition={{ delay: 0.25, duration: 0.35 }} className="lg:col-span-4 premium-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Incidents</div>
              <Badge variant="critical" size="sm">{activeIncidentList.length} Open</Badge>
            </div>
            <div className="space-y-2.5 flex-1">
              {activeIncidentList.map((inc) => (
                <div key={inc.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:border-border hover:bg-muted/30 cursor-pointer transition-all duration-150 group">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                    inc.severity === "critical" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse" :
                    inc.severity === "warning" ? "bg-amber-500" : "bg-orange-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground leading-snug">{inc.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono text-muted-foreground/70">{inc.id}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <Clock className="w-2.5 h-2.5 text-muted-foreground/70" />
                      <span className="text-[10px] text-muted-foreground/70">{inc.duration}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground gap-1">
              View all incidents <ArrowRight className="w-3 h-3" />
            </Button>
          </motion.div>
        </div>

        {/* ── KPI Trend Cards with Sparklines ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Health Score", value: avgScore, unit: "/100", delta: "+2.1", up: true, color: "#10b981", data: sparklines.score, decimals: 1 },
            { label: "Avg Response Time", value: avgLatency, unit: "ms", delta: "−11ms", up: true, color: "#10b981", data: sparklines.latency },
            { label: "Open Incidents", value: activeIncidents, unit: "", delta: "−2 vs 1h ago", up: true, color: "#ef4444", data: sparklines.incidents },
            { label: "System Uptime", value: uptime, unit: "%", delta: "SLA 99.9%", up: true, color: "#10b981", data: sparklines.uptime, decimals: 2 },
          ].map((card, i) => (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.06 }}
              className="premium-card p-4 group hover:shadow-elevation-2 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  card.up ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" : "text-red-500 bg-red-500/10"
                )}>{card.delta}</span>
              </div>
              <div className="text-2xl font-bold tracking-tight" style={{ color: card.color }}>
                <AnimatedNumber value={card.value} decimals={card.decimals} />
                <span className="text-sm text-muted-foreground font-normal ml-0.5">{card.unit}</span>
              </div>
              <div className="mt-2 -mx-1">
                <Sparkline data={card.data} color={card.color} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Application health + Environment ── */}
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
          <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.35 }} className="xl:col-span-4 premium-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div>
                <div className="text-sm font-semibold text-foreground">Top Impacted Applications</div>
                <div className="text-xs text-muted-foreground mt-0.5">Sorted by criticality and health status</div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary h-7">
                View catalog <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
            <div className="grid grid-cols-[2fr_1fr_80px_72px_60px] gap-3 px-5 py-2 border-b border-border/40 bg-muted/20">
              {["Application", "Status", "Score", "Latency", "Inc."].map(h => (
                <span key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-border/30">
              {topApps.map((app, i) => (
                <motion.div key={app.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="grid grid-cols-[2fr_1fr_80px_72px_60px] gap-3 items-center px-5 py-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                      app.status === "critical" ? "bg-red-500/10" :
                      app.status === "warning" ? "bg-amber-500/10" : "bg-primary/10"
                    )}>
                      <Server className={cn("w-3.5 h-3.5",
                        app.status === "critical" ? "text-red-500" :
                        app.status === "warning" ? "text-amber-500" : "text-primary"
                      )} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold font-mono text-foreground truncate">{app.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] text-muted-foreground">{app.team_id}</span>
                        <span className={cn("text-[9px] font-bold px-1 rounded",
                          app.criticality === "P0" ? "text-red-500 bg-red-500/10" : "text-amber-500 bg-amber-500/10"
                        )}>{app.criticality}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status as "healthy" | "warning" | "critical" | "degraded"} size="sm" />
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[40px]">
                      <div className={cn("h-full rounded-full",
                        app.score >= 80 ? "bg-emerald-500" : app.score >= 60 ? "bg-amber-500" : "bg-red-500"
                      )} style={{ width: `${app.score}%` }} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground">{Math.round(app.score)}</span>
                  </div>
                  <span className={cn("text-xs font-mono font-semibold",
                    app.latency > 500 ? "text-red-500" :
                    app.latency > 200 ? "text-amber-500" : "text-foreground"
                  )}>{app.latency}ms</span>
                  <span className="text-xs font-semibold text-muted-foreground">—</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="xl:col-span-3 space-y-4">
            <motion.div {...fadeUp} transition={{ delay: 0.32, duration: 0.35 }} className="premium-card p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Environment Health</div>
              <div className="space-y-3.5">
                {envHealth.map(env => {
                  const total = env.app_count || 1
                  const healthyCount = total - (env.incident_count || 0)
                  return (
                    <div key={env.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full",
                            env.status === "healthy" ? "bg-emerald-500" :
                            env.status === "degraded" ? "bg-amber-500" : "bg-red-500"
                          )} />
                          <span className="text-xs font-semibold text-foreground">{env.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-mono text-foreground font-semibold">{env.score.toFixed(1)}%</span>
                          <span>{env.app_count} apps</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 h-2 rounded-full overflow-hidden bg-muted">
                        <div className="h-full bg-emerald-500" style={{ width: `${(healthyCount / total) * 100}%` }} />
                        {env.incident_count > 0 && <div className="h-full bg-amber-500" style={{ width: `${(env.incident_count / total) * 100}%` }} />}
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400">{healthyCount} healthy</span>
                        {env.incident_count > 0 && <span className="text-[9px] text-amber-500">{env.incident_count} issues</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.36, duration: 0.35 }} className="premium-card p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Data Source Health</div>
              <div className="space-y-2">
                {connectorHealth.map(c => (
                  <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      c.status === "healthy" ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" :
                      c.status === "warning" ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="text-xs font-semibold text-foreground flex-1">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{c.health_pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom Row: Incident trend + AI highlights + Heatmap ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div {...fadeUp} transition={{ delay: 0.38, duration: 0.35 }} className="premium-card p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Incident Trend — 14 days</div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">37% fewer incidents vs last period</span>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={incidentTrend} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
                <XAxis dataKey="d" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="warning" stackId="a" fill="#f59e0b" opacity={0.8} name="Warning" />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" opacity={0.8} radius={[3, 3, 0, 0]} name="Critical" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.35 }} className="premium-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Attention Needed</div>
            </div>
            <div className="space-y-2.5">
              {aiHighlights.map((h, i) => (
                <motion.div key={h.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/3 cursor-pointer transition-all duration-200 group"
                >
                  <div className={cn("w-2 h-2 rounded-full mt-1 shrink-0",
                    h.priority === "high" ? "bg-red-500" : "bg-amber-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground leading-snug">{h.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(h.confidence * 100)}%` }} />
                      </div>
                      <span className="text-[9px] font-semibold text-primary">{Math.round(h.confidence * 100)}%</span>
                      <span className="text-[9px] text-muted-foreground">{h.type}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.42, duration: 0.35 }} className="premium-card p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Regional Health Heatmap</div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 mb-2">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase">Region</span>
                {["Prod", "Stage", "Dev"].map(e => (
                  <span key={e} className="text-[9px] font-semibold text-muted-foreground uppercase text-center">{e}</span>
                ))}
              </div>
              {heatmapData.map(row => {
                const getStatus = (score: number) => score >= 95 ? "healthy" : score >= 88 ? "warning" : "critical"
                const getLabel = (score: number) => score >= 95 ? "OK" : score >= 88 ? "WARN" : "CRIT"
                const cells = [row.production, row.staging, row.development]
                return (
                  <div key={row.region} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 items-center">
                    <span className="text-xs text-foreground font-medium">{row.region}</span>
                    {cells.map((score, j) => {
                      const status = getStatus(score)
                      return (
                        <div key={j} className={cn(
                          "rounded-lg h-6 flex items-center justify-center text-[9px] font-bold uppercase tracking-wider",
                          status === "healthy" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                          status === "warning" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                          "bg-red-500/15 text-red-600 dark:text-red-400"
                        )}>
                          {getLabel(score)}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {[["OK", "emerald"], ["WARN", "amber"], ["CRIT", "red"]].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <span className={cn("w-2 h-2 rounded-sm",
                    c === "emerald" ? "bg-emerald-500/40" : c === "amber" ? "bg-amber-500/40" : "bg-red-500/40"
                  )} />
                  {l}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
