import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"
import { INFRA_PODS } from "./data"

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  }
}

const CPU_DATA = Array.from({ length: 30 }, (_, i) => ({
  t: i,
  cpu: Math.round(55 + Math.sin(i * 0.4) * 18 + Math.random() * 8),
  mem: Math.round(67 + Math.sin(i * 0.3) * 8 + Math.random() * 5),
}))

const INFRA_METRICS = [
  { label: "Avg CPU", value: "62%", warn: false },
  { label: "Avg Memory", value: "71%", warn: true },
  { label: "Pod Count", value: "4 / 4", warn: false },
  { label: "Node Count", value: "3 / 3", warn: false },
  { label: "Total Restarts", value: "3", warn: true },
  { label: "Network In", value: "142 MB/s", warn: false },
]

export function TabInfra() {
  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {INFRA_METRICS.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="premium-card p-3 text-center">
            <div className={cn("text-lg font-bold font-mono", m.warn ? "text-amber-500" : "text-foreground")}>{m.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="premium-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">CPU & Memory — 30 min</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CPU_DATA} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={9} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#cpuGrad)" name="CPU %" />
              <Area type="monotone" dataKey="mem" stroke="#f59e0b" strokeWidth={2} fill="url(#memGrad)" name="Mem %" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[["hsl(var(--primary))", "CPU %"], ["#f59e0b", "Memory %"]].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-3 h-0.5 inline-block rounded-full" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>
        </div>

        {/* Pod table */}
        <div className="premium-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pod Status</div>
          </div>
          <div className="divide-y divide-border/40">
            {INFRA_PODS.map((pod, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="px-5 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("w-2 h-2 rounded-full shrink-0",
                    pod.status === "running" ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <span className="text-xs font-mono font-semibold text-foreground truncate">{pod.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{pod.node}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">CPU</div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", pod.cpu > 80 ? "bg-red-500" : pod.cpu > 60 ? "bg-amber-500" : "bg-emerald-500")}
                        style={{ width: `${pod.cpu}%` }} />
                    </div>
                    <div className="text-[10px] font-mono text-foreground mt-0.5">{pod.cpu}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">Memory</div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", pod.mem > 80 ? "bg-red-500" : pod.mem > 65 ? "bg-amber-500" : "bg-emerald-500")}
                        style={{ width: `${pod.mem}%` }} />
                    </div>
                    <div className="text-[10px] font-mono text-foreground mt-0.5">{pod.mem}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-1">Restarts</div>
                    <div className={cn("text-sm font-bold font-mono mt-1", pod.restarts > 0 ? "text-amber-500" : "text-emerald-500")}>{pod.restarts}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
