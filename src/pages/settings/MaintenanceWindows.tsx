import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Calendar, Clock, ChevronDown, X, Wrench, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MWStatus = "upcoming" | "active" | "completed" | "cancelled"

const STATUS_STYLE: Record<MWStatus, string> = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const WINDOWS = [
  { id: "mw-001", name: "DB Primary Failover Test", apps: ["payments-api", "db-primary"], env: "production", start: "2026-04-10 02:00", end: "2026-04-10 04:00", status: "upcoming" as const, owner: "Platform Team", suppressAlerts: true, description: "Scheduled failover test for primary DB cluster" },
  { id: "mw-002", name: "Search API v2.4 Deployment", apps: ["search-api", "indexer"], env: "production", start: "2026-04-09 22:00", end: "2026-04-10 00:00", status: "active" as const, owner: "Discovery Team", suppressAlerts: true, description: "Rolling deployment of search-api v2.4 with zero-downtime strategy" },
  { id: "mw-003", name: "Auth Service Certificate Rotation", apps: ["auth-service"], env: "production", start: "2026-04-08 03:00", end: "2026-04-08 03:30", status: "completed" as const, owner: "Identity Team", suppressAlerts: true, description: "TLS certificate rotation for auth-service" },
  { id: "mw-004", name: "Kafka Cluster Upgrade", apps: ["event-bus", "kafka"], env: "staging", start: "2026-04-07 10:00", end: "2026-04-07 14:00", status: "completed" as const, owner: "Platform Team", suppressAlerts: false, description: "Kafka 3.5 upgrade in staging" },
  { id: "mw-005", name: "Redis Cluster Scale-up", apps: ["redis-cluster", "cache"], env: "production", start: "2026-04-12 01:00", end: "2026-04-12 03:00", status: "upcoming" as const, owner: "Data Platform", suppressAlerts: true, description: "Scaling redis-cluster from 3 to 5 nodes for peak season" },
]

export function MaintenanceWindows() {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<MWStatus | "all">("all")

  const filtered = filter === "all" ? WINDOWS : WINDOWS.filter(w => w.status === filter)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-foreground mb-0.5">Maintenance Windows</div>
          <div className="text-xs text-muted-foreground">Schedule downtime windows to suppress alerts and notify stakeholders</div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-3.5 h-3.5" /> Schedule Window
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: WINDOWS.length },
          { label: "Active Now", value: WINDOWS.filter(w => w.status === "active").length, warn: "emerald" },
          { label: "Upcoming", value: WINDOWS.filter(w => w.status === "upcoming").length },
          { label: "This Month", value: WINDOWS.filter(w => w.status === "completed").length },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-center">
            <div className={cn("text-lg font-bold", s.warn === "emerald" && s.value > 0 ? "text-emerald-500" : "text-foreground")}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {(["all", "upcoming", "active", "completed", "cancelled"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Windows list */}
      <div className="space-y-3">
        {filtered.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-card transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  w.status === "active" ? "bg-emerald-500/15" :
                  w.status === "upcoming" ? "bg-primary/10" : "bg-muted"
                )}>
                  {w.status === "active"
                    ? <Wrench className="w-3.5 h-3.5 text-emerald-500" />
                    : w.status === "completed"
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                    : (w.status as string) === "cancelled"
                    ? <X className="w-3.5 h-3.5 text-red-500" />
                    : <Calendar className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground mb-0.5">{w.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{w.description}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {w.apps.map(app => (
                      <span key={app} className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{app}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", STATUS_STYLE[w.status])}>
                  {w.status}
                </span>
                {w.suppressAlerts && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                    <Pause className="w-3 h-3" /> Alerts suppressed
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{w.start} → {w.end}</span>
              <span className="capitalize">{w.env}</span>
              <span className="ml-auto">{w.owner}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-x-4 top-20 z-50 max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-elevation-3 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-foreground">Schedule Maintenance Window</div>
                <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Window Name</label>
                  <Input placeholder="e.g. DB Failover Test" className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Start</label>
                    <Input type="datetime-local" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">End</label>
                    <Input type="datetime-local" className="h-8 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Affected Apps</label>
                  <Input placeholder="search-api, db-primary..." className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
                  <Input placeholder="Brief description of changes..." className="h-8 text-sm" />
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  Suppress health alerts during this window
                </label>
              </div>
              <div className="flex gap-2 mt-5">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" className="flex-1" onClick={() => setShowForm(false)}>Schedule Window</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
