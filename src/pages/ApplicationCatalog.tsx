import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Server, ArrowUpRight, Plus, Grid3x3, List, Star, StarOff, X, ChevronRight, Activity, Zap, TriangleAlert as AlertTriangle, Clock, Users, Link2, Filter, SlidersHorizontal, Eye, Tag, TrendingUp, TrendingDown, CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle, Layers } from "lucide-react"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { listApps } from "@/lib/api/apps"
import { mapAppSummary } from "@/lib/mappers"
import { LoadingShimmer } from "@/components/shared/LoadingShimmer"

type AppStatus = "healthy" | "warning" | "critical" | "degraded" | "unknown"
type Criticality = "P0" | "P1" | "P2" | "P3"

interface AppEntry {
  name: string; team: string; env: string; status: AppStatus
  criticality: Criticality; score: number; uptime: string
  latency: string; rpm: string; type: string; tags: string[]
  incidents: number; deps: number; connectors: string[]
  lastIncident: string; lastRefresh: string; failingChecks: number
  trend: number[]; description: string
}

const APPS: AppEntry[] = [
  { name: "payments-api", team: "Payments", env: "Production", status: "healthy", criticality: "P0", score: 98, uptime: "99.98%", latency: "42ms", rpm: "12.4K", type: "REST API", tags: ["pci", "critical", "external"], incidents: 0, deps: 8, connectors: ["Datadog", "PagerDuty"], lastIncident: "18d ago", lastRefresh: "30s ago", failingChecks: 0, trend: [96, 98, 97, 99, 98, 98, 97, 98, 99, 98, 98, 98], description: "Core payment processing API handling all transaction flows including checkout, refunds, and chargebacks." },
  { name: "customer-auth-service", team: "Platform", env: "Production", status: "warning", criticality: "P0", score: 72, uptime: "99.82%", latency: "87ms", rpm: "34.1K", type: "gRPC Service", tags: ["critical", "identity"], incidents: 1, deps: 5, connectors: ["Datadog", "Grafana"], lastIncident: "1h ago", lastRefresh: "30s ago", failingChecks: 3, trend: [90, 88, 85, 82, 79, 76, 74, 72, 73, 71, 72, 72], description: "Handles all user authentication, session management, and OAuth token issuance across all products." },
  { name: "order-processing-gateway", team: "Commerce", env: "Production", status: "healthy", criticality: "P0", score: 95, uptime: "99.99%", latency: "55ms", rpm: "8.7K", type: "GraphQL API", tags: ["core", "commerce"], incidents: 0, deps: 12, connectors: ["AWS CloudWatch", "Datadog"], lastIncident: "3d ago", lastRefresh: "45s ago", failingChecks: 0, trend: [93, 94, 95, 94, 96, 95, 95, 96, 95, 95, 95, 95], description: "Orchestrates the full order lifecycle from cart checkout through fulfillment and delivery tracking." },
  { name: "search-api", team: "Discovery", env: "Production", status: "critical", criticality: "P1", score: 31, uptime: "96.20%", latency: "2140ms", rpm: "6.3K", type: "REST API", tags: ["critical", "customer-facing"], incidents: 3, deps: 6, connectors: ["Prometheus", "Datadog"], lastIncident: "14m ago", lastRefresh: "30s ago", failingChecks: 8, trend: [85, 80, 72, 60, 52, 42, 38, 35, 32, 31, 31, 31], description: "Powers product search, autocomplete, and relevance-ranked results across all surfaces and storefronts." },
  { name: "recommendation-engine", team: "ML", env: "Production", status: "degraded", criticality: "P1", score: 58, uptime: "98.41%", latency: "234ms", rpm: "2.1K", type: "ML Service", tags: ["ai", "personalization"], incidents: 2, deps: 9, connectors: ["Grafana", "AWS CloudWatch"], lastIncident: "3h ago", lastRefresh: "1m ago", failingChecks: 4, trend: [80, 78, 75, 70, 66, 62, 59, 58, 57, 58, 58, 58], description: "Real-time product recommendation inference service powered by collaborative filtering and deep learning." },
  { name: "notification-engine", team: "Platform", env: "Production", status: "healthy", criticality: "P1", score: 97, uptime: "99.95%", latency: "18ms", rpm: "5.6K", type: "Worker", tags: ["async", "messaging"], incidents: 0, deps: 4, connectors: ["Datadog", "PagerDuty"], lastIncident: "7d ago", lastRefresh: "30s ago", failingChecks: 0, trend: [95, 96, 97, 97, 96, 97, 98, 97, 97, 97, 97, 97], description: "Manages email, SMS, push notification delivery with templating, queuing, and delivery tracking." },
  { name: "inventory-service", team: "Commerce", env: "Production", status: "healthy", criticality: "P1", score: 94, uptime: "99.97%", latency: "65ms", rpm: "3.2K", type: "REST API", tags: ["core", "commerce"], incidents: 0, deps: 3, connectors: ["Datadog"], lastIncident: "12d ago", lastRefresh: "30s ago", failingChecks: 0, trend: [92, 93, 94, 93, 94, 95, 94, 94, 93, 94, 94, 94], description: "Real-time inventory tracking, reservation management, and warehouse sync across all fulfillment centers." },
  { name: "claims-portal-api", team: "Insurance", env: "Production", status: "healthy", criticality: "P0", score: 99, uptime: "99.99%", latency: "38ms", rpm: "1.8K", type: "REST API", tags: ["regulated", "hipaa"], incidents: 0, deps: 7, connectors: ["Splunk", "Datadog"], lastIncident: "30d ago", lastRefresh: "30s ago", failingChecks: 0, trend: [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], description: "HIPAA-compliant claims submission, adjudication status, and appeal management API for the Claims Portal." },
  { name: "fraud-detection-service", team: "Risk", env: "Production", status: "healthy", criticality: "P0", score: 99, uptime: "99.99%", latency: "28ms", rpm: "11.2K", type: "ML Service", tags: ["critical", "ai", "pci"], incidents: 0, deps: 5, connectors: ["Datadog", "Splunk"], lastIncident: "45d ago", lastRefresh: "30s ago", failingChecks: 0, trend: [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], description: "Real-time fraud scoring and transaction risk assessment using ensemble ML models trained on behavior signals." },
  { name: "reporting-hub", team: "Analytics", env: "Production", status: "healthy", criticality: "P2", score: 87, uptime: "99.87%", latency: "145ms", rpm: "420", type: "Service", tags: ["internal"], incidents: 0, deps: 6, connectors: ["Grafana"], lastIncident: "4d ago", lastRefresh: "2m ago", failingChecks: 1, trend: [85, 86, 87, 86, 87, 88, 87, 87, 87, 87, 87, 87], description: "Business intelligence report generation, scheduling, and export service for executive dashboards." },
  { name: "identity-service", team: "Platform", env: "Production", status: "healthy", criticality: "P0", score: 96, uptime: "99.96%", latency: "34ms", rpm: "22.1K", type: "gRPC Service", tags: ["identity", "critical"], incidents: 0, deps: 4, connectors: ["Datadog", "PagerDuty"], lastIncident: "8d ago", lastRefresh: "30s ago", failingChecks: 0, trend: [94, 95, 96, 95, 96, 97, 96, 96, 95, 96, 96, 96], description: "Centralized identity graph, user profile management, and permission system used by all platform services." },
  { name: "customer-360-platform", team: "CX", env: "Production", status: "healthy", criticality: "P1", score: 92, uptime: "99.93%", latency: "78ms", rpm: "3.4K", type: "GraphQL API", tags: ["customer-data", "analytics"], incidents: 0, deps: 14, connectors: ["Datadog", "Grafana"], lastIncident: "6d ago", lastRefresh: "45s ago", failingChecks: 0, trend: [90, 91, 92, 91, 92, 93, 92, 92, 91, 92, 92, 92], description: "Aggregated customer profile, behavioral analytics, and segment management API powering personalization." },
]

