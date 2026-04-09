import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TriangleAlert as AlertTriangle, CircleX, Clock, CircleCheck as CheckCircle, User,
  Plus, Search, X, ChevronRight, Layers, Zap, ArrowUpRight, Activity,
  Brain, Eye, Flame
} from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { listIncidents, listAlerts, acknowledgeIncident, resolveIncident } from "@/lib/api/incidents"
import { mapIncident, mapAlert } from "@/lib/mappers"

const STATIC_INCIDENTS = [
  {
    id: "INC-2847",
    title: "search-api P99 latency exceeding SLO threshold",
    apps: ["search-api", "api-gateway"],
    sources: ["Datadog APM", "Prometheus"],
    severity: "critical" as const,
    status: "active",
    age: "14m",
    owner: "Discovery",
    assignee: "Jake M.",
    desc: "P99 latency has been above 2000ms for 14 minutes. Suspect database connection pool exhaustion on db-primary. Cascading impact on downstream consumers detected.",
    cause: "DB connection pool saturation (89% usage)",
    healthImpact: 24,
    affectedDeps: ["db-primary", "redis-cluster"],
    timeline: [
      { time: "14:38", event: "Anomaly detected by Datadog APM", type: "detection" },
      { time: "14:40", event: "P99 latency crossed 1500ms threshold", type: "threshold" },
      { time: "14:44", event: "Auto-correlated with db-primary pool metrics", type: "correlation" },
      { time: "14:47", event: "Incident created, Jake M. assigned", type: "assignment" },
      { time: "14:52", event: "Investigation in progress", type: "update" },
    ],
  },
  {
    id: "INC-2846",
    title: "auth-service elevated 5xx error rate",
    apps: ["auth-service"],
    sources: ["Datadog", "CloudWatch"],
    severity: "warning" as const,
    status: "investigating",
    age: "1h 22m",
    owner: "Platform",
    assignee: "Sarah C.",
    desc: "Error rate at 1.2%, above the 0.5% critical threshold. Correlated with recent config change in session management module. Redis latency spike also observed.",
    cause: "Config change in session refresh handler",
    healthImpact: 11,
    affectedDeps: ["redis-cluster"],
    timeline: [
      { time: "13:30", event: "Error rate crossed 0.5% warning threshold", type: "threshold" },
      { time: "13:32", event: "PagerDuty alert fired — Platform team notified", type: "alert" },
      { time: "13:35", event: "Sarah C. acknowledged incident", type: "ack" },
      { time: "13:50", event: "Config change identified as probable cause", type: "update" },
    ],
  },
  {
    id: "INC-2844",
    title: "recommendation-engine degraded throughput",
    apps: ["recommendation-engine"],
    sources: ["Prometheus", "Datadog APM"],
    severity: "degraded" as const,
    status: "investigating",
    age: "3h 5m",
    owner: "ML",
    assignee: "David R.",
    desc: "Throughput dropped 40% from baseline. Memory pressure suspected due to model reload cycle. GC pause correlation confirmed by AI analysis (r=0.91).",
    cause: "JVM GC pauses on db-replica-2 causing secondary latency",
    healthImpact: 8,
    affectedDeps: ["db-replica-2"],
    timeline: [
      { time: "11:47", event: "Throughput anomaly detected — 40% drop", type: "detection" },
      { time: "11:52", event: "AI correlated with GC pause events (r=0.91)", type: "correlation" },
      { time: "12:00", event: "David R. assigned, investigation started", type: "assignment" },
    ],
  },
  {
    id: "INC-2841",
    title: "notification-worker queue backlog exceeding threshold",
    apps: ["notification-worker"],
    sources: ["Kafka Monitor", "CloudWatch"],
    severity: "warning" as const,
    status: "resolved",
    age: "6h ago",
    owner: "Platform",
    assignee: "Maria L.",
    desc: "Queue depth reached 50K messages. Added 2 additional worker instances. Backlog cleared within 18 minutes. Root cause: deployment rollout caused momentary consumer pause.",
    cause: "Deployment rollout paused consumers briefly",
    healthImpact: 0,
    affectedDeps: [],
    timeline: [
      { time: "08:44", event: "Queue depth crossed 20K threshold", type: "threshold" },
      { time: "08:50", event: "Auto-scaling triggered — 2 additional workers", type: "action" },
      { time: "09:08", event: "Queue cleared — backlog resolved", type: "resolution" },
    ],
  },
  {
    id: "INC-2839",
    title: "catalog-service cache miss rate spike",
    apps: ["catalog-service"],
    sources: ["Redis Monitor", "Datadog"],
    severity: "warning" as const,
    status: "resolved",
    age: "1d ago",
    owner: "Commerce",
    assignee: "Tom W.",
    desc: "Redis connection timeout caused cache miss spike to 78%. DB read load increased 3× temporarily. Connection pool config updated to fix root cause.",
    cause: "Redis connection timeout misconfiguration",
    healthImpact: 0,
    affectedDeps: ["redis-cluster", "db-primary"],
    timeline: [
      { time: "Yesterday 14:22", event: "Cache miss rate spiked to 78%", type: "threshold" },
      { time: "Yesterday 14:31", event: "Root cause identified — connection pool", type: "correlation" },
      { time: "Yesterday 15:10", event: "Config updated and deployed", type: "action" },
      { time: "Yesterday 15:25", event: "Cache miss rate normalized", type: "resolution" },
    ],
  },
]

