import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, RefreshCw, ChevronDown, ChevronUp,
  TriangleAlert as AlertTriangle, CircleX, Clock, User, ArrowUpRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Incident, Alert } from "@/lib/api/incidents"

interface Props {
  incidents: Incident[]
  alerts: Alert[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  refreshing: boolean
  onAcknowledge: (id: string) => void
  onResolve: (id: string) => void
  onAcknowledgeAlert: (id: string) => void
}

const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500 animate-pulse" },
  warning: { label: "Warning", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" },
  degraded: { label: "Degraded", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-500" },
  info: { label: "Info", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-500" },
}

const STATUS_CONFIG = {
  active: { label: "Active", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/8" },
  investigating: { label: "Investigating", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/8" },
  acknowledged: { label: "Acknowledged", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/8" },
  resolved: { label: "Resolved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8" },
}

type ViewTab = "incidents" | "alerts"
type SeverityFilter = "All" | "critical" | "warning" | "degraded"
type StatusFilter = "All" | "active" | "investigating" | "acknowledged" | "resolved"

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0", cfg.bg, cfg.color)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function IncidentRow({ incident, onAck, onResolve }: { incident: Incident; onAck: () => void; onResolve: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const statusCfg = STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active
  const isResolved = incident.status === "resolved"

  return (
    <div className={cn("border rounded-lg overflow-hidden transition-colors", isResolved ? "border-border opacity-60" : "border-border")}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition-colors text-left"
      >
        <div className="pt-0.5">
          <SeverityBadge severity={incident.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-foreground leading-snug">{incident.title}</span>
            <span className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">{incident.id}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", statusCfg.bg, statusCfg.color)}>{statusCfg.label}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {incident.duration}
            </span>
            {incident.assignee && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                {incident.assignee}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{incident.app_name}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/10 space-y-3">
              {incident.ai_cause && (
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">Root Cause</div>
                  <div className="text-xs text-foreground">{incident.ai_cause}</div>
                </div>
              )}
              {incident.affected_deps && incident.affected_deps.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-1">Affected Dependencies</div>
                  <div className="flex flex-wrap gap-1">
                    {incident.affected_deps.map(dep => (
                      <Badge key={dep} variant="secondary" className="text-[10px] h-5">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {incident.timeline && incident.timeline.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground font-medium mb-2">Timeline</div>
                  <div className="space-y-1.5">
                    {incident.timeline.slice(0, 4).map((ev, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground font-mono shrink-0 mt-0.5">{ev.time}</span>
                        <span className="text-foreground">{ev.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!isResolved && (
                <div className="flex gap-2 pt-1">
                  {incident.status !== "acknowledged" && incident.status !== "investigating" && (
                    <button
                      onClick={e => { e.stopPropagation(); onAck() }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); onResolve() }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AlertRow({ alert, onAck }: { alert: Alert; onAck: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const isAcknowledged = alert.status === "acknowledged"

  return (
    <div className={cn("border rounded-lg overflow-hidden", isAcknowledged && "opacity-60")}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition-colors text-left"
      >
        <div className="pt-0.5">
          <SeverityBadge severity={alert.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{alert.rule_name}</div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{alert.app_name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{alert.metric}: <span className="text-foreground font-medium">{alert.value}</span> / {alert.threshold}</span>
            <span className="text-xs text-muted-foreground">{alert.environment}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/10 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">Status</div>
                  <div className="font-medium text-foreground capitalize">{alert.status}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Fired At</div>
                  <div className="font-medium text-foreground">{alert.fired_at}</div>
                </div>
              </div>
              {!isAcknowledged && (
                <button
                  onClick={e => { e.stopPropagation(); onAck() }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OperationsIncidents({ incidents, alerts, loading, error, onRefresh, refreshing, onAcknowledge, onResolve, onAcknowledgeAlert }: Props) {
  const [view, setView] = useState<ViewTab>("incidents")
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")

  const filteredIncidents = incidents.filter(i => {
    if (severityFilter !== "All" && i.severity !== severityFilter) return false
    if (statusFilter !== "All" && i.status !== statusFilter) return false
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.app_name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== "All" && a.severity !== severityFilter) return false
    if (search && !a.rule_name.toLowerCase().includes(search.toLowerCase()) && !a.app_name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const activeCount = incidents.filter(i => i.status !== "resolved").length
  const alertCount = alerts.filter(a => a.status !== "acknowledged").length

  return (
    <div className="space-y-4 px-6">
      <div className="flex items-center gap-1 border-b border-border">
        {[
          { id: "incidents" as ViewTab, label: "Incidents", count: activeCount },
          { id: "alerts" as ViewTab, label: "Alerts", count: alertCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              view === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                view === tab.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${view}...`}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["All", "critical", "warning", "degraded"] as SeverityFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setSeverityFilter(f)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize",
                severityFilter === f
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
              )}
            >
              {f}
            </button>
          ))}
          {view === "incidents" && (
            <>
              {(["All", "active", "investigating", "resolved"] as StatusFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize",
                    statusFilter === f
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                  )}
                >
                  {f}
                </button>
              ))}
            </>
          )}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !incidents.length ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CircleX className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={onRefresh} className="mt-3 text-xs text-primary hover:underline">Try again</button>
        </div>
      ) : view === "incidents" ? (
        filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No incidents found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIncidents.map((inc, i) => (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <IncidentRow
                  incident={inc}
                  onAck={() => onAcknowledge(inc.id)}
                  onResolve={() => onResolve(inc.id)}
                />
              </motion.div>
            ))}
          </div>
        )
      ) : (
        filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No alerts found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <AlertRow alert={alert} onAck={() => onAcknowledgeAlert(alert.id)} />
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
