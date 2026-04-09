import { motion } from "framer-motion"
import { useState } from "react"
import { Activity, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Clock, TrendingUp, TrendingDown, Zap, Shield, Globe, Database, ArrowUpRight, Sparkles, RefreshCw, ChartBar as BarChart3, Server, ChevronRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { MetricCard } from "@/components/shared/MetricCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const HEALTH_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  healthy: 85 + Math.sin(i * 0.5) * 8 + Math.random() * 4,
  incidents: Math.max(0, 3 + Math.cos(i * 0.8) * 2 + Math.random() * 2),
  latency: 120 + Math.sin(i * 0.3) * 40 + Math.random() * 20,
}))

const TOP_APPS = [
  { name: "payments-api", team: "Payments", status: "healthy" as const, uptime: "99.98%", latency: "42ms", incidents: 0 },
  { name: "auth-service", team: "Platform", status: "warning" as const, uptime: "99.82%", latency: "87ms", incidents: 1 },
  { name: "catalog-service", team: "Commerce", status: "healthy" as const, uptime: "99.99%", latency: "31ms", incidents: 0 },
  { name: "recommendation-engine", team: "ML", status: "degraded" as const, uptime: "98.41%", latency: "234ms", incidents: 2 },
  { name: "notification-worker", team: "Platform", status: "healthy" as const, uptime: "99.95%", latency: "18ms", incidents: 0 },
  { name: "search-api", team: "Discovery", status: "critical" as const, uptime: "96.20%", latency: "2140ms", incidents: 3 },
]

const ACTIVE_INCIDENTS = [
  { id: "INC-2847", title: "search-api P99 latency spike", severity: "critical" as const, age: "14m", team: "Discovery" },
  { id: "INC-2846", title: "auth-service elevated error rate", severity: "warning" as const, age: "1h 22m", team: "Platform" },
  { id: "INC-2844", title: "recommendation-engine degraded throughput", severity: "degraded" as const, age: "3h 5m", team: "ML" },
]

const AI_INSIGHTS = [
  { type: "anomaly", title: "Unusual traffic pattern detected", desc: "search-api receiving 3.2x normal request volume from EU region. Possible bot activity or feature launch.", confidence: 94 },
  { type: "prediction", title: "auth-service memory exhaustion", desc: "At current growth rate, memory will exceed 95% threshold in approximately 4 hours without intervention.", confidence: 87 },
  { type: "correlation", title: "Latency correlation identified", desc: "recommendation-engine latency spikes correlate with database-replica-2 GC pauses (r=0.91).", confidence: 91 },
]

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
}

export function ExecutiveOverview() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title="Executive Overview"
        description="Real-time health intelligence across your entire application portfolio"
        badge={
          <Badge variant="healthy" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-6">
        {/* KPI Metrics */}
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Overall Health Score", value: "91.4", unit: "/100", trend: 2.1, trendLabel: "vs last 24h", status: "healthy" as const, icon: <Shield className="w-4 h-4" /> },
            { label: "Applications Monitored", value: "247", trend: 3, trendLabel: "added this week", status: "neutral" as const, icon: <Server className="w-4 h-4" /> },
            { label: "Active Incidents", value: "3", trend: -2, trendLabel: "vs last hour", status: "warning" as const, icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Avg Response Time", value: "87", unit: "ms", trend: -8.3, trendLabel: "vs last 24h", status: "healthy" as const, icon: <Zap className="w-4 h-4" /> },
          ].map((metric, i) => (
            <motion.div key={i} variants={stagger.item} transition={{ duration: 0.3 }}>
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Health trend */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="lg:col-span-2 premium-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">System Health — 24h</div>
                <div className="text-sm text-muted-foreground">Percentage of healthy applications over time</div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-1 rounded-full bg-emerald-500" /> Healthy %</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-1 rounded-full bg-red-400" /> Incidents</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={HEALTH_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="healthy" stroke="#10b981" strokeWidth={2} fill="url(#healthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Incident summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="premium-card p-5"
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Active Incidents</div>
            <div className="space-y-3">
              {ACTIVE_INCIDENTS.map((inc) => (
                <div key={inc.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors group">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    inc.severity === "critical" ? "bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.6)]" :
                    inc.severity === "warning" ? "bg-amber-500" : "bg-orange-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground leading-tight truncate">{inc.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-muted-foreground">{inc.id}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{inc.age}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground">
              View all incidents <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        </div>

        {/* Apps + AI Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Application health table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="xl:col-span-3 premium-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div>
                <div className="text-sm font-semibold text-foreground">Application Health</div>
                <div className="text-xs text-muted-foreground mt-0.5">Critical & monitored applications</div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                View all <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
            <div className="divide-y divide-border/40">
              {TOP_APPS.map((app) => (
                <div key={app.name} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 cursor-pointer transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Server className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground font-mono truncate">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{app.team}</div>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono font-semibold text-foreground">{app.latency}</div>
                    <div className="text-[10px] text-muted-foreground">latency</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-mono font-semibold text-foreground">{app.uptime}</div>
                    <div className="text-[10px] text-muted-foreground">uptime</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Insights panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="xl:col-span-2 premium-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">AI Insights</div>
                <div className="text-xs text-muted-foreground">Powered by ML analysis</div>
              </div>
            </div>
            <div className="space-y-3">
              {AI_INSIGHTS.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="p-3.5 rounded-xl border border-border/60 hover:border-primary/20 hover:bg-primary/3 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-xs font-semibold text-foreground leading-snug">{insight.title}</div>
                    <span className="shrink-0 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {insight.confidence}%
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">{insight.desc}</div>
                  <div className="mt-2">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      insight.type === "anomaly" ? "text-red-500" :
                      insight.type === "prediction" ? "text-amber-500" : "text-blue-500"
                    )}>
                      {insight.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
