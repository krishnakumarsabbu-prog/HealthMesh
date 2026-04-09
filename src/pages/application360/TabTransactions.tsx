import { motion } from "framer-motion"
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { cn } from "@/lib/utils"
import { TRANSACTIONS, LATENCY_24H, THROUGHPUT_24H } from "./data"
import { useApi } from "@/hooks/useApi"
import { getAppTransactions, getAppOverview } from "@/lib/api/apps"
import { mapAppOverview, mapAppTransaction } from "@/lib/mappers"

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  }
}

const METHOD_COLOR: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500",
  POST: "bg-emerald-500/10 text-emerald-500",
  PUT: "bg-amber-500/10 text-amber-500",
  DELETE: "bg-red-500/10 text-red-500",
}

type TxEntry = { name: string; rpm: number; p99: number; errors: number; apdex: number; status: "healthy" | "warning" | "critical" }

export function TabTransactions({ appId }: { appId: string }) {
  const { data: apiTransactions } = useApi(() => getAppTransactions(appId), [appId])
  const { data: rawOverview } = useApi(() => getAppOverview(appId), [appId])
  const overview = rawOverview ? mapAppOverview(rawOverview) : null

  const transactions: TxEntry[] = apiTransactions && apiTransactions.length > 0
    ? apiTransactions.map(t => {
        const m = mapAppTransaction(t)
        return {
          name: m.name.includes(" ") ? m.name : `GET ${m.name}`,
          rpm: m.rpm,
          p99: m.latencyP99,
          errors: m.errorRate,
          apdex: m.apdex,
          status: (m.status === "healthy" ? "healthy" : m.status === "warning" ? "warning" : "critical") as TxEntry["status"],
        }
      })
    : TRANSACTIONS

  const latencyData = overview?.latency24h && overview.latency24h.length > 0
    ? overview.latency24h.map(d => ({ time: d.t, p50: d.p50, p95: d.p95, p99: d.p99 }))
    : LATENCY_24H

  const throughputData = overview?.throughput24h && overview.throughput24h.length > 0
    ? overview.throughput24h.map(d => ({ time: d.t, rpm: d.rpm }))
    : THROUGHPUT_24H

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="premium-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Response Time P99 — 24h</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={latencyData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={11} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Line type="monotone" dataKey="p50" stroke="#10b981" strokeWidth={2} dot={false} name="P50 (ms)" />
              <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} dot={false} name="P95 (ms)" />
              <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} dot={false} name="P99 (ms)" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            {[["#10b981", "P50"], ["#f59e0b", "P95"], ["#ef4444", "P99"]].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-3 h-0.5 inline-block rounded-full" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>
        </div>

        <div className="premium-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Throughput (rpm) — 24h</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={throughputData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="rpmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={11} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Area type="monotone" dataKey="rpm" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rpmGrad)" name="RPM" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Transaction</span>
          <span>RPM</span>
          <span>P99 (ms)</span>
          <span>Errors</span>
          <span>Apdex</span>
          <span></span>
        </div>
        <div className="divide-y divide-border/40">
          {transactions.map((tx, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0",
                  METHOD_COLOR[tx.name.split(" ")[0]] || "bg-muted text-muted-foreground"
                )}>{tx.name.split(" ")[0]}</span>
                <span className="text-xs font-mono text-foreground truncate">{tx.name.split(" ")[1]}</span>
              </div>
              <div className="text-xs font-mono text-foreground">{tx.rpm.toLocaleString()}</div>
              <div className={cn("text-xs font-mono font-semibold",
                tx.p99 < 100 ? "text-emerald-500" : tx.p99 < 300 ? "text-amber-500" : "text-red-500"
              )}>{tx.p99}</div>
              <div className={cn("text-xs font-mono font-semibold",
                tx.errors < 0.1 ? "text-emerald-500" : tx.errors < 1 ? "text-amber-500" : "text-red-500"
              )}>{tx.errors.toFixed(2)}%</div>
              <div>
                <div className="text-xs font-mono font-semibold text-foreground mb-0.5">{tx.apdex.toFixed(2)}</div>
                <div className="w-16 h-1 bg-muted/40 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", tx.apdex >= 0.94 ? "bg-emerald-500" : tx.apdex >= 0.8 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${tx.apdex * 100}%` }} />
                </div>
              </div>
              <div className={cn("w-2 h-2 rounded-full shrink-0",
                tx.status === "healthy" ? "bg-emerald-500" : tx.status === "warning" ? "bg-amber-500" : "bg-red-500"
              )} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
