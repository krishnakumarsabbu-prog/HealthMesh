import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitBranch, Zap, TriangleAlert as AlertTriangle, Server, Database, Globe, RefreshCw, ZoomIn, ZoomOut, Maximize2, X, Filter, Radio, Layers, ChevronRight, Activity, Clock, ArrowRight, Box } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getDependencyMap, type DependencyNode as ApiNode, type DependencyEdge } from "@/lib/api/misc"

type NodeStatus = "healthy" | "warning" | "critical" | "degraded"
type NodeType = "gateway" | "service" | "api" | "ml" | "database" | "cache" | "queue" | "external"

interface ServiceNode {
  id: string
  name: string
  type: NodeType
  status: NodeStatus
  x: number
  y: number
  team: string
  env: string
  latency: number
  errorRate: number
  rps: number
  version: string
  uptime: string
}

interface Connection {
  from: string
  to: string
  healthy: boolean
  latency: number
  rps: number
}

const STATIC_SERVICE_NODES: ServiceNode[] = [
  { id: "gateway", name: "api-gateway", type: "gateway", status: "healthy", x: 60, y: 50, team: "Platform", env: "production", latency: 12, errorRate: 0.02, rps: 4200, version: "v3.2.1", uptime: "99.98%" },
  { id: "auth", name: "auth-service", type: "service", status: "warning", x: 220, y: 110, team: "Identity", env: "production", latency: 38, errorRate: 0.14, rps: 820, version: "v2.1.0", uptime: "99.91%" },
  { id: "payments", name: "payments-api", type: "api", status: "healthy", x: 220, y: 230, team: "Payments", env: "production", latency: 68, errorRate: 0.03, rps: 340, version: "v4.0.2", uptime: "99.99%" },
  { id: "catalog", name: "catalog-service", type: "service", status: "healthy", x: 400, y: 110, team: "Commerce", env: "production", latency: 24, errorRate: 0.05, rps: 1800, version: "v1.8.3", uptime: "99.96%" },
  { id: "search", name: "search-api", type: "api", status: "critical", x: 400, y: 230, team: "Search & Discovery", env: "production", latency: 180, errorRate: 1.24, rps: 920, version: "v2.3.0", uptime: "98.20%" },
  { id: "recommend", name: "recommendation-engine", type: "ml", status: "degraded", x: 580, y: 160, team: "ML Platform", env: "production", latency: 95, errorRate: 0.42, rps: 260, version: "v1.2.1", uptime: "99.72%" },
  { id: "db-primary", name: "db-primary", type: "database", status: "healthy", x: 580, y: 290, team: "Data Platform", env: "production", latency: 4, errorRate: 0.00, rps: 3400, version: "PG 15.2", uptime: "100%" },
  { id: "cache", name: "redis-cluster", type: "cache", status: "healthy", x: 400, y: 350, team: "Data Platform", env: "production", latency: 1, errorRate: 0.00, rps: 12000, version: "7.2.0", uptime: "100%" },
  { id: "kafka", name: "event-bus", type: "queue", status: "healthy", x: 220, y: 350, team: "Platform", env: "production", latency: 6, errorRate: 0.01, rps: 5600, version: "3.5.0", uptime: "99.99%" },
  { id: "external-stripe", name: "stripe-api", type: "external", status: "healthy", x: 60, y: 230, team: "External", env: "external", latency: 120, errorRate: 0.00, rps: 180, version: "API v3", uptime: "99.95%" },
]

