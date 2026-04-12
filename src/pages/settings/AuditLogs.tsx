import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Download, ShieldCheck, Settings, Users, Key, Plug, TriangleAlert as AlertTriangle, CalendarDays, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { listAuditLogs, type AuditLog as ApiAuditLog } from "@/lib/api/misc"
import { listLobs, listOrgTeams } from "@/lib/api/org"
import { useAuth } from "@/context/AuthContext"

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

type LogEntry = {
  id: string
  category: LogCategory
  action: string
  user: string
  ip: string
  time: string
  target: string
  severity: LogSeverity
  lob_id?: string | null
  team_id?: string | null
}

const STATIC_LOGS: LogEntry[] = [
  { id: "log-001", category: "config", action: "Health rule threshold updated", user: "Alex Chen", ip: "192.168.1.42", time: "2026-04-09 14:32:18", target: "search-latency-rule", severity: "medium", lob_id: "11111111-0000-0000-0000-000000000001" },
  { id: "log-002", category: "auth", action: "Admin login successful", user: "Rachel James", ip: "10.0.2.14", time: "2026-04-09 14:28:04", target: "platform", severity: "low", lob_id: "11111111-0000-0000-0000-000000000002" },
  { id: "log-003", category: "connector", action: "Connector disconnected", user: "System", ip: "internal", time: "2026-04-09 14:15:42", target: "pagerduty-prod", severity: "high", lob_id: "11111111-0000-0000-0000-000000000001" },
  { id: "log-004", category: "user", action: "User role changed to Admin", user: "Alex Chen", ip: "192.168.1.42", time: "2026-04-09 13:44:22", target: "yuki.tanaka@acme.io", severity: "medium", lob_id: "11111111-0000-0000-0000-000000000001" },
  { id: "log-005", category: "api", action: "API key created", user: "Tom Park", ip: "10.0.5.88", time: "2026-04-09 13:10:55", target: "catalog-service-key", severity: "medium", lob_id: "11111111-0000-0000-0000-000000000002" },
  { id: "log-006", category: "rule", action: "Health rule activated", user: "Jake Moore", ip: "10.0.3.21", time: "2026-04-09 12:58:33", target: "search-api-error-rate", severity: "low", lob_id: "11111111-0000-0000-0000-000000000003" },
  { id: "log-007", category: "config", action: "SLO target modified", user: "Rachel James", ip: "10.0.2.14", time: "2026-04-09 12:42:10", target: "payments-success-rate", severity: "medium", lob_id: "11111111-0000-0000-0000-000000000002" },
  { id: "log-008", category: "auth", action: "Failed login attempt", user: "unknown", ip: "203.45.67.89", time: "2026-04-09 12:31:02", target: "platform", severity: "high", lob_id: null },
  { id: "log-009", category: "connector", action: "Connector configuration updated", user: "Sara Lee", ip: "192.168.1.55", time: "2026-04-09 11:58:19", target: "datadog-apm-prod", severity: "low", lob_id: "11111111-0000-0000-0000-000000000001" },
  { id: "log-010", category: "user", action: "User invited to workspace", user: "Alex Chen", ip: "192.168.1.42", time: "2026-04-09 11:22:44", target: "new.engineer@acme.io", severity: "low", lob_id: "11111111-0000-0000-0000-000000000001" },
]

function apiToLog(l: ApiAuditLog): LogEntry {
  const catMap: Record<string, LogCategory> = {
    auth: "auth", config: "config", user: "user", api: "api", connector: "connector", rule: "rule",
    rule_change: "rule", connector_change: "connector", user_change: "user",
  }
  const sevMap: Record<string, LogSeverity> = { low: "low", medium: "medium", high: "high" }
  const cat = catMap[l.resource_type?.toLowerCase() || ""] || "config"
  return {
    id: String(l.id),
    category: cat,
    action: l.action,
    user: l.user_name || l.user_email || "System",
    ip: l.ip_address || "internal",
    time: l.timestamp ? l.timestamp.replace("T", " ").slice(0, 19) : "",
    target: l.resource_name || l.resource_id || "—",
    severity: sevMap[l.details?.toLowerCase() || ""] || "low",
    lob_id: l.lob_id,
    team_id: l.team_id,
  }
}

const SEVERITY_STYLE: Record<LogSeverity, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-500",
}

