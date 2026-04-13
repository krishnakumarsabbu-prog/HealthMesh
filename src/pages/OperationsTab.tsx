import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Plug2, TriangleAlert as AlertTriangle, GitBranch } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useHealthSocket } from "@/hooks/useHealthSocket"
import { usePolling } from "@/hooks/usePolling"
import { listConnectorInstances } from "@/lib/api/connectors"
import { listIncidents, listAlerts, acknowledgeIncident, resolveIncident, acknowledgeAlert } from "@/lib/api/incidents"
import { getDependencyMap } from "@/lib/api/misc"
import { getDashboardOverview } from "@/lib/api/dashboard"
import type { ConnectorInstanceRow } from "@/lib/api/connectors"
import type { Incident, Alert } from "@/lib/api/incidents"
import type { DashboardOverview } from "@/lib/api/dashboard"
import type { DependencyMap } from "@/lib/api/misc"
import { OperationsOverview } from "./operations/OperationsOverview"
import { OperationsConnectors } from "./operations/OperationsConnectors"
import { OperationsIncidents } from "./operations/OperationsIncidents"
import { OperationsDependencies } from "./operations/OperationsDependencies"
import type { OpTab } from "./operations/types"

const TABS: { id: OpTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "connectors", label: "Connectors", icon: Plug2 },
  { id: "incidents", label: "Incidents & Alerts", icon: AlertTriangle },
  { id: "dependencies", label: "Dependencies", icon: GitBranch },
]

const POLL_INTERVAL = 30_000

export function OperationsTab() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<OpTab>("overview")
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const [connectors, setConnectors] = useState<ConnectorInstanceRow[]>([])
  const [connectorsLoading, setConnectorsLoading] = useState(true)
  const [connectorsError, setConnectorsError] = useState<string | null>(null)
  const [connectorsRefreshing, setConnectorsRefreshing] = useState(false)

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [incidentsLoading, setIncidentsLoading] = useState(true)
  const [incidentsError, setIncidentsError] = useState<string | null>(null)
  const [incidentsRefreshing, setIncidentsRefreshing] = useState(false)

  const [depMap, setDepMap] = useState<DependencyMap | null>(null)
  const [depLoading, setDepLoading] = useState(true)
  const [depError, setDepError] = useState<string | null>(null)
  const [depRefreshing, setDepRefreshing] = useState(false)

  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [overviewRefreshing, setOverviewRefreshing] = useState(false)

  const mountedRef = useRef(true)

  const { connected: wsConnected } = useHealthSocket({ token, enabled: !!token })

  const fetchConnectors = useCallback(async (silent = false) => {
    if (!mountedRef.current) return
    if (silent) setConnectorsRefreshing(true)
    else setConnectorsLoading(true)
    setConnectorsError(null)
    try {
      const data = await listConnectorInstances()
      if (mountedRef.current) setConnectors(data)
    } catch (e) {
      if (mountedRef.current) setConnectorsError(e instanceof Error ? e.message : "Failed to load connectors")
    } finally {
      if (mountedRef.current) { setConnectorsLoading(false); setConnectorsRefreshing(false) }
    }
  }, [])

  const fetchIncidents = useCallback(async (silent = false) => {
    if (!mountedRef.current) return
    if (silent) setIncidentsRefreshing(true)
    else setIncidentsLoading(true)
    setIncidentsError(null)
    try {
      const [incData, alertData] = await Promise.all([listIncidents(), listAlerts()])
      if (mountedRef.current) { setIncidents(incData); setAlerts(alertData) }
    } catch (e) {
      if (mountedRef.current) setIncidentsError(e instanceof Error ? e.message : "Failed to load incidents")
    } finally {
      if (mountedRef.current) { setIncidentsLoading(false); setIncidentsRefreshing(false) }
    }
  }, [])

  const fetchDependencies = useCallback(async (silent = false) => {
    if (!mountedRef.current) return
    if (silent) setDepRefreshing(true)
    else setDepLoading(true)
    setDepError(null)
    try {
      const data = await getDependencyMap()
      if (mountedRef.current) setDepMap(data)
    } catch (e) {
      if (mountedRef.current) setDepError(e instanceof Error ? e.message : "Failed to load dependency map")
    } finally {
      if (mountedRef.current) { setDepLoading(false); setDepRefreshing(false) }
    }
  }, [])

  const fetchOverview = useCallback(async () => {
    if (!mountedRef.current) return
    setOverviewRefreshing(true)
    try {
      const data = await getDashboardOverview()
      if (mountedRef.current) setOverview(data)
    } catch {
      // non-critical, fail silently
    } finally {
      if (mountedRef.current) setOverviewRefreshing(false)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchConnectors(true),
      fetchIncidents(true),
      fetchDependencies(true),
      fetchOverview(),
    ])
    setLastRefreshed(new Date())
  }, [fetchConnectors, fetchIncidents, fetchDependencies, fetchOverview])

  usePolling(refreshAll, { interval: POLL_INTERVAL, immediate: true })

  const activeAlertCount = alerts.filter(a => a.status === "active" || a.status === "firing").length
  const activeIncidentCount = incidents.filter(i => i.status !== "resolved").length
  const connectorIssueCount = connectors.filter(c => c.status === "warning" || c.status === "error").length

  const tabBadge: Partial<Record<OpTab, number>> = {
    incidents: activeIncidentCount + activeAlertCount,
    connectors: connectorIssueCount,
  }

  return (
    <div className="min-h-full flex flex-col">
      <PageHeader
        title="Operations"
        description="Unified real-time view of connectors, incidents, and service dependencies"
        badge={
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
            wsConnected
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-muted-foreground bg-muted border-border"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", wsConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
            {wsConnected ? "Live" : "Offline"}
          </div>
        }
      />

      <div className="px-6 border-b border-border">
        <div className="flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const count = tabBadge[tab.id]
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {count != null && count > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-4 min-w-[1rem] px-1 text-[10px] font-semibold"
                  >
                    {count}
                  </Badge>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="ops-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 py-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <OperationsOverview
                overview={overview}
                connectors={connectors}
                incidents={incidents}
                alerts={alerts}
                wsConnected={wsConnected}
                lastRefreshed={lastRefreshed}
                onRefresh={refreshAll}
                refreshing={overviewRefreshing}
              />
            )}
            {activeTab === "connectors" && (
              <OperationsConnectors
                connectors={connectors}
                loading={connectorsLoading}
                error={connectorsError}
                onRefresh={() => fetchConnectors(true)}
                refreshing={connectorsRefreshing}
              />
            )}
            {activeTab === "incidents" && (
              <OperationsIncidents
                incidents={incidents}
                alerts={alerts}
                loading={incidentsLoading}
                error={incidentsError}
                onRefresh={() => fetchIncidents(true)}
                refreshing={incidentsRefreshing}
                onAcknowledge={async id => {
                  await acknowledgeIncident(id)
                  fetchIncidents(true)
                }}
                onResolve={async id => {
                  await resolveIncident(id)
                  fetchIncidents(true)
                }}
                onAcknowledgeAlert={async id => {
                  await acknowledgeAlert(id)
                  fetchIncidents(true)
                }}
              />
            )}
            {activeTab === "dependencies" && (
              <OperationsDependencies
                depMap={depMap}
                loading={depLoading}
                error={depError}
                onRefresh={() => fetchDependencies(true)}
                refreshing={depRefreshing}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
