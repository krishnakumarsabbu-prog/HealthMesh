import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plug, Plus, Trash2, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Circle as XCircle, RefreshCw, Activity, Database, Server, Shield, Layers, Eye, Loader as Loader2, CircleAlert as AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import {
  getAppConnectors,
  assignConnectorToApp,
  removeConnectorFromApp,
  runHealthCheck,
  getHealthResults,
  type AppConnectorAssignment,
  type ConnectorPollResult,
  type AppHealthCheckResult,
} from "@/lib/api/apps"
import { api } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface ConnectorInstance {
  id: string
  name: string
  category: string
  environment: string
  status: string
  health_pct: number
  version: string
  last_sync: string
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  APM: <Activity className="w-4 h-4" />,
  Infra: <Server className="w-4 h-4" />,
  Logs: <Database className="w-4 h-4" />,
  Cloud: <Layers className="w-4 h-4" />,
  Incident: <AlertTriangle className="w-4 h-4" />,
  Security: <Shield className="w-4 h-4" />,
  Synthetic: <Eye className="w-4 h-4" />,
}

function getStatusIcon(status: string) {
  if (status === "healthy") return <CheckCircle className="w-4 h-4 text-emerald-500" />
  if (status === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />
  return <XCircle className="w-4 h-4 text-red-500" />
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "bg-emerald-500" : score >= 65 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <span className={cn("text-xs font-mono font-bold w-8 text-right",
        score >= 85 ? "text-emerald-500" : score >= 65 ? "text-amber-500" : "text-red-500"
      )}>{score}</span>
    </div>
  )
}