export function AuditLogs() {
  const { user } = useAuth()
  const { data: apiLogs } = useApi(listAuditLogs, [])
  const { data: lobList } = useApi(listLobs, [])
  const { data: teamList } = useApi(listOrgTeams, [])

  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<LogCategory | "all">("all")
  const [lobFilter, setLobFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const isLobAdmin = user?.role_id === "LOB_ADMIN" && !!user?.lob_id
  const userLobId = user?.lob_id

  const rawLogs: LogEntry[] = apiLogs && apiLogs.length > 0 ? apiLogs.map(apiToLog) : STATIC_LOGS

  const scopedLogs = useMemo(() => {
    if (isLobAdmin && userLobId) {
      return rawLogs.filter(l => l.lob_id === userLobId || l.lob_id == null)
    }
    return rawLogs
  }, [rawLogs, isLobAdmin, userLobId])

  const uniqueUsers = useMemo(() => {
    const names = [...new Set(scopedLogs.map(l => l.user))].filter(Boolean).sort()
    return names
  }, [scopedLogs])

  const visibleLobs = useMemo(() => {
    if (isLobAdmin && userLobId) {
      return (lobList ?? []).filter(l => l.id === userLobId)
    }
    return lobList ?? []
  }, [lobList, isLobAdmin, userLobId])

  const filtered = useMemo(() => {
    return scopedLogs.filter(l => {
      if (catFilter !== "all" && l.category !== catFilter) return false
      if (lobFilter !== "all" && l.lob_id !== lobFilter) return false
      if (userFilter !== "all" && l.user !== userFilter) return false
      if (dateFrom && l.time < dateFrom) return false
      if (dateTo && l.time > dateTo + " 23:59:59") return false
      if (search) {
        const q = search.toLowerCase()
        if (!l.action.toLowerCase().includes(q) && !l.user.toLowerCase().includes(q) && !l.target.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [scopedLogs, catFilter, lobFilter, userFilter, dateFrom, dateTo, search])

  const hasActiveFilters = catFilter !== "all" || lobFilter !== "all" || userFilter !== "all" || dateFrom || dateTo || search

  function clearFilters() {
    setCatFilter("all")
    setLobFilter("all")
    setUserFilter("all")
    setDateFrom("")
    setDateTo("")
    setSearch("")
  }

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

      <div className="premium-card p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9 h-8 text-sm" />
          </div>

          {visibleLobs.length > 1 && (
            <select
              value={lobFilter}
              onChange={e => setLobFilter(e.target.value)}
              className="h-8 rounded-lg border border-border/60 bg-background text-xs px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="all">All LOBs</option>
              {visibleLobs.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}

          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="h-8 rounded-lg border border-border/60 bg-background text-xs px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="h-8 rounded-lg border border-border/60 bg-background text-xs px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 w-[130px]"
              placeholder="From"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="h-8 rounded-lg border border-border/60 bg-background text-xs px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 w-[130px]"
              placeholder="To"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/60 hover:border-border transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
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

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-0 px-4 py-2 border-b border-border/60 bg-muted/30">
          {["Category", "Action", "User", "Target", "Time", "Severity"].map(h => (
            <div key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</div>
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">No audit logs match your filters</div>
          )}
          {filtered.map((log, i) => {
            const meta = CATEGORY_META[log.category]
            const Icon = meta.icon
            const lobName = (lobList ?? []).find(l => l.id === log.lob_id)?.name
            const teamName = (teamList ?? []).find(t => t.id === log.team_id)?.name
            return (
              <motion.div key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015 }}
                className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-0 px-4 py-2.5 hover:bg-muted/20 transition-colors items-center"
              >
                <div className="flex items-center gap-1.5 pr-4">
                  <Icon className={cn("w-3.5 h-3.5", meta.color)} />
                  <span className={cn("text-[10px] font-semibold", meta.color)}>{meta.label}</span>
                </div>
                <div className="text-xs text-foreground pr-4 truncate">
                  {log.action}
                  {(lobName || teamName) && (
                    <span className="ml-1.5 text-[9px] text-muted-foreground">
                      {[lobName, teamName].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground pr-4 truncate">{log.user}</div>
                <div className="text-xs font-mono text-muted-foreground pr-4 truncate">{log.target}</div>
                <div className="text-[10px] text-muted-foreground pr-4">
                  {log.time.split(" ")[1]}
                  <br />
                  <span className="text-[9px]">{log.time.split(" ")[0]}</span>
                </div>
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
        <span>
          Showing {filtered.length} of {scopedLogs.length} entries
          {apiLogs && apiLogs.length > 0 ? " (live)" : ""}
          {isLobAdmin && " · scoped to your LOB"}
        </span>
        <span>Retained for 90 days</span>
      </div>
    </div>
  )
}
