import { motion } from "framer-motion"
import { Zap, Activity, Database, Monitor, Wifi, Shield, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, RefreshCw, Link, Cpu, ChartBar as BarChart3, Loader as Loader2, CircleAlert as AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getAppSignals, type AppSignal } from "@/lib/api/apps"

const ICON_MAP: Record<string, React.ReactNode> = {
  "zap": <Zap className="w-3.5 h-3.5" />,
  "activity": <Activity className="w-3.5 h-3.5" />,
  "bar-chart": <BarChart3 className="w-3.5 h-3.5" />,
  "cpu": <Cpu className="w-3.5 h-3.5" />,
  "memory-stick": <Database className="w-3.5 h-3.5" />,
  "refresh-cw": <RefreshCw className="w-3.5 h-3.5" />,
  "monitor": <Monitor className="w-3.5 h-3.5" />,
  "wifi": <Wifi className="w-3.5 h-3.5" />,
  "database": <Database className="w-3.5 h-3.5" />,
  "link": <Link className="w-3.5 h-3.5" />,
  "shield": <Shield className="w-3.5 h-3.5" />,
  "check-circle": <CheckCircle className="w-3.5 h-3.5" />,
}

type SignalEntry = {
  source: string
  metric: string
  value: string
  threshold: string
  status: "pass" | "warn" | "fail"
  delta: string
  icon: string
}

function apiSignalToEntry(s: AppSignal): SignalEntry {
  return {
    source: s.category,
    metric: s.name,
    value: `${s.value}${s.unit ? ` ${s.unit}` : ""}`,
    threshold: "—",
    status: s.status === "healthy" ? "pass" : s.status === "warning" ? "warn" : "fail",
    delta: s.delta || "0",
    icon: "activity",
  }
}

export function TabSignals({ appId }: { appId: string }) {
  const { data: apiSignals, loading, error } = useApi(() => getAppSignals(appId), [appId])

  const signals: SignalEntry[] = apiSignals ? apiSignals.map(apiSignalToEntry) : []

  const sources = [...new Set(signals.map(s => s.source))]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading signals...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">Failed to load signals</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (signals.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">No signals available for this application.</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {sources.map(source => {
        const items = signals.filter(s => s.source === source)
        return (
          <div key={source}>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{source}</div>
              <div className="flex-1 h-px bg-border/60" />
              <div className="text-[10px] text-muted-foreground">{items.filter(i => i.status === "pass").length}/{items.length} passing</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((sig, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn(
                    "premium-card p-4 border-l-2",
                    sig.status === "pass" ? "border-l-emerald-500" :
                    sig.status === "warn" ? "border-l-amber-500" : "border-l-red-500"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-6 h-6 rounded-md flex items-center justify-center",
                        sig.status === "pass" ? "bg-emerald-500/10 text-emerald-500" :
                        sig.status === "warn" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {ICON_MAP[sig.icon] || <Activity className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{sig.metric}</span>
                    </div>
                    {sig.status === "pass"
                      ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    }
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground mb-0.5">{sig.value}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground font-mono">threshold: {sig.threshold}</div>
                    <div className={cn("text-[10px] font-semibold font-mono",
                      sig.delta.startsWith("+") ? "text-emerald-500" : sig.delta.startsWith("-") ? "text-red-400" : "text-muted-foreground"
                    )}>{sig.delta !== "0" ? sig.delta : "—"}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
