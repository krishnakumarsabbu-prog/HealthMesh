import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Clock, TrendingUp, TrendingDown, Zap, Shield, ArrowUpRight, Sparkles, RefreshCw, Server, ChevronRight, Circle as XCircle, CircleAlert as AlertCircle, Flame, ArrowRight } from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar
} from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const HEALTH_24H = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}:00`,
  healthy: Math.round(88 + Math.sin(i * 0.4) * 5 + Math.random() * 4),
  incidents: Math.max(0, Math.round(3 + Math.cos(i * 0.8) * 2 + Math.random() * 1.5)),
  latency: Math.round(85 + Math.sin(i * 0.35) * 30 + Math.random() * 15),
}))

const INCIDENT_TREND = Array.from({ length: 14 }, (_, i) => ({
  d: `D${i + 1}`,
  critical: Math.max(0, Math.round(2 + Math.cos(i * 0.5) * 1.5)),
  warning: Math.max(0, Math.round(5 + Math.sin(i * 0.4) * 3)),
}))

const SPARKLINES: Record<string, number[]> = {
  score: [88, 91, 89, 93, 90, 94, 91, 95, 92, 91, 94, 91],
  latency: [102, 98, 110, 95, 89, 87, 92, 85, 83, 87, 82, 87],
  incidents: [8, 6, 9, 5, 7, 4, 6, 3, 5, 4, 3, 3],
  uptime: [99.91, 99.94, 99.88, 99.96, 99.97, 99.95, 99.98, 99.99, 99.97, 99.98, 99.97, 99.98],
}

const TOP_APPS = [
  { name: "payments-api", team: "Payments", status: "healthy" as const, score: 98, latency: "42ms", rpm: "12.4K", incidents: 0, criticality: "P0" },
  { name: "customer-auth-service", team: "Platform", status: "warning" as const, score: 72, latency: "87ms", rpm: "34.1K", incidents: 1, criticality: "P0" },
  { name: "order-processing-gateway", team: "Commerce", status: "healthy" as const, score: 95, latency: "55ms", rpm: "8.7K", incidents: 0, criticality: "P0" },
  { name: "search-api", team: "Discovery", status: "critical" as const, score: 31, latency: "2140ms", rpm: "6.3K", incidents: 3, criticality: "P1" },
  { name: "recommendation-engine", team: "ML", status: "degraded" as const, score: 58, latency: "234ms", rpm: "2.1K", incidents: 2, criticality: "P1" },
  { name: "notification-engine", team: "Platform", status: "healthy" as const, score: 97, latency: "18ms", rpm: "5.6K", incidents: 0, criticality: "P1" },
]

const ACTIVE_INCIDENTS = [
  { id: "INC-2847", title: "search-api P99 latency spike", severity: "critical" as const, age: "14m", team: "Discovery" },
  { id: "INC-2846", title: "auth-service elevated error rate", severity: "warning" as const, age: "1h 22m", team: "Platform" },
  { id: "INC-2844", title: "recommendation-engine degraded", severity: "degraded" as const, age: "3h 5m", team: "ML" },
]

const ENVIRONMENT_HEALTH = [
  { env: "Production", total: 124, healthy: 119, warning: 3, critical: 2, uptime: "99.97%" },
  { env: "Staging", total: 68, healthy: 64, warning: 3, critical: 1, uptime: "99.81%" },
  { env: "Development", total: 55, healthy: 49, warning: 5, critical: 1, uptime: "98.64%" },
]

const CONNECTOR_HEALTH = [
  { name: "Datadog", status: "healthy", signals: 4821 },
  { name: "AWS CloudWatch", status: "healthy", signals: 12841 },
  { name: "Prometheus", status: "warning", signals: 3241 },
  { name: "PagerDuty", status: "healthy", signals: 284 },
]

const AI_HIGHLIGHTS = [
  { type: "anomaly", icon: "🔴", title: "search-api: 3.2× traffic surge EU region", confidence: 94, age: "6m" },
  { type: "prediction", icon: "🟡", title: "auth-service memory exhaustion in ~4h", confidence: 87, age: "12m" },
  { type: "correlation", icon: "🔵", title: "recommendation latency ↔ db-replica-2 GC pauses", confidence: 91, age: "34m" },
]

const HEATMAP_DATA = [
  { region: "US-East", prod: "healthy", stage: "healthy", dev: "warning" },
  { region: "US-West", prod: "healthy", stage: "warning", dev: "healthy" },
  { region: "EU-West", prod: "warning", stage: "healthy", dev: "healthy" },
  { region: "AP-South", prod: "critical", stage: "healthy", dev: "degraded" },
  { region: "AP-North", prod: "healthy", stage: "healthy", dev: "healthy" },
]

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

  const SUMMARY = [
    { label: "Total Apps", value: 247, icon: <Server className="w-4 h-4" />, color: "text-foreground", bg: "" },
    { label: "Healthy", value: 229, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/8 border-emerald-500/15" },
    { label: "Warning", value: 11, icon: <AlertTriangle className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/8 border-amber-500/15" },
    { label: "Degraded", value: 4, icon: <AlertCircle className="w-4 h-4" />, color: "text-orange-500", bg: "bg-orange-500/8 border-orange-500/15" },
    { label: "Critical", value: 3, icon: <XCircle className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/8 border-red-500/15" },
    { label: "Incidents", value: 3, icon: <Flame className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/8 border-red-500/15" },
    { label: "MTTR (7d)", value: -1, display: "1h 24m", icon: <Clock className="w-4 h-4" />, color: "text-foreground", bg: "" },
    { label: "SLA Breaches", value: 1, icon: <Shield className="w-4 h-4" />, color: "text-amber-500", bg: "bg-amber-500/8 border-amber-500/15" },
  ]

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
            <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1400) }} className="gap-1.5 h-8">
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
              <AreaChart data={HEALTH_24H} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="h" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} domain={[75, 100]} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="healthy" stroke="#10b981" strokeWidth={2} fill="url(#hg1)" name="Healthy %" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Overall health score */}
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.35 }} className="lg:col-span-3 premium-card p-5 flex flex-col items-center justify-center gap-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Overall Health Score</div>
            <HealthRing score={91} />
            <div className="w-full space-y-2.5">
              {[
                { label: "Availability", value: 99.97, color: "bg-emerald-500" },
                { label: "Performance", value: 88, color: "bg-emerald-500" },
                { label: "Reliability", value: 86, color: "bg-amber-500" },
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
              <Badge variant="critical" size="sm">{ACTIVE_INCIDENTS.length} Open</Badge>
            </div>
            <div className="space-y-2.5 flex-1">
              {ACTIVE_INCIDENTS.map((inc) => (
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
                      <span className="text-[10px] text-muted-foreground/70">{inc.age}</span>
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
            { label: "Health Score", value: 91.4, unit: "/100", delta: "+2.1", up: true, color: "#10b981", data: SPARKLINES.score, decimals: 1 },
            { label: "Avg Response Time", value: 87, unit: "ms", delta: "−11ms", up: true, color: "#10b981", data: SPARKLINES.latency },
            { label: "Open Incidents", value: 3, unit: "", delta: "−2 vs 1h ago", up: true, color: "#ef4444", data: SPARKLINES.incidents },
            { label: "System Uptime", value: 99.97, unit: "%", delta: "SLA 99.9%", up: true, color: "#10b981", data: SPARKLINES.uptime, decimals: 2 },
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
              {TOP_APPS.map((app, i) => (
                <motion.div key={app.name}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="grid grid-cols-[2fr_1fr_80px_72px_60px] gap-3 items-center px-5 py-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                      app.status === "critical" ? "bg-red-500/10" :
                      app.status === "warning" ? "bg-amber-500/10" :
                      app.status === "degraded" ? "bg-orange-500/10" : "bg-primary/10"
                    )}>
                      <Server className={cn("w-3.5 h-3.5",
                        app.status === "critical" ? "text-red-500" :
                        app.status === "warning" ? "text-amber-500" :
                        app.status === "degraded" ? "text-orange-500" : "text-primary"
                      )} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold font-mono text-foreground truncate">{app.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] text-muted-foreground">{app.team}</span>
                        <span className={cn("text-[9px] font-bold px-1 rounded",
                          app.criticality === "P0" ? "text-red-500 bg-red-500/10" : "text-amber-500 bg-amber-500/10"
                        )}>{app.criticality}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[40px]">
                      <div className={cn("h-full rounded-full",
                        app.score >= 80 ? "bg-emerald-500" : app.score >= 60 ? "bg-amber-500" : "bg-red-500"
                      )} style={{ width: `${app.score}%` }} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground">{app.score}</span>
                  </div>
                  <span className={cn("text-xs font-mono font-semibold",
                    parseInt(app.latency) > 500 ? "text-red-500" :
                    parseInt(app.latency) > 200 ? "text-amber-500" : "text-foreground"
                  )}>{app.latency}</span>
                  <span className={cn("text-xs font-semibold",
                    app.incidents > 0 ? "text-red-500" : "text-muted-foreground"
                  )}>{app.incidents > 0 ? app.incidents : "—"}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="xl:col-span-3 space-y-4">
            <motion.div {...fadeUp} transition={{ delay: 0.32, duration: 0.35 }} className="premium-card p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Environment Health</div>
              <div className="space-y-3.5">
                {ENVIRONMENT_HEALTH.map(env => (
                  <div key={env.env}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full",
                          (env.healthy / env.total) >= 0.95 ? "bg-emerald-500" :
                          (env.healthy / env.total) >= 0.85 ? "bg-amber-500" : "bg-red-500"
                        )} />
                        <span className="text-xs font-semibold text-foreground">{env.env}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono text-foreground font-semibold">{env.uptime}</span>
                        <span>{env.total} apps</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 h-2 rounded-full overflow-hidden bg-muted">
                      <div className="h-full bg-emerald-500" style={{ width: `${(env.healthy / env.total) * 100}%` }} />
                      {env.warning > 0 && <div className="h-full bg-amber-500" style={{ width: `${(env.warning / env.total) * 100}%` }} />}
                      {env.critical > 0 && <div className="h-full bg-red-500" style={{ width: `${(env.critical / env.total) * 100}%` }} />}
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400">{env.healthy} healthy</span>
                      {env.warning > 0 && <span className="text-[9px] text-amber-500">{env.warning} warning</span>}
                      {env.critical > 0 && <span className="text-[9px] text-red-500">{env.critical} critical</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.36, duration: 0.35 }} className="premium-card p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Data Source Health</div>
              <div className="space-y-2">
                {CONNECTOR_HEALTH.map(c => (
                  <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      c.status === "healthy" ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" :
                      c.status === "warning" ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="text-xs font-semibold text-foreground flex-1">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{c.signals.toLocaleString()}/h</span>
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
              <BarChart data={INCIDENT_TREND} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
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
              {AI_HIGHLIGHTS.map((h, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/3 cursor-pointer transition-all duration-200 group"
                >
                  <span className="text-base shrink-0 mt-0.5">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground leading-snug">{h.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${h.confidence}%` }} />
                      </div>
                      <span className="text-[9px] font-semibold text-primary">{h.confidence}%</span>
                      <span className="text-[9px] text-muted-foreground">{h.age}</span>
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
              {HEATMAP_DATA.map(row => (
                <div key={row.region} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 items-center">
                  <span className="text-xs text-foreground font-medium">{row.region}</span>
                  {[row.prod, row.stage, row.dev].map((s, j) => (
                    <div key={j} className={cn(
                      "rounded-lg h-6 flex items-center justify-center text-[9px] font-bold uppercase tracking-wider",
                      s === "healthy" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                      s === "warning" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                      s === "critical" ? "bg-red-500/15 text-red-600 dark:text-red-400" :
                      "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                    )}>
                      {s === "healthy" ? "OK" : s === "critical" ? "CRIT" : s === "warning" ? "WARN" : "DEG"}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {[["OK", "emerald"], ["WARN", "amber"], ["DEG", "orange"], ["CRIT", "red"]].map(([l, c]) => (
                <span key={l} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <span className={cn("w-2 h-2 rounded-sm",
                    c === "emerald" ? "bg-emerald-500/40" : c === "amber" ? "bg-amber-500/40" :
                    c === "orange" ? "bg-orange-500/40" : "bg-red-500/40"
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
