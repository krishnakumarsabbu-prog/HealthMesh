import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw, CreditCard as Edit } from "lucide-react"
import { useApi } from "@/hooks/useApi"
import { getAppConfiguration } from "@/lib/api/apps"

export function TabConfiguration({ appId }: { appId: string }) {
  const { data: config } = useApi(() => getAppConfiguration(appId), [appId])

  const metadata = [
    { label: "Name", value: config?.name ?? appId },
    { label: "Team", value: config?.owner_name ?? "—" },
    { label: "Environment", value: config?.environment ?? "Production" },
    { label: "Type", value: "REST API" },
    { label: "Runtime", value: config?.runtime ?? "Kubernetes" },
    { label: "Language", value: config?.runtime ?? "—" },
    { label: "Version", value: config?.version ?? "—" },
    { label: "Criticality", value: config?.criticality ?? "—" },
  ]

  const connectors = config?.connectors ?? [
    { id: "1", name: "Datadog APM", category: "APM", status: "active" },
    { id: "2", name: "Prometheus", category: "Metrics", status: "active" },
    { id: "3", name: "CloudWatch", category: "Infra", status: "active" },
    { id: "4", name: "PagerDuty", category: "Incidents", status: "active" },
  ]

  const weights = config?.health_weights ?? {
    latency: 30,
    errors: 25,
    availability: 25,
    infra: 10,
    incidents: 10,
  }

  const thresholds = config?.thresholds ?? {
    latency_warn: 300,
    latency_crit: 500,
    error_rate_warn: 0.5,
    error_rate_crit: 1.0,
  }

  return (
    <div className="space-y-4">
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Metadata</div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Edit className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metadata.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{f.label}</div>
              <div className="text-sm font-semibold font-mono text-foreground">{f.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linked Connectors</div>
            <Button variant="ghost" size="icon-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="divide-y divide-border/40">
            {connectors.map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">Status: {c.status}</div>
                </div>
                <Badge variant="secondary" size="sm">{c.category}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Score Weights</div>
          </div>
          <div className="divide-y divide-border/40">
            {Object.entries(weights).map(([key, weight], i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-semibold text-foreground capitalize">{key.replace("_", " ")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(weight as number)}%` }} />
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground w-8 text-right">{weight as number}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alerting Thresholds</div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Settings className="w-3.5 h-3.5" /> Configure
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Latency Warn", value: `${thresholds.latency_warn}ms` },
            { label: "Latency Critical", value: `${thresholds.latency_crit}ms` },
            { label: "Error Rate Warn", value: `${thresholds.error_rate_warn}%` },
            { label: "Error Rate Critical", value: `${thresholds.error_rate_crit}%` },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
              <div className="text-sm font-semibold font-mono text-foreground">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