export function TabConnectors({ appId }: { appId: string }) {
  const [removing, setRemoving] = useState<string | null>(null)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [healthResult, setHealthResult] = useState<AppHealthCheckResult | null>(null)
  const [runningCheck, setRunningCheck] = useState(false)

  const { data: assignments = [], loading: connectorsLoading, error: connectorsError, refetch: refreshAssignments } = useApi(() => getAppConnectors(appId), [appId]) as {
    data: AppConnectorAssignment[]
    loading: boolean
    error: string | null
    refetch: () => void
  }

  const { data: allInstances = [] } = useApi(() => api.get<ConnectorInstance[]>("/api/connectors/instances"), []) as {
    data: ConnectorInstance[]
  }

  const { data: latestResults = [] } = useApi(() => getHealthResults(appId), [appId]) as {
    data: ConnectorPollResult[]
  }

  const assignedIds = new Set(assignments.map(a => a.connector_instance_id))
  const availableToAdd = allInstances.filter(inst => !assignedIds.has(inst.id))

  async function handleRemove(connectorInstanceId: string) {
    setRemoving(connectorInstanceId)
    try {
      await removeConnectorFromApp(appId, connectorInstanceId)
      refreshAssignments()
    } finally {
      setRemoving(null)
    }
  }

  async function handleAssign(connectorInstanceId: string) {
    setAssigning(connectorInstanceId)
    try {
      await assignConnectorToApp(appId, { connector_instance_id: connectorInstanceId })
      refreshAssignments()
      setShowAddPanel(false)
    } finally {
      setAssigning(null)
    }
  }

  async function handleRunCheck() {
    setRunningCheck(true)
    try {
      const result = await runHealthCheck(appId)
      setHealthResult(result)
      refreshAssignments()
    } finally {
      setRunningCheck(false)
    }
  }

  const resultByConnector = new Map(latestResults.map(r => [r.connector_instance_id, r]))

  if (connectorsLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading connectors...</span>
      </div>
    )
  }

  if (connectorsError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">Failed to load connectors</p>
          <p className="text-xs text-muted-foreground mt-1">{connectorsError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Assigned Connectors</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{assignments.length} connector{assignments.length !== 1 ? "s" : ""} configured for health polling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleRunCheck} disabled={runningCheck || assignments.length === 0}>
            <RefreshCw className={cn("w-3.5 h-3.5", runningCheck && "animate-spin")} />
            {runningCheck ? "Checking..." : "Check Health Now"}
          </Button>
          <Button size="sm" className="gap-2 text-xs" onClick={() => setShowAddPanel(v => !v)}>
            <Plus className="w-3.5 h-3.5" />
            Add Connector
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {healthResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="premium-card p-4 border-l-4 border-l-primary"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Health Check Complete</span>
                <span className="text-xs text-muted-foreground">{new Date(healthResult.checked_at).toLocaleTimeString()}</span>
              </div>
              {healthResult.composite_health_score !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Composite Score</span>
                  <span className={cn("text-lg font-bold",
                    healthResult.composite_health_score >= 85 ? "text-emerald-500" :
                    healthResult.composite_health_score >= 65 ? "text-amber-500" : "text-red-500"
                  )}>{healthResult.composite_health_score}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {healthResult.connector_results.map((r) => (
                <div key={r.connector_instance_id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(r.status)}
                      <span className="text-xs font-semibold text-foreground">{r.connector_name}</span>
                    </div>
                    <span className={cn("text-sm font-bold",
                      r.health_score >= 85 ? "text-emerald-500" : r.health_score >= 65 ? "text-amber-500" : "text-red-500"
                    )}>{r.health_score}</span>
                  </div>
                  <ScoreBar score={r.health_score} />
                  <div className="mt-2 space-y-0.5">
                    {Object.entries(r.metrics).slice(0, 3).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground font-mono">{k.replace(/_/g, " ")}</span>
                        <span className="font-mono text-foreground">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="premium-card overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-border/60">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Connectors</div>
            </div>
            {availableToAdd.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">All available connectors are already assigned.</div>
            ) : (
              <div className="divide-y divide-border/40">
                {availableToAdd.map((inst) => (
                  <div key={inst.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground")}>
                      {CATEGORY_ICONS[inst.category] ?? <Plug className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{inst.name}</div>
                      <div className="text-xs text-muted-foreground">{inst.category} · {inst.environment}</div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{inst.version}</Badge>
                    {getStatusIcon(inst.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5"
                      disabled={assigning === inst.id}
                      onClick={() => handleAssign(inst.id)}
                    >
                      <Plus className="w-3 h-3" />
                      {assigning === inst.id ? "Assigning..." : "Assign"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {assignments.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Plug className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No connectors assigned</h3>
          <p className="text-xs text-muted-foreground mb-4">Add connectors to enable real-time health polling for this application.</p>
          <Button size="sm" className="gap-2 text-xs" onClick={() => setShowAddPanel(true)}>
            <Plus className="w-3.5 h-3.5" /> Add First Connector
          </Button>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connector Health Status</div>
          </div>
          <div className="divide-y divide-border/40">
            {assignments.map((asgn) => {
              const latest = resultByConnector.get(asgn.connector_instance_id)
              return (
                <motion.div
                  key={asgn.assignment_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
                    {CATEGORY_ICONS[asgn.connector_category] ?? <Plug className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{asgn.connector_name}</span>
                      <Badge variant="secondary" className="text-[10px]">{asgn.connector_category}</Badge>
                      <StatusBadge status={(["healthy","warning","critical","degraded","unknown"].includes(asgn.status) ? asgn.status : "unknown") as "healthy" | "warning" | "critical" | "degraded" | "unknown"} size="sm" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {asgn.environment} · Poll every {asgn.poll_interval_seconds}s
                      {asgn.assigned_by && ` · Assigned by ${asgn.assigned_by}`}
                    </div>
                  </div>
                  {latest ? (
                    <div className="w-40 shrink-0">
                      <ScoreBar score={latest.health_score} />
                      <div className="text-[10px] text-muted-foreground text-right mt-0.5">
                        {new Date(latest.polled_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 shrink-0 text-xs text-muted-foreground text-center">
                      No data yet — run health check
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5 shrink-0"
                    disabled={removing === asgn.connector_instance_id}
                    onClick={() => handleRemove(asgn.connector_instance_id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {removing === asgn.connector_instance_id ? "Removing..." : "Remove"}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {latestResults.length > 0 && !healthResult && (
        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latest Poll Results</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/40">
            {latestResults.map((r) => (
              <div key={r.connector_instance_id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(r.status)}
                    <span className="text-xs font-semibold text-foreground">{r.connector_name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.polled_at).toLocaleTimeString()}</span>
                </div>
                <ScoreBar score={r.health_score} />
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {Object.entries(r.metrics).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground font-mono truncate">{k.replace(/_/g, " ")}</span>
                      <span className="font-mono text-foreground ml-2 shrink-0">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
