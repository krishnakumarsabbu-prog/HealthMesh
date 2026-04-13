import { useState } from "react"
import { motion } from "framer-motion"
import { Search, RefreshCw, GitBranch, ArrowRight, CircleX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DependencyMap, DependencyNode } from "@/lib/api/misc"

interface Props {
  depMap: DependencyMap | null
  loading: boolean
  error: string | null
  onRefresh: () => void
  refreshing: boolean
}

const NODE_TYPE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  service: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  database: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  cache: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  queue: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  external: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  gateway: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
}

const STATUS_DOT: Record<string, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500 animate-pulse",
  degraded: "bg-orange-500",
  unknown: "bg-slate-400",
}

function NodeCard({ node }: { node: DependencyNode }) {
  const typeCfg = NODE_TYPE_CONFIG[node.node_type] ?? NODE_TYPE_CONFIG.service
  const dot = STATUS_DOT[node.status] ?? STATUS_DOT.unknown

  return (
    <div className="border border-border rounded-lg p-3 bg-card hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
          <span className="text-sm font-medium text-foreground truncate">{node.label}</span>
        </div>
        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize shrink-0 ml-2", typeCfg.bg, typeCfg.color, typeCfg.border)}>
          {node.node_type}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">Latency</div>
          <div className="font-medium text-foreground">{node.latency || "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Error Rate</div>
          <div className="font-medium text-foreground">{node.error_rate || "—"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">RPS</div>
          <div className="font-medium text-foreground">{node.rps || "—"}</div>
        </div>
      </div>
      {node.team && (
        <div className="mt-2 text-xs text-muted-foreground">{node.team} · v{node.version || "?"}</div>
      )}
    </div>
  )
}

export function OperationsDependencies({ depMap, loading, error, onRefresh, refreshing }: Props) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  const nodes = depMap?.nodes ?? []
  const edges = depMap?.edges ?? []
  const stats = depMap?.stats

  const nodeTypes = ["All", ...Array.from(new Set(nodes.map(n => n.node_type)))]

  const filteredNodes = nodes.filter(n => {
    if (typeFilter !== "All" && n.node_type !== typeFilter) return false
    if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const statusCounts = {
    healthy: nodes.filter(n => n.status === "healthy").length,
    warning: nodes.filter(n => n.status === "warning").length,
    critical: nodes.filter(n => n.status === "critical" || n.status === "degraded").length,
  }

  return (
    <div className="space-y-4 px-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Services", value: stats.total_services },
            { label: "Connections", value: stats.total_connections },
            { label: "Degraded Paths", value: stats.degraded_paths },
            { label: "Critical Nodes", value: stats.critical_nodes },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-lg px-4 py-3"
            >
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {nodeTypes.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize",
                typeFilter === t
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
              )}
            >
              {t}
            </button>
          ))}
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

      {nodes.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{statusCounts.healthy} healthy</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{statusCounts.warning} warning</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{statusCounts.critical} critical</span>
        </div>
      )}

      {loading && !nodes.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CircleX className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={onRefresh} className="mt-3 text-xs text-primary hover:underline">Try again</button>
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GitBranch className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No services found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting filters</p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {filteredNodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <NodeCard node={node} />
              </motion.div>
            ))}
          </motion.div>

          {edges.length > 0 && !search && typeFilter === "All" && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Service Connections</h3>
                <span className="text-xs text-muted-foreground ml-auto">{edges.length} connections</span>
              </div>
              <div className="divide-y divide-border max-h-60 overflow-y-auto">
                {edges.map(edge => {
                  const source = nodes.find(n => n.id === edge.source_id)
                  const target = nodes.find(n => n.id === edge.target_id)
                  const dot = STATUS_DOT[edge.status] ?? STATUS_DOT.unknown
                  return (
                    <div key={edge.id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
                      <span className="font-medium text-foreground">{source?.label ?? edge.source_id}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground">{target?.label ?? edge.target_id}</span>
                      <span className="text-muted-foreground ml-auto shrink-0">{edge.latency || edge.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