type IncidentEntry = {
  id: string; title: string; apps: string[]; sources: string[]; severity: string;
  status: string; age: string; owner: string; assignee: string; desc: string;
  cause: string; healthImpact: number; affectedDeps: string[];
  timeline: Array<{ time: string; event: string; type: string }>
}

function apiToIncident(a: Parameters<typeof mapIncident>[0]): IncidentEntry {
  const m = mapIncident(a)
  return {
    id: m.id, title: m.title, apps: m.apps, sources: m.sources,
    severity: m.severity, status: m.status, age: m.age,
    owner: m.owner, assignee: m.assignee, desc: m.description,
    cause: m.aiCause, healthImpact: m.healthImpact,
    affectedDeps: m.affectedDeps,
    timeline: m.timeline,
  }
}

type AlertEntry = { id: string; rule: string; app: string; severity: string; time: string; source: string }

function apiToAlert(a: Parameters<typeof mapAlert>[0]): AlertEntry {
  const m = mapAlert(a)
  return { id: m.id, rule: m.ruleName, app: m.appName, severity: m.severity, time: m.firedAt, source: m.source }
}

const STATIC_ALERTS: AlertEntry[] = [
  { id: "ALT-8821", rule: "SLO Burn Rate (1h)", app: "search-api", severity: "critical", time: "2m ago", source: "Datadog" },
  { id: "ALT-8820", rule: "P99 Latency > 500ms", app: "search-api", severity: "critical", time: "14m ago", source: "Prometheus" },
  { id: "ALT-8819", rule: "Error Rate > 1%", app: "auth-service", severity: "warning", time: "1h ago", source: "Datadog" },
  { id: "ALT-8817", rule: "Memory > 85%", app: "recommendation-engine", severity: "warning", time: "2h ago", source: "Prometheus" },
  { id: "ALT-8815", rule: "Connection Pool > 80%", app: "payments-api", severity: "warning", time: "3h ago", source: "CloudWatch" },
]