const STATIC_CONNECTIONS: Connection[] = [
  { from: "gateway", to: "auth", healthy: false, latency: 38, rps: 820 },
  { from: "gateway", to: "payments", healthy: true, latency: 68, rps: 340 },
  { from: "gateway", to: "catalog", healthy: true, latency: 24, rps: 1800 },
  { from: "gateway", to: "search", healthy: false, latency: 180, rps: 920 },
  { from: "catalog", to: "recommend", healthy: true, latency: 95, rps: 260 },
  { from: "payments", to: "db-primary", healthy: true, latency: 4, rps: 340 },
  { from: "payments", to: "external-stripe", healthy: true, latency: 120, rps: 180 },
  { from: "catalog", to: "cache", healthy: true, latency: 1, rps: 1200 },
  { from: "search", to: "cache", healthy: true, latency: 1, rps: 900 },
  { from: "recommend", to: "db-primary", healthy: true, latency: 4, rps: 260 },
  { from: "catalog", to: "kafka", healthy: true, latency: 6, rps: 400 },
  { from: "search", to: "kafka", healthy: false, latency: 6, rps: 200 },
]

function apiNodeToService(n: ApiNode): ServiceNode {
  const latency = parseFloat(n.latency) || 0
  const errorRate = parseFloat(n.error_rate) || 0
  const rps = parseFloat(n.rps) || 0
  return {
    id: n.id,
    name: n.label,
    type: (n.node_type as NodeType) || "service",
    status: (n.status as NodeStatus) || "healthy",
    x: n.x,
    y: n.y,
    team: n.team || "Unknown",
    env: "production",
    latency,
    errorRate,
    rps,
    version: n.version || "—",
    uptime: n.uptime || "—",
  }
}

function apiEdgeToConnection(e: DependencyEdge): Connection {
  const latency = parseFloat(e.latency) || 0
  return {
    from: e.source_id,
    to: e.target_id,
    healthy: e.status === "healthy",
    latency,
    rps: 0,
  }
}

const TYPE_ICON: Record<NodeType, React.ComponentType<{ className?: string }>> = {
  gateway: Globe,
  service: Server,
  api: Zap,
  ml: GitBranch,
  database: Database,
  cache: Database,
  queue: Radio,
  external: Box,
}

const STATUS_NODE_STYLES: Record<NodeStatus, string> = {
  healthy: "border-emerald-500/50 bg-emerald-500/8 dark:bg-emerald-500/10",
  warning: "border-amber-500/50 bg-amber-500/8 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
  critical: "border-red-500/60 bg-red-500/8 shadow-[0_0_14px_rgba(239,68,68,0.25)]",
  degraded: "border-orange-500/50 bg-orange-500/8 shadow-[0_0_10px_rgba(249,115,22,0.15)]",
}

const STATUS_ICON_COLOR: Record<NodeStatus, string> = {
  healthy: "text-emerald-500",
  warning: "text-amber-500",
  critical: "text-red-500",
  degraded: "text-orange-500",
}

const ENV_FILTERS = ["All", "production", "staging", "development"]
const SEVERITY_FILTERS = ["All", "critical", "degraded", "warning", "healthy"]

