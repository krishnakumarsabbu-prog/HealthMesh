import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, Loader as Loader2, CircleAlert as AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getAppDependencies } from "@/lib/api/apps"
import { mapAppDependency } from "@/lib/mappers"

type DepEntry = { name: string; direction: string; latency: number; status: "healthy" | "warning" | "critical"; rpm: number; errorPct: number }

export function TabDependencies({ appId }: { appId: string }) {
  const { data: apiDeps, loading, error } = useApi(() => getAppDependencies(appId), [appId])

  const dependencies: DepEntry[] = apiDeps
    ? apiDeps.map(d => {
        const m = mapAppDependency(d)
        return {
          name: m.name,
          direction: m.direction,
          latency: m.latencyMs,
          status: (m.status === "healthy" ? "healthy" : m.status === "warning" ? "warning" : "critical") as DepEntry["status"],
          rpm: m.rpm,
          errorPct: m.errorRate,
        }
      })
    : []

  const upstream = dependencies.filter(d => d.direction === "upstream")
  const downstream = dependencies.filter(d => d.direction === "downstream")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading dependencies...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">Failed to load dependencies</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="premium-card p-5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Dependency Topology</div>
        {dependencies.length === 0 ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">No dependencies found for this application.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {upstream.length > 0 && (
              <div className="flex gap-3 flex-wrap justify-center">
                {upstream.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={cn("px-3 py-2 rounded-lg border-2 text-xs font-mono font-semibold text-center",
                      d.status === "healthy" ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600" :
                      d.status === "warning" ? "border-amber-500/40 bg-amber-500/5 text-amber-600" : "border-red-500/40 bg-red-500/5 text-red-600"
                    )}>
                      {d.name}
                    </div>
                    <div className="text-[9px] text-muted-foreground">upstream</div>
                  </div>
                ))}
              </div>
            )}

            {upstream.length > 0 && (
              <div className="flex flex-col items-center gap-0.5">
                <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="w-0.5 h-4 bg-border/60" />
              </div>
            )}

            <div className="px-5 py-2.5 rounded-xl border-2 border-primary bg-primary/8 text-sm font-bold font-mono text-foreground text-center">
              {appId}
            </div>

            {downstream.length > 0 && (
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-0.5 h-4 bg-border/60" />
                <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}

            {downstream.length > 0 && (
              <div className="flex gap-3 flex-wrap justify-center">
                {downstream.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={cn("px-3 py-2 rounded-lg border-2 text-xs font-mono font-semibold text-center",
                      d.status === "healthy" ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600" :
                      d.status === "warning" ? "border-amber-500/40 bg-amber-500/5 text-amber-600" : "border-red-500/40 bg-red-500/5 text-red-600"
                    )}>
                      {d.name}
                    </div>
                    <div className="text-[9px] text-muted-foreground">downstream</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {dependencies.length > 0 && (
        <div className="premium-card overflow-hidden">
          <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span></span>
            <span>Service</span>
            <span>Direction</span>
            <span>Latency</span>
            <span>RPM</span>
            <span>Errors</span>
          </div>
          <div className="divide-y divide-border/40">
            {dependencies.map((dep, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <div className={cn("w-2 h-2 rounded-full shrink-0",
                  dep.status === "healthy" ? "bg-emerald-500" : dep.status === "warning" ? "bg-amber-500" : "bg-red-500"
                )} />
                <div className="text-xs font-mono font-semibold text-foreground">{dep.name}</div>
                <div className="flex items-center gap-1">
                  {dep.direction === "upstream"
                    ? <ArrowUp className="w-3 h-3 text-blue-500" />
                    : <ArrowDown className="w-3 h-3 text-muted-foreground" />
                  }
                  <span className="text-xs text-muted-foreground capitalize">{dep.direction}</span>
                </div>
                <div className={cn("text-xs font-mono font-semibold",
                  dep.latency < 50 ? "text-emerald-500" : dep.latency < 150 ? "text-amber-500" : "text-red-500"
                )}>{dep.latency}ms</div>
                <div className="text-xs font-mono text-foreground">{dep.rpm.toLocaleString()}</div>
                <div className={cn("text-xs font-mono font-semibold",
                  dep.errorPct < 0.1 ? "text-emerald-500" : dep.errorPct < 1 ? "text-amber-500" : "text-red-500"
                )}>{dep.errorPct.toFixed(2)}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
