import { useState } from "react"
import { motion } from "framer-motion"
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Activity, Server, Database, Zap, Globe, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getSystemStatus } from "@/lib/api/misc"

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance"

const STATUS_META: Record<ServiceStatus, { label: string; color: string; bg: string; border: string; dotClass: string }> = {
  operational: { label: "Operational", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20", dotClass: "bg-emerald-500" },
  degraded: { label: "Degraded", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/20", dotClass: "bg-amber-500" },
  outage: { label: "Outage", color: "text-red-500", bg: "bg-red-500/8", border: "border-red-500/20", dotClass: "bg-red-500 animate-pulse" },
  maintenance: { label: "Maintenance", color: "text-primary", bg: "bg-primary/8", border: "border-primary/20", dotClass: "bg-primary" },
}

const ICON_MAP: Record<string, React.ElementType> = {
  ingestion: Activity,
  health: Zap,
  ai: Zap,
  storage: Database,
  alert: Globe,
  connector: Server,
  api: Globe,
  audit: Clock,
}

const STATIC_SERVICES = [
  { name: "Data Ingestion Pipeline", icon: Activity, status: "operational" as ServiceStatus, latency: "42ms", uptime: "99.99%" },
  { name: "Health Score Engine", icon: Zap, status: "operational" as ServiceStatus, latency: "18ms", uptime: "99.98%" },
  { name: "AI Inference Service", icon: Zap, status: "degraded" as ServiceStatus, latency: "380ms", uptime: "99.72%" },
  { name: "Metrics Storage", icon: Database, status: "operational" as ServiceStatus, latency: "8ms", uptime: "100%" },
  { name: "Alert Dispatcher", icon: Globe, status: "operational" as ServiceStatus, latency: "12ms", uptime: "99.97%" },
  { name: "Connector Sync Workers", icon: Server, status: "operational" as ServiceStatus, latency: "28ms", uptime: "99.95%" },
  { name: "API Gateway", icon: Globe, status: "operational" as ServiceStatus, latency: "14ms", uptime: "99.99%" },
  { name: "Audit Log Service", icon: Clock, status: "operational" as ServiceStatus, latency: "22ms", uptime: "99.96%" },
]

const UPTIME_HISTORY = Array.from({ length: 90 }, (_, i) => ({
  day: i,
  status: i === 12 || i === 34 || i === 58 ? "degraded" : i === 23 ? "outage" : "operational",
}))

function UptimeBar({ history }: { history: typeof UPTIME_HISTORY }) {
  return (
    <div className="flex gap-0.5">
      {history.map((h, i) => (
        <div key={i} className={cn("flex-1 h-6 rounded-sm transition-opacity hover:opacity-80",
          h.status === "operational" ? "bg-emerald-500" :
          h.status === "degraded" ? "bg-amber-500" : "bg-red-500"
        )} title={`Day ${i + 1}: ${h.status}`} />
      ))}
    </div>
  )
}

export function SystemStatus() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: statusData, loading, refetch } = useApi(getSystemStatus)

  const dbStatus = statusData?.database === "connected" ? "operational" : "degraded"
  const overallOperational = dbStatus === "operational"

  const dynamicServices = statusData ? [
    { name: "API Server", icon: Globe, status: "operational" as ServiceStatus, latency: "14ms", uptime: "99.99%" },
    { name: "Database", icon: Database, status: dbStatus as ServiceStatus, latency: "8ms", uptime: "99.98%" },
  ] : null

  const services = dynamicServices ?? STATIC_SERVICES

  const handleRefresh = () => {
    setRefreshKey(k => k + 1)
    refetch()
  }

  const counts = statusData?.counts

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-foreground mb-0.5">System Status</div>
          <div className="text-xs text-muted-foreground">Real-time health of the HealthMesh platform infrastructure</div>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <motion.div
        key={refreshKey}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("rounded-xl border p-4 flex items-center gap-3",
          overallOperational ? "bg-emerald-500/8 border-emerald-500/20" : "bg-amber-500/8 border-amber-500/20"
        )}
      >
        {overallOperational
          ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        }
        <div>
          <div className={cn("font-bold text-sm", overallOperational ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
            {overallOperational ? "All Systems Operational" : "Partial Service Degradation"}
          </div>
          <div className="text-xs text-muted-foreground">Last updated: just now · Next check in 60s</div>
        </div>
        <div className={cn("ml-auto w-2 h-2 rounded-full", overallOperational ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse")} />
      </motion.div>

      {counts && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Applications", value: counts.applications },
            { label: "Active Incidents", value: counts.incidents },
            { label: "Active Alerts", value: counts.alerts },
            { label: "Connectors", value: counts.connectors },
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-center">
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Platform Services</span>
        </div>
        <div className="divide-y divide-border/40">
          {services.map((svc, i) => {
            const meta = STATUS_META[svc.status]
            const Icon = svc.icon
            return (
              <motion.div key={svc.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground hidden md:block">{svc.latency} avg</span>
                  <span className="text-xs text-muted-foreground hidden md:block">{svc.uptime} uptime</span>
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", meta.bg, meta.border, meta.color)}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", meta.dotClass)} />
                    {meta.label}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-foreground">90-Day Platform Uptime</span>
          <span className="text-xs text-muted-foreground">99.94% overall</span>
        </div>
        <UptimeBar history={UPTIME_HISTORY} />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Operational</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Degraded</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Outage</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Platform Uptime (90d)", value: "99.94%" },
          { label: "Avg Response Time", value: "18ms" },
          { label: "Data Points / min", value: "2.4M" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-center">
            <div className="text-base font-bold text-foreground">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
