import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw, CreditCard as Edit } from "lucide-react"

const CONNECTORS = [
  { name: "Datadog APM", type: "APM", status: "active", lastSync: "30s ago" },
  { name: "Prometheus", type: "Metrics", status: "active", lastSync: "15s ago" },
  { name: "CloudWatch", type: "Infra", status: "active", lastSync: "1m ago" },
  { name: "PagerDuty", type: "Incidents", status: "active", lastSync: "2m ago" },
]

const BOUND_METRICS = [
  { metric: "latency.p99", source: "Datadog", interval: "15s", weight: 30 },
  { metric: "http.error_rate", source: "Datadog", interval: "15s", weight: 25 },
  { metric: "availability.rate", source: "Prometheus", interval: "30s", weight: 25 },
  { metric: "system.memory.used_percent", source: "Prometheus", interval: "30s", weight: 10 },
  { metric: "db.connection_pool.used", source: "CloudWatch", interval: "60s", weight: 10 },
]

export function TabConfiguration() {
  return (
    <div className="space-y-4">
      {/* App metadata */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Metadata</div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Edit className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Name", value: "payments-api" },
            { label: "Team", value: "Payments" },
            { label: "Environment", value: "Production" },
            { label: "Type", value: "REST API" },
            { label: "Runtime", value: "Kubernetes" },
            { label: "Language", value: "Node.js 20" },
            { label: "Version", value: "v2.14.1" },
            { label: "Criticality", value: "P0" },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{f.label}</div>
              <div className="text-sm font-semibold font-mono text-foreground">{f.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Connected connectors */}
        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linked Connectors</div>
            <Button variant="ghost" size="icon-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="divide-y divide-border/40">
            {CONNECTORS.map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">Last sync: {c.lastSync}</div>
                </div>
                <Badge variant="secondary" size="sm">{c.type}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Bound metrics */}
        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bound Metrics</div>
          </div>
          <div className="divide-y divide-border/40">
            {BOUND_METRICS.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-semibold text-foreground truncate">{m.metric}</div>
                  <div className="text-[10px] text-muted-foreground">{m.source} · every {m.interval}</div>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground shrink-0">w:{m.weight}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thresholds & settings */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alerting Settings</div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Settings className="w-3.5 h-3.5" /> Configure
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Refresh Interval", value: "15s" },
            { label: "Alert Cooldown", value: "5 min" },
            { label: "Score Weight Mode", value: "Custom" },
            { label: "Data Retention", value: "90 days" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-sm font-semibold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
