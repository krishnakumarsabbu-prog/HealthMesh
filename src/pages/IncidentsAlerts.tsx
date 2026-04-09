import { useState } from "react"
import { motion } from "framer-motion"
import { TriangleAlert as AlertTriangle, Circle as XCircle, Clock, CircleCheck as CheckCircle2, User, Filter, Plus, ChevronDown, Search } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const INCIDENTS = [
  { id: "INC-2847", title: "search-api P99 latency spike exceeding SLO", app: "search-api", severity: "critical", status: "active", age: "14m", owner: "Discovery", assignee: "Jake M.", desc: "P99 latency has been above 2000ms for 14 minutes. Investigating root cause — suspect database connection pool exhaustion." },
  { id: "INC-2846", title: "auth-service elevated 5xx error rate", app: "auth-service", severity: "warning", status: "investigating", age: "1h 22m", owner: "Platform", assignee: "Sarah C.", desc: "Error rate at 1.2%, above 0.5% threshold. Correlated with recent config change in session management." },
  { id: "INC-2844", title: "recommendation-engine degraded throughput", app: "recommendation-engine", severity: "degraded", status: "investigating", age: "3h 5m", owner: "ML", assignee: "David R.", desc: "Throughput dropped 40% from baseline. Memory pressure suspected due to model reload cycle." },
  { id: "INC-2841", title: "notification-worker queue backlog", app: "notification-worker", severity: "warning", status: "resolved", age: "6h ago", owner: "Platform", assignee: "Maria L.", desc: "Queue depth reached 50K messages. Added 2 additional worker instances. Now resolved." },
  { id: "INC-2839", title: "catalog-service cache miss rate spike", app: "catalog-service", severity: "warning", status: "resolved", age: "1d ago", owner: "Commerce", assignee: "Tom W.", desc: "Redis connection timeout caused cache miss spike. Connection pool config updated." },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  investigating: { label: "Investigating", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  resolved: { label: "Resolved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
}

export function IncidentsAlerts() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = INCIDENTS.filter(inc => {
    const matchSearch = inc.title.toLowerCase().includes(search.toLowerCase()) || inc.app.includes(search)
    const matchFilter = filter === "all" ||
      (filter === "active" && (inc.status === "active" || inc.status === "investigating")) ||
      (filter === "resolved" && inc.status === "resolved")
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-full">
      <PageHeader
        title="Incidents & Alerts"
        description="Track, investigate, and resolve operational incidents across your applications"
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Create Incident
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active", count: 1, color: "text-red-500", bg: "bg-red-500/8 border-red-500/15" },
            { label: "Investigating", count: 2, color: "text-amber-500", bg: "bg-amber-500/8 border-amber-500/15" },
            { label: "Resolved (7d)", count: 14, color: "text-emerald-500", bg: "bg-emerald-500/8 border-emerald-500/15" },
            { label: "MTTR (7d)", count: "1h 24m", color: "text-blue-500", bg: "bg-blue-500/8 border-blue-500/15" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn("rounded-xl border p-4", s.bg)}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</div>
              <div className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.count}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents..." className="pl-9 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {["all", "active", "resolved"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 capitalize",
                  filter === f ? "bg-background text-foreground shadow-elevation-1" : "text-muted-foreground hover:text-foreground"
                )}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Incident list */}
        <div className="space-y-3">
          {filtered.map((inc, i) => {
            const statusMeta = STATUS_META[inc.status]
            return (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="premium-card p-5 cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    inc.severity === "critical" ? "bg-red-500/10" :
                    inc.severity === "warning" ? "bg-amber-500/10" : "bg-orange-500/10"
                  )}>
                    {inc.severity === "critical"
                      ? <XCircle className="w-4.5 h-4.5 text-red-500" />
                      : <AlertTriangle className={cn("w-4 h-4", inc.severity === "warning" ? "text-amber-500" : "text-orange-500")} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                      <StatusBadge status={inc.severity as "critical" | "warning" | "degraded"} size="sm" />
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusMeta.bg, statusMeta.color)}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1.5">{inc.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-3">{inc.desc}</div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{inc.age}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{inc.assignee}</span>
                      <span className="font-mono text-foreground/70">{inc.app}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    View
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
