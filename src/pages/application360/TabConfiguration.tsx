import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, RefreshCw, CreditCard as Edit, Loader as Loader2, CircleAlert as AlertCircle } from "lucide-react"
import { useApi } from "@/hooks/useApi"
import { getAppConfiguration } from "@/lib/api/apps"
import { mapAppConfiguration } from "@/lib/mappers"
import { cn } from "@/lib/utils"

export function TabConfiguration({ appId }: { appId: string }) {
  const { data: rawConfig, loading, error } = useApi(() => getAppConfiguration(appId), [appId])
  const config = rawConfig ? mapAppConfiguration(rawConfig) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading configuration...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">Failed to load configuration</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const metadata = [
    { label: "Name", value: config?.name ?? appId },
    { label: "Team", value: config?.ownerName ?? "—" },
    { label: "Environment", value: config?.environment ?? "Production" },
    { label: "Type", value: "REST API" },
    { label: "Runtime", value: config?.runtime ?? "Kubernetes" },
    { label: "Language", value: config?.runtime ?? "—" },
    { label: "Version", value: config?.version ?? "—" },
    { label: "Criticality", value: config?.criticality ?? "—" },
  ]

  const connectors = config?.connectors ?? []

  const weights = config?.healthWeights ?? {
    latency: 30,
    errors: 25,
    availability: 25,
    infra: 10,
    incidents: 10,
  }

  const thresholds = config?.thresholds ?? {
    latencyWarn: 300,
    latencyCrit: 500,
    errorRateWarn: 0.5,
    errorRateCrit: 1.0,
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
        {config?.tags && config.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/40">
            {config.tags.map(tag => (
              <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linked Connectors</div>
            <Button variant="ghost" size="icon-sm">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
          {connectors.length === 0 ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground px-5">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">No connectors linked to this application.</span>
            </div>
          ) : null}
          <div className="divide-y divide-border/40">
            {connectors.map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 bg-muted">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                      c.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <span className="text-[10px] text-muted-foreground capitalize">{c.status}</span>
                  </div>
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
                  <div className="text-xs font-mono font-semibold text-foreground capitalize">{key.replace(/_/g, " ")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${weight as number}%` }} />
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
            { label: "Latency Warn", value: `${thresholds.latencyWarn}ms` },
            { label: "Latency Critical", value: `${thresholds.latencyCrit}ms` },
            { label: "Error Rate Warn", value: `${thresholds.errorRateWarn}%` },
            { label: "Error Rate Critical", value: `${thresholds.errorRateCrit}%` },
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
