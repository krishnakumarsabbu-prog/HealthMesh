import { motion } from "framer-motion"
import { Activity, Plug2, TriangleAlert as AlertTriangle, GitBranch, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardOverview } from "@/lib/api/dashboard"
import type { ConnectorInstanceRow } from "@/lib/api/connectors"
import type { Incident, Alert } from "@/lib/api/incidents"

interface Props {
  overview: DashboardOverview | null
  connectors: ConnectorInstanceRow[]
  incidents: Incident[]
  alerts: Alert[]
  wsConnected: boolean
  lastRefreshed: Date | null
  onRefresh: () => void
  refreshing: boolean
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconColor,
  iconBg,
  delta,
  deltaPositive,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub?: string
  iconColor: string
  iconBg: string
  delta?: string
  deltaPositive?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay ?? 0 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
      {delta !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          deltaPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
        )}>
          {deltaPositive
            ? <TrendingUp className="w-3 h-3" />
            : deltaPositive === false
              ? <TrendingDown className="w-3 h-3" />
              : <Minus className="w-3 h-3" />
          }
          {delta}
        </div>
      )}
    </motion.div>
  )
}

export function OperationsOverview({ overview, connectors, incidents, alerts, wsConnected, lastRefreshed, onRefresh, refreshing }: Props) {
  const activeIncidents = incidents.filter(i => i.status !== "resolved").length
  const activeAlerts = alerts.filter(a => a.status === "active" || a.status === "firing").length
  const connectorActive = connectors.filter(c => c.status === "active").length
  const connectorIssues = connectors.filter(c => c.status === "warning" || c.status === "error").length

  const criticalIncidents = incidents.filter(i => i.severity === "critical" && i.status !== "resolved")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
            wsConnected
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-muted-foreground bg-muted border-border"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", wsConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
            {wsConnected ? "Live" : "Offline"}
          </div>
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 bg-background"
        >
          <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Active Incidents"
          value={overview?.active_incidents ?? activeIncidents}
          sub={`${criticalIncidents.length} critical`}
          iconColor="text-red-500"
          iconBg="bg-red-500/10"
          delay={0}
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={overview?.active_alerts ?? activeAlerts}
          sub="across all apps"
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          delay={0.06}
        />
        <StatCard
          icon={Plug2}
          label="Connectors Active"
          value={connectorActive}
          sub={connectorIssues > 0 ? `${connectorIssues} need attention` : "All healthy"}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
          delta={connectorIssues === 0 ? "All healthy" : `${connectorIssues} issues`}
          deltaPositive={connectorIssues === 0}
          delay={0.12}
        />
        <StatCard
          icon={GitBranch}
          label="Avg Health Score"
          value={overview ? `${overview.avg_health_score.toFixed(0)}` : "—"}
          sub="across all services"
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          delay={0.18}
        />
      </div>

      {criticalIncidents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24 }}
          className="mx-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">Critical Incidents Requiring Attention</span>
          </div>
          <div className="space-y-2">
            {criticalIncidents.slice(0, 3).map(inc => (
              <div key={inc.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-foreground truncate block">{inc.title}</span>
                  <span className="text-xs text-muted-foreground">{inc.app_name} · {inc.duration}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground font-mono">{inc.id}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Plug2 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Connector Health</h3>
          </div>
          <div className="space-y-2">
            {connectors.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    c.status === "active" ? "bg-emerald-500" :
                    c.status === "warning" ? "bg-amber-500" : "bg-red-500"
                  )} />
                  <span className="text-sm text-foreground truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{c.health_score}%</span>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", c.health_score >= 80 ? "bg-emerald-500" : c.health_score >= 60 ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${c.health_score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {connectors.length === 0 && (
              <p className="text-xs text-muted-foreground">No connectors configured</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.36 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Environment Health</h3>
          </div>
          {overview?.environment_health && overview.environment_health.length > 0 ? (
            <div className="space-y-2">
              {overview.environment_health.map(env => (
                <div key={env.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      env.status === "healthy" ? "bg-emerald-500" :
                      env.status === "warning" ? "bg-amber-500" : "bg-red-500"
                    )} />
                    <span className="text-sm text-foreground">{env.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{env.app_count} apps</span>
                    <span className="text-xs font-medium text-foreground">{env.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Loading environment data...</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
