import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { TriangleAlert as AlertTriangle, TrendingUp, TrendingDown, Minus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOG_PATTERNS, ERROR_RATE_24H } from "./data"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const CHART_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  }
}

const LEVEL_STYLE: Record<string, string> = {
  ERROR: "bg-red-500/10 text-red-500",
  WARN: "bg-amber-500/10 text-amber-500",
  INFO: "bg-blue-500/10 text-blue-500",
}

const HOURLY_ERRORS = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, "0")}h`,
  errors: Math.max(0, Math.round(3 + Math.cos(i * 0.5) * 3 + Math.random() * 4)),
}))

export function TabLogs() {
  const [search, setSearch] = useState("")

  const filtered = LOG_PATTERNS.filter(l =>
    l.pattern.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 premium-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Error Spike — Last 24h</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={HOURLY_ERRORS} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="h" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_STYLE} />
              <Bar dataKey="errors" fill="#ef4444" opacity={0.7} radius={[2, 2, 0, 0]} name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="premium-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Error Rate — 24h</div>
          <div className="space-y-2 mt-3">
            {[
              { label: "Total Log Lines", value: "1.84M" },
              { label: "Error Lines", value: "423" },
              { label: "Warn Lines", value: "2,140" },
              { label: "Unique Patterns", value: "17" },
              { label: "Error Rate", value: "0.023%" },
            ].map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold font-mono text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log pattern groups */}
      <div className="premium-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Error / Warn Patterns</div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patterns..." className="pl-7 h-7 text-xs w-48" />
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {filtered.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5", LEVEL_STYLE[log.level])}>
                {log.level}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-foreground/80 break-all">{log.pattern}</div>
                <div className="text-[10px] text-muted-foreground mt-1">First: {log.first} · Last: {log.last}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold font-mono text-foreground">{log.count}</span>
                {log.trend === "up"
                  ? <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                  : log.trend === "down"
                  ? <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  : <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
