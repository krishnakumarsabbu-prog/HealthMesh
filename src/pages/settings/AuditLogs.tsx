import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Download, Filter, ShieldCheck, Settings, Users, Key, Plug, TriangleAlert as AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LogCategory = "auth" | "config" | "user" | "api" | "connector" | "rule"
type LogSeverity = "low" | "medium" | "high"

const CATEGORY_META: Record<LogCategory, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  auth: { icon: ShieldCheck, color: "text-primary", label: "Auth" },
  config: { icon: Settings, color: "text-amber-500", label: "Config" },
  user: { icon: Users, color: "text-blue-500", label: "User" },
  api: { icon: Key, color: "text-emerald-500", label: "API" },
  connector: { icon: Plug, color: "text-orange-500", label: "Connector" },
  rule: { icon: AlertTriangle, color: "text-red-500", label: "Rule" },
}

const LOGS = [
  { id: "log-001", category: "config" as LogCategory, action: "Health rule threshold updated", user: "Alex Chen", ip: "192.168.1.42", time: "2026-04-09 14:32:18", target: "search-latency-rule", severity: "medium" as LogSeverity },
  { id: "log-002", category: "auth" as LogCategory, action: "Admin login successful", user: "Rachel James", ip: "10.0.2.14", time: "2026-04-09 14:28:04", target: "platform", severity: "low" as LogSeverity },
  { id: "log-003", category: "connector" as LogCategory, action: "Connector disconnected", user: "System", ip: "internal", time: "2026-04-09 14:15:42", target: "pagerduty-prod", severity: "high" as LogSeverity },
  { id: "log-004", category: "user" as LogCategory, action: "User role changed to Admin", user: "Alex Chen", ip: "192.168.1.42", time: "2026-04-09 13:44:22", target: "yuki.tanaka@acme.io", severity: "medium" as LogSeverity },
  { id: "log-005", category: "api" as LogCategory, action: "API key created", user: "Tom Park", ip: "10.0.5.88", time: "2026-04-09 13:10:55", target: "catalog-service-key", severity: "medium" as LogSeverity },
  { id: "log-006", category: "rule" as LogCategory, action: "Health rule activated", user: "Jake Moore", ip: "10.0.3.21", time: "2026-04-09 12:58:33", target: "search-api-error-rate", severity: "low" as LogSeverity },
  { id: "log-007", category: "config" as LogCategory, action: "SLO target modified", user: "Rachel James", ip: "10.0.2.14", time: "2026-04-09 12:42:10", target: "payments-success-rate", severity: "medium" as LogSeverity },
  { id: "log-008", category: "auth" as LogCategory, action: "Failed login attempt", user: "unknown", ip: "203.45.67.89", time: "2026-04-09 12:31:02", target: "platform", severity: "high" as LogSeverity },
  { id: "log-009", category: "connector" as LogCategory, action: "Connector configuration updated", user: "Sara Lee", ip: "192.168.1.55", time: "2026-04-09 11:58:19", target: "datadog-apm-prod", severity: "low" as LogSeverity },
  { id: "log-010", category: "user" as LogCategory, action: "User invited to workspace", user: "Alex Chen", ip: "192.168.1.42", time: "2026-04-09 11:22:44", target: "new.engineer@acme.io", severity: "low" as LogSeverity },
]

const SEVERITY_STYLE: Record<LogSeverity, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-500",
}

export function AuditLogs() {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<LogCategory | "all">("all")

  const filtered = LOGS.filter(l => {
    if (catFilter !== "all" && l.category !== catFilter) return false
    if (search && !l.action.toLowerCase().includes(search.toLowerCase()) && !l.user.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-foreground mb-0.5">Audit Logs</div>
          <div className="text-xs text-muted-foreground">Track all administrative actions, configuration changes, and access events</div>
        </div>
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="w-3.5 h-3.5" /> Export Logs
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9 h-8 text-sm" />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCatFilter("all")}
            className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              catFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >All</button>
          {(Object.entries(CATEGORY_META) as [LogCategory, typeof CATEGORY_META[LogCategory]][]).map(([cat, meta]) => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                catFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}>
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-0 px-4 py-2 border-b border-border/60 bg-muted/30">
          {["Category", "Action", "User", "Target", "Time", "Severity"].map(h => (
            <div key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</div>
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {filtered.map((log, i) => {
            const meta = CATEGORY_META[log.category]
            const Icon = meta.icon
            return (
              <motion.div key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-0 px-4 py-2.5 hover:bg-muted/20 transition-colors items-center"
              >
                <div className="flex items-center gap-1.5 pr-4">
                  <Icon className={cn("w-3.5 h-3.5", meta.color)} />
                  <span className={cn("text-[10px] font-semibold", meta.color)}>{meta.label}</span>
                </div>
                <div className="text-xs text-foreground pr-4 truncate">{log.action}</div>
                <div className="text-xs text-muted-foreground pr-4 truncate">{log.user}</div>
                <div className="text-xs font-mono text-muted-foreground pr-4 truncate">{log.target}</div>
                <div className="text-[10px] text-muted-foreground pr-4">{log.time.split(" ")[1]}<br /><span className="text-[9px]">{log.time.split(" ")[0]}</span></div>
                <div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", SEVERITY_STYLE[log.severity])}>
                    {log.severity}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} of {LOGS.length} entries</span>
        <span>Retained for 90 days</span>
      </div>
    </div>
  )
}
