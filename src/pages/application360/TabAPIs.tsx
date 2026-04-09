import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ENDPOINTS } from "./data"

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500",
  POST: "bg-emerald-500/10 text-emerald-500",
  PUT: "bg-amber-500/10 text-amber-500",
  DELETE: "bg-red-500/10 text-red-500",
}

export function TabAPIs() {
  const statusCounts = {
    healthy: ENDPOINTS.filter(e => e.status === "healthy").length,
    warning: ENDPOINTS.filter(e => e.status === "warning").length,
    critical: ENDPOINTS.filter(e => e.status === "critical").length,
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Healthy Endpoints", value: statusCounts.healthy, color: "text-emerald-500" },
          { label: "Degraded Endpoints", value: statusCounts.warning, color: "text-amber-500" },
          { label: "Critical Endpoints", value: statusCounts.critical, color: "text-red-500" },
        ].map((s, i) => (
          <div key={i} className="premium-card px-4 py-3">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Endpoint table */}
      <div className="premium-card overflow-hidden">
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Method</span>
          <span>Endpoint</span>
          <span>P99 (ms)</span>
          <span>Availability</span>
          <span>Error %</span>
          <span>RPM</span>
        </div>
        <div className="divide-y divide-border/40">
          {ENDPOINTS.map((ep, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0", METHOD_COLOR[ep.method])}>
                {ep.method}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn("w-2 h-2 rounded-full shrink-0",
                  ep.status === "healthy" ? "bg-emerald-500" : ep.status === "warning" ? "bg-amber-500" : "bg-red-500"
                )} />
                <span className="text-xs font-mono text-foreground truncate">{ep.path}</span>
              </div>
              <div className={cn("text-xs font-mono font-semibold",
                ep.latency < 100 ? "text-emerald-500" : ep.latency < 300 ? "text-amber-500" : "text-red-500"
              )}>{ep.latency}</div>
              <div className={cn("text-xs font-mono font-semibold",
                ep.avail >= 99.9 ? "text-emerald-500" : ep.avail >= 99 ? "text-amber-500" : "text-red-500"
              )}>{ep.avail.toFixed(2)}%</div>
              <div className={cn("text-xs font-mono font-semibold",
                ep.errorPct < 0.1 ? "text-emerald-500" : ep.errorPct < 1 ? "text-amber-500" : "text-red-500"
              )}>{ep.errorPct.toFixed(2)}%</div>
              <div className="text-xs font-mono text-foreground">{ep.rpm.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