const STATUS_META = {
  active: { label: "Active", dot: "bg-red-500 animate-pulse", text: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  investigating: { label: "Investigating", dot: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  resolved: { label: "Resolved", dot: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
}

const SEV_COLORS = {
  critical: { icon: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", accent: "border-l-red-500" },
  warning: { icon: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", accent: "border-l-amber-500" },
  degraded: { icon: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", accent: "border-l-orange-500" },
  healthy: { icon: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", accent: "border-l-emerald-500" },
  unknown: { icon: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/40", accent: "border-l-border" },
}

const TIMELINE_COLORS: Record<string, string> = {
  detection: "bg-red-500",
  threshold: "bg-amber-500",
  correlation: "bg-blue-500",
  assignment: "bg-primary",
  alert: "bg-orange-500",
  ack: "bg-teal-500",
  update: "bg-muted-foreground",
  action: "bg-primary",
  resolution: "bg-emerald-500",
}

export function IncidentsAlerts() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedIncident, setSelectedIncident] = useState<IncidentEntry | null>(null)
  const [activeTab, setActiveTab] = useState<"incidents" | "alerts">("incidents")
  const [actionLoading, setActionLoading] = useState<"ack" | "resolve" | null>(null)
  const [localUpdates, setLocalUpdates] = useState<Record<string, string>>({})

  const { data: apiIncidents, refetch: refetchIncidents } = useApi(listIncidents)
  const { data: apiAlerts } = useApi(listAlerts)

  const handleAcknowledge = async (id: string) => {
    setActionLoading("ack")
    try {
      await acknowledgeIncident(id)
      setLocalUpdates(prev => ({ ...prev, [id]: "acknowledged" }))
      setSelectedIncident(prev => prev ? { ...prev, status: "investigating" } : null)
      refetchIncidents()
    } catch {
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolve = async (id: string) => {
    setActionLoading("resolve")
    try {
      await resolveIncident(id)
      setLocalUpdates(prev => ({ ...prev, [id]: "resolved" }))
      setSelectedIncident(prev => prev ? { ...prev, status: "resolved" } : null)
      refetchIncidents()
    } catch {
    } finally {
      setActionLoading(null)
    }
  }

  const staticIncidents: IncidentEntry[] = STATIC_INCIDENTS.map(i => ({
    ...i, sources: i.sources, owner: i.owner,
  }))
  const INCIDENTS = (apiIncidents && apiIncidents.length > 0
    ? apiIncidents.map(apiToIncident)
    : staticIncidents
  ).map(inc => localUpdates[inc.id] ? { ...inc, status: localUpdates[inc.id] } : inc)
  const ALERTS = apiAlerts && apiAlerts.length > 0
    ? apiAlerts.map(apiToAlert)
    : STATIC_ALERTS

  const filtered = INCIDENTS.filter(inc => {
    const matchSearch = inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.apps.some(a => a.includes(search.toLowerCase()))
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "active" && (inc.status === "active" || inc.status === "investigating")) ||
      (statusFilter === "resolved" && inc.status === "resolved")
    const matchSev = severityFilter === "all" || inc.severity === severityFilter
    return matchSearch && matchStatus && matchSev
  })

  const stats = {
    active: INCIDENTS.filter(i => i.status === "active").length,
    investigating: INCIDENTS.filter(i => i.status === "investigating").length,
    resolved: INCIDENTS.filter(i => i.status === "resolved").length,
    mttr: "—",
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="Incidents & Alerts"
        description="Command center for incident response, alert management, and operational events"
        badge={stats.active > 0 ? <Badge variant="critical" size="sm">{stats.active} Active</Badge> : undefined}
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Create Incident
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active", value: stats.active, color: "text-red-500", bg: "bg-red-500/8 border-red-500/20", dot: "bg-red-500 animate-pulse", glow: "shadow-glow-red" },
            { label: "Investigating", value: stats.investigating, color: "text-amber-500", bg: "bg-amber-500/8 border-amber-500/20", dot: "bg-amber-500", glow: "" },
            { label: "Resolved (7d)", value: stats.resolved, color: "text-emerald-500", bg: "bg-emerald-500/8 border-emerald-500/20", dot: "bg-emerald-500", glow: "" },
            { label: "MTTR (7d)", value: stats.mttr, color: "text-blue-500", bg: "bg-blue-500/8 border-blue-500/20", dot: "bg-blue-400", glow: "" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn("rounded-xl border p-4 flex items-center gap-3.5", s.bg, s.glow)}>
              <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.dot)} />
              <div>
                <div className={cn("text-2xl font-bold tracking-tight tabular-nums", s.color)}>{s.value}</div>
                <div className="section-label mt-0.5">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border/40 shrink-0">
            {["incidents", "alerts"].map(t => (
              <button key={t} onClick={() => setActiveTab(t as "incidents" | "alerts")}
                className={cn("px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize",
                  activeTab === t ? "bg-background text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"
                )}>
                {t}
                {t === "alerts" && <span className="ml-1.5 px-1 py-0 rounded text-[9px] bg-amber-500/15 text-amber-500 border border-amber-500/20 font-bold">{ALERTS.length}</span>}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents…"
              className="pl-8 h-8 text-xs w-48" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground" /></button>}
          </div>

          <div className="flex items-center gap-1.5">
            {["all", "active", "resolved"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={cn("px-2.5 py-1.5 text-[11px] font-medium rounded-full border transition-all capitalize",
                  statusFilter === f ? "bg-primary/10 text-primary border-primary/30 shadow-sm" : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}>{f}</button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {["all", "critical", "warning", "degraded"].map(f => (
              <button key={f} onClick={() => setSeverityFilter(f)}
                className={cn("px-2.5 py-1.5 text-[11px] font-medium rounded-full border transition-all capitalize",
                  severityFilter === f
                    ? f === "critical" ? "bg-red-500/10 text-red-500 border-red-500/30"
                    : f === "warning" ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    : f === "degraded" ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                    : "bg-foreground/8 text-foreground border-foreground/20"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}>{f}</button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "incidents" ? (
            <motion.div key="incidents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {filtered.map((inc, i) => {
                const st = STATUS_META[inc.status as keyof typeof STATUS_META]
                const sev = SEV_COLORS[inc.severity as keyof typeof SEV_COLORS] || SEV_COLORS.unknown
                return (
                  <motion.div key={inc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedIncident(inc)}
                    className={cn(
                      "premium-card p-5 cursor-pointer group hover:border-primary/20 transition-all border-l-[3px]",
                      sev.accent
                    )}>
                    <div className="flex items-start gap-4">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", sev.bg)}>
                        {inc.severity === "critical"
                          ? <Flame className={cn("w-4 h-4", sev.icon)} />
                          : <AlertTriangle className={cn("w-4 h-4", sev.icon)} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-xs font-mono text-muted-foreground/70">{inc.id}</span>
                          <StatusBadge status={inc.severity as "critical" | "warning" | "degraded"} size="sm" />
                          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border", st.bg, st.text)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                            {st.label}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" /> {inc.age}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-foreground mb-1.5 leading-snug">{inc.title}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed mb-3">{inc.desc}</div>
                        <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            <span className="font-medium text-foreground/80">{inc.assignee}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3 h-3" />
                            <span className="flex gap-1">
                              {inc.apps.map(a => (
                                <span key={a} className="font-mono text-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">{a}</span>
                              ))}
                            </span>
                          </span>
                          {inc.healthImpact > 0 && (
                            <span className="flex items-center gap-1 text-red-500 font-semibold">
                              <ArrowUpRight className="w-3 h-3" /> −{inc.healthImpact}pts health impact
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs gap-1.5 text-primary">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </div>
                  </motion.div>
                )
              })}

              {filtered.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1.5">No incidents found</div>
                  <div className="text-xs text-muted-foreground">All clear — adjust filters to see more</div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="premium-card overflow-hidden">
              <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-border/50 bg-muted/20">
                <span className="section-label"></span>
                <span className="section-label">Rule</span>
                <span className="section-label">Application</span>
                <span className="section-label">Severity</span>
                <span className="section-label">Source</span>
                <span className="section-label">Time</span>
              </div>
              <div className="divide-y divide-border/30">
                {ALERTS.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 cursor-pointer transition-colors duration-150 group">
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      a.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-amber-500")} />
                    <div>
                      <div className="text-xs font-semibold text-foreground">{a.rule}</div>
                      <div className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{a.id}</div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded w-fit">{a.app}</span>
                    <span className={cn("text-xs font-semibold capitalize",
                      a.severity === "critical" ? "text-red-500" : "text-amber-500")}>{a.severity}</span>
                    <span className="text-xs text-muted-foreground">{a.source}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{a.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[480px] glass-panel-strong border-l border-border/60 flex flex-col">
              <div className="flex items-start justify-between p-5 border-b border-border/50">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground/70">{selectedIncident.id}</span>
                    <StatusBadge status={selectedIncident.severity as "critical" | "warning" | "degraded"} size="sm" />
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border",
                      STATUS_META[selectedIncident.status as keyof typeof STATUS_META].bg,
                      STATUS_META[selectedIncident.status as keyof typeof STATUS_META].text
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META[selectedIncident.status as keyof typeof STATUS_META].dot)} />
                      {STATUS_META[selectedIncident.status as keyof typeof STATUS_META].label}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground leading-snug">{selectedIncident.title}</div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setSelectedIncident(null)} className="shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Assignee", value: selectedIncident.assignee },
                    { label: "Team", value: selectedIncident.owner },
                    { label: "Age", value: selectedIncident.age },
                  ].map((m, i) => (
                    <div key={i} className="inset-panel p-3 text-center">
                      <div className="text-sm font-bold text-foreground">{m.value}</div>
                      <div className="section-label mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Brain className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-primary">AI Probable Cause</div>
                  </div>
                  <div className="text-sm text-foreground font-semibold mb-1.5">{selectedIncident.cause}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{selectedIncident.desc}</div>
                </div>

                <div>
                  <div className="section-label mb-2">Impacted Applications</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.apps.map(app => (
                      <span key={app} className="font-mono text-xs px-2.5 py-1 rounded-lg bg-red-500/8 border border-red-500/20 text-foreground">{app}</span>
                    ))}
                  </div>
                </div>

                {selectedIncident.affectedDeps.length > 0 && (
                  <div>
                    <div className="section-label mb-2">Affected Dependencies</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.affectedDeps.map(dep => (
                        <span key={dep} className="font-mono text-xs px-2.5 py-1 rounded-lg bg-amber-500/8 border border-amber-500/20 text-foreground">{dep}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="section-label mb-3">Event Timeline</div>
                  <div className="relative pl-5">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border/60" />
                    <div className="space-y-3.5">
                      {selectedIncident.timeline.map((ev, i) => (
                        <div key={i} className="relative flex items-start gap-3">
                          <div className={cn("absolute -left-[18px] w-3 h-3 rounded-full mt-0.5 border-2 border-background z-10",
                            TIMELINE_COLORS[ev.type] || "bg-muted")} />
                          <div className="font-mono text-[10px] text-muted-foreground w-16 shrink-0 mt-0.5 tabular-nums">{ev.time}</div>
                          <div className="text-xs text-foreground/80 leading-relaxed">{ev.event}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="inset-panel p-4">
                  <div className="section-label mb-2.5">Recommended Next Checks</div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      Review connection pool settings on {selectedIncident.affectedDeps[0] || "affected service"}
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      Check recent deployment activity in the past 2h
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      Correlate with {selectedIncident.sources[0]} logs for full trace
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border/50 p-4 grid grid-cols-2 gap-2 bg-muted/10">
                <Button
                  variant="outline" size="sm" className="gap-2 text-xs"
                  disabled={selectedIncident.status === "resolved" || actionLoading !== null}
                  onClick={() => handleAcknowledge(selectedIncident.id)}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {actionLoading === "ack" ? "Acknowledging…" : "Acknowledge"}
                </Button>
                <Button
                  size="sm" className="gap-2 text-xs"
                  disabled={selectedIncident.status === "resolved" || actionLoading !== null}
                  onClick={() => handleResolve(selectedIncident.id)}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {actionLoading === "resolve" ? "Resolving…" : "Mark Resolved"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