function NodeDetailPanel({ node, connections, allNodes, onClose }: { node: ServiceNode; connections: Connection[]; allNodes: ServiceNode[]; onClose: () => void }) {
  const inbound = connections.filter(c => c.to === node.id)
  const outbound = connections.filter(c => c.from === node.id)

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 bottom-0 z-50 w-80 border-l border-border bg-card/95 backdrop-blur-md flex flex-col shadow-elevation-3"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <StatusBadge status={node.status} />
          <span className="font-semibold text-sm font-mono text-foreground">{node.name}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Latency", value: `${node.latency}ms`, icon: Clock },
            { label: "RPS", value: node.rps.toLocaleString(), icon: Activity },
            { label: "Error Rate", value: `${node.errorRate}%`, icon: AlertTriangle },
            { label: "Uptime", value: node.uptime, icon: Zap },
          ].map(m => (
            <div key={m.label} className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <m.icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</span>
              </div>
              <div className={cn("text-sm font-bold",
                m.label === "Error Rate" && parseFloat(m.value) > 0.5 ? "text-red-500" :
                m.label === "Latency" && parseFloat(m.value) > 100 ? "text-amber-500" : "text-foreground"
              )}>{m.value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 text-xs">
          {[
            { label: "Type", value: node.type },
            { label: "Team", value: node.team },
            { label: "Environment", value: node.env },
            { label: "Version", value: node.version },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium text-foreground capitalize">{r.value}</span>
            </div>
          ))}
        </div>

        {inbound.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Inbound ({inbound.length})</div>
            <div className="space-y-1.5">
              {inbound.map(c => {
                const fromNode = allNodes.find(n => n.id === c.from)
                return (
                  <div key={c.from} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/40">
                    <ArrowRight className="w-3 h-3 text-muted-foreground rotate-180 shrink-0" />
                    <span className="font-mono text-foreground truncate">{fromNode?.name}</span>
                    <span className={cn("ml-auto shrink-0", c.healthy ? "text-emerald-500" : "text-red-500")}>{c.latency}ms</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {outbound.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Outbound ({outbound.length})</div>
            <div className="space-y-1.5">
              {outbound.map(c => {
                const toNode = allNodes.find(n => n.id === c.to)
                return (
                  <div key={c.to} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/40">
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-mono text-foreground truncate">{toNode?.name}</span>
                    <span className={cn("ml-auto shrink-0", c.healthy ? "text-emerald-500" : "text-red-500")}>{c.latency}ms</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {node.status === "critical" && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-semibold text-red-500">Blast Radius</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This node's degradation is propagating upstream. {inbound.filter(c => !c.healthy).length} connections affected.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 text-xs">View App 360</Button>
        <Button size="sm" className="flex-1 text-xs">Investigate</Button>
      </div>
    </motion.div>
  )
}

export function DependencyMap() {
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const [blastMode, setBlastMode] = useState(false)
  const [envFilter, setEnvFilter] = useState("All")
  const [severityFilter, setSeverityFilter] = useState("All")
  const [focusNode, setFocusNode] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const { data: mapData, refetch } = useApi(getDependencyMap, [])

  const serviceNodes: ServiceNode[] = mapData && mapData.nodes.length > 0
    ? mapData.nodes.map(apiNodeToService)
    : STATIC_SERVICE_NODES

  const connections: Connection[] = mapData && mapData.edges.length > 0
    ? mapData.edges.map(apiEdgeToConnection)
    : STATIC_CONNECTIONS

  const stats = mapData?.stats

  const filteredNodes = serviceNodes.filter(n => {
    if (envFilter !== "All" && n.env !== envFilter) return false
    if (severityFilter !== "All" && n.status !== severityFilter) return false
    if (focusNode) {
      const connectedIds = connections.filter(c => c.from === focusNode || c.to === focusNode)
        .flatMap(c => [c.from, c.to])
      return connectedIds.includes(n.id)
    }
    return true
  })

  const filteredConnections = connections.filter(c =>
    filteredNodes.find(n => n.id === c.from) && filteredNodes.find(n => n.id === c.to)
  )

  const blastAffected = blastMode
    ? new Set(connections.filter(c => !c.healthy).flatMap(c => [c.from, c.to]))
    : null

  const handleNodeClick = (node: ServiceNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }

  const criticalNodes = serviceNodes.filter(n => n.status === "critical").length
  const degradedPaths = connections.filter(c => !c.healthy).length

  return (
    <div className="min-h-full">
      <PageHeader
        title="Dependency Map"
        description="Real-time visualization of service topology, request flows, and dependency health across your stack"
        actions={
          <div className="flex gap-2">
            <Button
              variant={blastMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setBlastMode(b => !b)}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Blast Radius
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={refetch}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        }
      />

      <div className="px-6 pb-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-semibold">ENV:</span>
            {ENV_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setEnvFilter(f)}
                className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                  envFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-semibold">SEVERITY:</span>
            {SEVERITY_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize",
                  severityFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {focusNode && (
            <button
              onClick={() => setFocusNode(null)}
              className="flex items-center gap-1 ml-auto text-xs text-primary hover:underline"
            >
              <X className="w-3 h-3" /> Clear focus
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground premium-card px-4 py-3 flex-wrap">
          <span className="font-semibold text-foreground">Legend:</span>
          {(["healthy", "warning", "critical", "degraded"] as NodeStatus[]).map(s => (
            <span key={s} className="flex items-center gap-1.5 capitalize">
              <span className={cn("w-2.5 h-2.5 rounded-full",
                s === "healthy" ? "bg-emerald-500" :
                s === "warning" ? "bg-amber-500" :
                s === "critical" ? "bg-red-500 animate-pulse" : "bg-orange-500"
              )} />
              {s}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-emerald-500/60 border-dashed" /> Healthy flow</span>
            <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-red-500/60 border-dashed" /> Degraded flow</span>
            {blastMode && <span className="flex items-center gap-1.5 text-orange-500 font-semibold"><AlertTriangle className="w-3 h-3" /> Blast radius active</span>}
          </span>
        </div>

        <div className="relative">
          <motion.div
            ref={mapRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="premium-card overflow-hidden relative"
            style={{ height: 480 }}
          >
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <button
                onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="absolute bottom-3 left-3 z-10 w-28 h-20 rounded-lg border border-border bg-card/80 backdrop-blur-sm overflow-hidden">
              <div className="text-[9px] text-muted-foreground px-2 pt-1 font-semibold uppercase tracking-wider">Overview</div>
              <svg className="absolute inset-0 w-full h-full" style={{ top: 12 }}>
                {serviceNodes.map(n => (
                  <circle
                    key={n.id}
                    cx={(n.x / 720) * 112}
                    cy={((n.y / 460) * 65) + 8}
                    r={3}
                    fill={n.status === "healthy" ? "#10b981" : n.status === "warning" ? "#f59e0b" : n.status === "critical" ? "#ef4444" : "#f97316"}
                    opacity={filteredNodes.find(fn => fn.id === n.id) ? 1 : 0.2}
                  />
                ))}
              </svg>
            </div>

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0, transformOrigin: "center", transform: `scale(${zoom})` }}
            >
              {filteredConnections.map((conn, i) => {
                const from = filteredNodes.find(n => n.id === conn.from)
                const to = filteredNodes.find(n => n.id === conn.to)
                if (!from || !to) return null
                const isBlastAffected = blastMode && blastAffected?.has(conn.from) && blastAffected?.has(conn.to)
                return (
                  <g key={i}>
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: isBlastAffected ? 1 : 0.8 }}
                      transition={{ delay: 0.3 + i * 0.04, duration: 0.5 }}
                      x1={from.x + 60}
                      y1={from.y + 28}
                      x2={to.x + 60}
                      y2={to.y + 28}
                      stroke={
                        isBlastAffected ? "rgba(249,115,22,0.7)" :
                        conn.healthy ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.55)"
                      }
                      strokeWidth={isBlastAffected ? 2.5 : 1.5}
                      strokeDasharray="6,4"
                    />
                    <text
                      x={(from.x + to.x) / 2 + 60}
                      y={(from.y + to.y) / 2 + 24}
                      fontSize="8"
                      fill="hsl(var(--muted-foreground))"
                      textAnchor="middle"
                      opacity={0.7}
                    >
                      {conn.latency}ms
                    </text>
                  </g>
                )
              })}
            </svg>

            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", position: "absolute", inset: 0 }}>
              {filteredNodes.map((node, i) => {
                const Icon = TYPE_ICON[node.type] || Server
                const isSelected = selectedNode?.id === node.id
                const isFocused = focusNode === node.id
                const isBlastHighlighted = blastMode && blastAffected?.has(node.id)
                const isBlastUnaffected = blastMode && !blastAffected?.has(node.id)
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isBlastUnaffected ? 0.3 : 1,
                      scale: isSelected ? 1.08 : 1
                    }}
                    transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 280 }}
                    whileHover={{ scale: 1.06, zIndex: 10 }}
                    onClick={() => handleNodeClick(node)}
                    onDoubleClick={() => setFocusNode(focusNode === node.id ? null : node.id)}
                    className={cn(
                      "absolute cursor-pointer border-2 rounded-xl px-3 py-2.5 w-34 transition-all duration-150 select-none",
                      STATUS_NODE_STYLES[node.status],
                      isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      isFocused && "ring-2 ring-amber-500 ring-offset-1 ring-offset-background",
                      isBlastHighlighted && "ring-2 ring-orange-500 ring-offset-1 ring-offset-background"
                    )}
                    style={{ left: node.x, top: node.y, width: 128, zIndex: isSelected ? 20 : 1 }}
                    title="Click to inspect · Double-click to focus"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn("w-3.5 h-3.5", STATUS_ICON_COLOR[node.status])} />
                      <div className={cn("w-1.5 h-1.5 rounded-full ml-auto shrink-0",
                        node.status === "critical" ? "bg-red-500 animate-pulse" :
                        node.status === "warning" ? "bg-amber-500" :
                        node.status === "healthy" ? "bg-emerald-500" : "bg-orange-500"
                      )} />
                    </div>
                    <div className="text-[11px] font-semibold font-mono text-foreground truncate">{node.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground capitalize">{node.type}</span>
                      <span className="text-[9px] text-muted-foreground">{node.latency}ms</span>
                    </div>
                    {node.status !== "healthy" && (
                      <div className="mt-1 text-[9px] font-semibold text-red-500 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {node.errorRate}% err
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <AnimatePresence>
            {selectedNode && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setSelectedNode(null)}
                />
                <NodeDetailPanel
                  node={selectedNode}
                  connections={connections}
                  allNodes={serviceNodes}
                  onClose={() => setSelectedNode(null)}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Services", value: stats ? String(stats.total_services) : String(serviceNodes.length) },
            { label: "Active Connections", value: stats ? String(stats.total_connections) : String(connections.length) },
            { label: "Degraded Paths", value: stats ? String(stats.degraded_paths) : String(degradedPaths), warn: (stats?.degraded_paths ?? degradedPaths) > 0 },
            { label: "Critical Nodes", value: stats ? String(stats.critical_nodes) : String(criticalNodes), warn: (stats?.critical_nodes ?? criticalNodes) > 0 },
            { label: "Avg Hop Latency", value: `${Math.round(connections.reduce((a, c) => a + c.latency, 0) / Math.max(connections.length, 1))}ms` },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.04 }}
              className="premium-card px-4 py-3"
            >
              <div className={cn("text-lg font-bold", s.warn ? "text-red-500" : "text-foreground")}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Service Registry</span>
            <span className="text-xs text-muted-foreground">{filteredNodes.length} services</span>
          </div>
          <div className="divide-y divide-border">
            {filteredNodes.map(node => {
              const Icon = TYPE_ICON[node.type] || Server
              return (
                <div
                  key={node.id}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 cursor-pointer transition-colors group"
                  onClick={() => handleNodeClick(node)}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", STATUS_ICON_COLOR[node.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-semibold text-foreground truncate">{node.name}</div>
                    <div className="text-xs text-muted-foreground">{node.team} · {node.version}</div>
                  </div>
                  <StatusBadge status={node.status} />
                  <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-center">
                    <div>
                      <div className="font-semibold text-foreground">{node.latency}ms</div>
                      <div className="text-muted-foreground">latency</div>
                    </div>
                    <div>
                      <div className={cn("font-semibold", node.errorRate > 0.5 ? "text-red-500" : "text-foreground")}>{node.errorRate}%</div>
                      <div className="text-muted-foreground">errors</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{node.rps.toLocaleString()}</div>
                      <div className="text-muted-foreground">rps</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