const CRITICALITY_ORDER: Record<Criticality, number> = { P0: 0, P1: 1, P2: 2, P3: 3 }
const STATUS_ORDER: Record<AppStatus, number> = { critical: 0, degraded: 1, warning: 2, unknown: 3, healthy: 4 }

const STATUS_ACCENT: Record<AppStatus, string> = {
  critical: "border-l-red-500",
  degraded: "border-l-orange-500",
  warning: "border-l-amber-500",
  healthy: "border-l-transparent",
  unknown: "border-l-transparent",
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const d = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width={60} height={24}>
      <AreaChart data={d} margin={{ top: 1, right: 0, bottom: 1, left: 0 }}>
        <defs>
          <linearGradient id={`msp-${color.replace(/[^a-z]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#msp-${color.replace(/[^a-z]/g, "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function AppDrawer({ app, onClose }: { app: AppEntry; onClose: () => void }) {
  const scoreColor = app.score >= 90 ? "#10b981" : app.score >= 70 ? "#f59e0b" : "#ef4444"
  const r = 32, circ = 2 * Math.PI * r, filled = (app.score / 100) * circ

  const statusIconBg = app.status === "critical" ? "bg-red-500/12 border border-red-500/20" :
    app.status === "warning" ? "bg-amber-500/12 border border-amber-500/20" :
    app.status === "degraded" ? "bg-orange-500/12 border border-orange-500/20" : "bg-primary/12 border border-primary/20"

  const statusIconColor = app.status === "critical" ? "text-red-500" :
    app.status === "warning" ? "text-amber-500" :
    app.status === "degraded" ? "text-orange-500" : "text-primary"

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed top-0 right-0 h-full w-[440px] z-50 glass-panel-strong border-l border-border/60 shadow-premium flex flex-col"
    >
      <div className="flex items-start gap-3.5 px-5 py-4 border-b border-border/50">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", statusIconBg)}>
          <Server className={cn("w-5 h-5", statusIconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm font-mono text-foreground truncate leading-snug">{app.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{app.team} · {app.type}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={app.status} size="sm" />
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r={r} strokeWidth="7" stroke="hsl(var(--border))" fill="none" />
                <motion.circle cx="40" cy="40" r={r} strokeWidth="7"
                  stroke={scoreColor} fill="none" strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ - filled }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold leading-none tabular-nums" style={{ color: scoreColor }}>{app.score}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">score</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                { label: "Uptime", value: app.uptime },
                { label: "Latency", value: app.latency },
                { label: "RPM", value: app.rpm },
                { label: "Failing", value: app.failingChecks === 0 ? "None" : String(app.failingChecks) },
              ].map(s => (
                <div key={s.label} className="inset-panel px-2.5 py-2">
                  <div className="text-xs font-bold font-mono tabular-nums text-foreground">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="inset-panel p-3">
            <div className="section-label mb-1.5">About</div>
            <p className="text-xs text-foreground/80 leading-relaxed">{app.description}</p>
          </div>

          <div className="premium-card p-4">
            <div className="section-label mb-3">Health Score — 12h Trend</div>
            <ResponsiveContainer width="100%" height={64}>
              <AreaChart data={app.trend.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
                <defs>
                  <linearGradient id="drawerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={scoreColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={scoreColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={scoreColor} strokeWidth={2} fill="url(#drawerGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-0">
            {[
              { label: "Criticality", value: app.criticality },
              { label: "Environment", value: app.env },
              { label: "Dependencies", value: `${app.deps} services` },
              { label: "Connectors", value: app.connectors.join(", ") },
              { label: "Last Incident", value: app.lastIncident },
              { label: "Last Refresh", value: app.lastRefresh },
            ].map(d => (
              <div key={d.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <span className="text-xs text-muted-foreground">{d.label}</span>
                <span className="text-xs font-semibold text-foreground tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>

          {app.tags.length > 0 && (
            <div>
              <div className="section-label mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {app.tags.map(t => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="section-label mb-2">Open Incidents</div>
            {app.incidents > 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs text-red-600 dark:text-red-400 font-semibold">{app.incidents} active incident{app.incidents > 1 ? "s" : ""}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">No active incidents</span>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="flex gap-2 px-5 py-4 border-t border-border/50 bg-muted/20">
        <Button size="sm" className="flex-1 gap-1.5 text-xs">
          <ArrowUpRight className="w-3.5 h-3.5" /> Open 360° View
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          Incidents
        </Button>
      </div>
    </motion.div>
  )
}

function apiAppToEntry(a: Parameters<typeof mapAppSummary>[0]): AppEntry {
  const m = mapAppSummary(a)
  return {
    name: m.name,
    team: m.teamName || m.teamId,
    env: m.environment,
    status: m.status as AppStatus,
    criticality: (m.criticality || "P1") as Criticality,
    score: m.healthScore,
    uptime: `${m.uptime.toFixed(2)}%`,
    latency: `${m.latencyP99}ms`,
    rpm: m.rpm >= 1000 ? `${(m.rpm / 1000).toFixed(1)}K` : String(m.rpm),
    type: m.appType || "Service",
    tags: m.tags,
    incidents: m.incidentCount,
    deps: m.dependencyCount,
    connectors: [],
    lastIncident: "N/A",
    lastRefresh: "30s ago",
    failingChecks: m.status === "critical" ? 5 : m.status === "warning" ? 2 : 0,
    trend: m.trend,
    description: m.description,
  }
}

export function ApplicationCatalog() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"list" | "grid">("list")
  const [statusFilter, setStatusFilter] = useState("all")
  const [critFilter, setCritFilter] = useState("all")
  const [teamFilter, setTeamFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"criticality" | "score" | "latency" | "incidents">("criticality")
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["payments-api", "fraud-detection-service"]))
  const [drawerApp, setDrawerApp] = useState<AppEntry | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data: apiApps, loading } = useApi(listApps)
  const APPS_DATA: AppEntry[] = useMemo(() => {
    if (apiApps && apiApps.length > 0) return apiApps.map(apiAppToEntry)
    return APPS
  }, [apiApps])

  const teams = useMemo(() => ["all", ...Array.from(new Set(APPS_DATA.map(a => a.team))).sort()], [APPS_DATA])

  const filtered = useMemo(() => {
    return APPS_DATA
      .filter(app => {
        const ms = search.toLowerCase()
        const matchSearch = !ms ||
          app.name.includes(ms) || app.team.toLowerCase().includes(ms) ||
          app.type.toLowerCase().includes(ms) || app.tags.some(t => t.includes(ms))
        const matchStatus = statusFilter === "all" || app.status === statusFilter
        const matchCrit = critFilter === "all" || app.criticality === critFilter
        const matchTeam = teamFilter === "all" || app.team === teamFilter
        return matchSearch && matchStatus && matchCrit && matchTeam
      })
      .sort((a, b) => {
        if (sortBy === "criticality") {
          const cd = CRITICALITY_ORDER[a.criticality] - CRITICALITY_ORDER[b.criticality]
          return cd !== 0 ? cd : STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
        }
        if (sortBy === "score") return a.score - b.score
        if (sortBy === "latency") return parseInt(a.latency) - parseInt(b.latency)
        if (sortBy === "incidents") return b.incidents - a.incidents
        return 0
      })
  }, [search, statusFilter, critFilter, teamFilter, sortBy])

  const counts = useMemo(() => ({
    all: APPS_DATA.length,
    healthy: APPS_DATA.filter(a => a.status === "healthy").length,
    warning: APPS_DATA.filter(a => a.status === "warning").length,
    critical: APPS_DATA.filter(a => a.status === "critical").length,
    degraded: APPS_DATA.filter(a => a.status === "degraded").length,
  }), [APPS_DATA])

  const toggleFav = (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const n = new Set(prev)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })
  }

  const scoreColor = (s: number) => s >= 90 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444"

  const critBadge = (c: Criticality) => cn(
    "text-[9px] font-bold px-1.5 py-0.5 rounded",
    c === "P0" ? "text-red-500 bg-red-500/10 border border-red-500/20" :
    c === "P1" ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" :
    "text-muted-foreground bg-muted border border-border/40"
  )

  return (
    <>
      <AnimatePresence>
        {drawerApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setDrawerApp(null)}
            />
            <AppDrawer app={drawerApp} onClose={() => setDrawerApp(null)} />
          </>
        )}
      </AnimatePresence>

      <div className="min-h-full">
        <PageHeader
          title="Application Catalog"
          description={`${counts.all} applications monitored · ${counts.critical + counts.degraded + counts.warning} need attention`}
          actions={
            <PermissionGuard action="edit_apps">
              <Button size="sm" className="gap-2">
                <Plus className="w-3.5 h-3.5" /> Add Application
              </Button>
            </PermissionGuard>
          }
        />

        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "healthy", "warning", "degraded", "critical"] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
                  statusFilter === f
                    ? f === "all" ? "bg-foreground text-background border-foreground shadow-sm"
                    : f === "healthy" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 shadow-sm"
                    : f === "warning" ? "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400 shadow-sm"
                    : f === "degraded" ? "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400 shadow-sm"
                    : "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400 shadow-sm"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border bg-transparent"
                )}
              >
                {f !== "all" && (
                  <span className={cn("w-1.5 h-1.5 rounded-full",
                    f === "healthy" ? "bg-emerald-500" :
                    f === "warning" ? "bg-amber-500" :
                    f === "degraded" ? "bg-orange-500" : "bg-red-500"
                  )} />
                )}
                <span className="capitalize">{f}</span>
                <span className="tabular-nums text-[10px] opacity-60">({counts[f as keyof typeof counts] ?? counts.all})</span>
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="gap-1.5 h-8 text-xs"
                onClick={() => setShowFilters(p => !p)}>
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                {(critFilter !== "all" || teamFilter !== "all") && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {[critFilter !== "all", teamFilter !== "all"].filter(Boolean).length}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5 border border-border/40">
                <Button variant={view === "list" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("list")}>
                  <List className="w-4 h-4" />
                </Button>
                <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("grid")}>
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search apps, teams, tags..." className="pl-9 h-8 text-sm" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }} className="flex items-center gap-2 overflow-hidden">
                  <select
                    value={critFilter}
                    onChange={e => setCritFilter(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-border/60 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="all">All Criticality</option>
                    {["P0", "P1", "P2", "P3"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={teamFilter}
                    onChange={e => setTeamFilter(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-border/60 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {teams.map(t => <option key={t} value={t}>{t === "all" ? "All Teams" : t}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
              <span className="text-muted-foreground/60">Sort:</span>
              {(["criticality", "score", "latency", "incidents"] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={cn("px-2 py-0.5 rounded-md capitalize transition-all duration-150",
                    sortBy === s ? "text-primary font-semibold bg-primary/10" : "hover:text-foreground"
                  )}>{s}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> of {counts.all} applications
            </p>
            <div className="live-indicator">
              <span className="live-dot" />
              Live
            </div>
          </div>

          {view === "list" && (
            <div className="premium-card overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_84px_76px_72px_72px_56px_44px] gap-3 px-5 py-2.5 border-b border-border/50 bg-muted/20">
                {["Application", "Team / Type", "Status", "Score", "Latency", "Uptime", "Inc.", ""].map(h => (
                  <span key={h} className="section-label">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border/25">
                {filtered.map((app, i) => (
                  <motion.div
                    key={app.name}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setDrawerApp(app)}
                    className={cn(
                      "grid grid-cols-[2fr_1fr_84px_76px_72px_72px_56px_44px] gap-3 items-center px-5 py-3.5",
                      "hover:bg-muted/25 cursor-pointer transition-colors duration-150 group",
                      "border-l-2",
                      STATUS_ACCENT[app.status]
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        app.status === "critical" ? "bg-red-500/10" :
                        app.status === "warning" ? "bg-amber-500/10" :
                        app.status === "degraded" ? "bg-orange-500/10" : "bg-primary/8"
                      )}>
                        <Server className={cn("w-3.5 h-3.5",
                          app.status === "critical" ? "text-red-500" :
                          app.status === "warning" ? "text-amber-500" :
                          app.status === "degraded" ? "text-orange-500" : "text-primary"
                        )} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold font-mono text-foreground truncate">{app.name}</span>
                          {favorites.has(app.name) && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                          <span className={critBadge(app.criticality)}>{app.criticality}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {app.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[9px] text-muted-foreground/60 font-medium">{t}</span>
                          ))}
                          {app.tags.length > 2 && <span className="text-[9px] text-muted-foreground/40">+{app.tags.length - 2}</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-foreground">{app.team}</div>
                      <div className="text-[10px] text-muted-foreground">{app.type}</div>
                    </div>

                    <StatusBadge status={app.status} size="sm" />

                    <div className="flex items-center gap-1">
                      <MiniSparkline data={app.trend} color={scoreColor(app.score)} />
                      <span className="text-xs font-mono font-bold tabular-nums" style={{ color: scoreColor(app.score) }}>{app.score}</span>
                    </div>

                    <span className={cn("text-xs font-mono font-semibold tabular-nums",
                      parseInt(app.latency) > 500 ? "text-red-500" :
                      parseInt(app.latency) > 200 ? "text-amber-500" : "text-foreground"
                    )}>{app.latency}</span>

                    <span className="text-xs font-mono tabular-nums text-foreground">{app.uptime}</span>

                    <span className={cn("text-xs font-semibold tabular-nums",
                      app.incidents > 0 ? "text-red-500" : "text-muted-foreground/50"
                    )}>{app.incidents > 0 ? app.incidents : "—"}</span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button onClick={e => toggleFav(app.name, e)} className="p-1 rounded hover:bg-muted transition-colors">
                        {favorites.has(app.name)
                          ? <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          : <StarOff className="w-3 h-3 text-muted-foreground" />
                        }
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {view === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setDrawerApp(app)}
                  className={cn(
                    "premium-card-interactive p-4 group",
                    "border-t-2",
                    app.status === "critical" ? "border-t-red-500" :
                    app.status === "warning" ? "border-t-amber-500" :
                    app.status === "degraded" ? "border-t-orange-500" : "border-t-transparent"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        app.status === "critical" ? "bg-red-500/10" :
                        app.status === "warning" ? "bg-amber-500/10" :
                        app.status === "degraded" ? "bg-orange-500/10" : "bg-primary/8"
                      )}>
                        <Server className={cn("w-4 h-4",
                          app.status === "critical" ? "text-red-500" :
                          app.status === "warning" ? "text-amber-500" :
                          app.status === "degraded" ? "text-orange-500" : "text-primary"
                        )} />
                      </div>
                      <div>
                        <span className={critBadge(app.criticality)}>{app.criticality}</span>
                        {favorites.has(app.name) && <Star className="w-3 h-3 text-amber-400 fill-amber-400 ml-1 inline-block" />}
                      </div>
                    </div>
                    <button onClick={e => toggleFav(app.name, e)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
                      {favorites.has(app.name)
                        ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        : <StarOff className="w-3.5 h-3.5 text-muted-foreground" />
                      }
                    </button>
                  </div>

                  <div className="font-semibold text-sm font-mono text-foreground mb-0.5 truncate">{app.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">{app.team} · {app.type}</div>

                  <div className="flex items-center justify-between mb-3.5">
                    <StatusBadge status={app.status} size="sm" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold font-mono tabular-nums leading-none" style={{ color: scoreColor(app.score) }}>{app.score}</span>
                      <MiniSparkline data={app.trend} color={scoreColor(app.score)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className={cn("rounded-lg px-1.5 py-1.5",
                      parseInt(app.latency) > 500 ? "bg-red-500/8" :
                      parseInt(app.latency) > 200 ? "bg-amber-500/8" : "bg-muted/50"
                    )}>
                      <div className={cn("text-xs font-mono font-bold tabular-nums",
                        parseInt(app.latency) > 500 ? "text-red-500" :
                        parseInt(app.latency) > 200 ? "text-amber-500" : "text-foreground"
                      )}>{app.latency}</div>
                      <div className="text-[9px] text-muted-foreground">latency</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-1.5 py-1.5">
                      <div className="text-xs font-mono font-bold tabular-nums text-foreground">{app.uptime}</div>
                      <div className="text-[9px] text-muted-foreground">uptime</div>
                    </div>
                    <div className={cn("rounded-lg px-1.5 py-1.5", app.incidents > 0 ? "bg-red-500/8" : "bg-muted/50")}>
                      <div className={cn("text-xs font-mono font-bold tabular-nums", app.incidents > 0 ? "text-red-500" : "text-foreground")}>
                        {app.incidents > 0 ? app.incidents : "0"}
                      </div>
                      <div className="text-[9px] text-muted-foreground">incidents</div>
                    </div>
                  </div>

                  {app.tags.length > 0 && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {app.tags.slice(0, 3).map(t => (
                        <span key={t} className="tag-pill">{t}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1.5">No applications found</div>
              <div className="text-xs text-muted-foreground mb-4">Try adjusting your search or filters</div>
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); setCritFilter("all"); setTeamFilter("all") }}>
                Clear all filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
