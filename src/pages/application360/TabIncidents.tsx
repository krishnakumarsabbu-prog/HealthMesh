import { motion } from "framer-motion"
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { INCIDENTS } from "./data"
import { useApi } from "@/hooks/useApi"
import { getAppIncidents } from "@/lib/api/apps"
import { mapAppIncident } from "@/lib/mappers"

const SEV_STYLE: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500",
  warning: "bg-amber-500/10 text-amber-500",
  info: "bg-blue-500/10 text-blue-500",
}

type IncEntry = { id: string; title: string; severity: string; opened: string; duration: string; status: string; assignee: string }

export function TabIncidents({ appId }: { appId: string }) {
  const { data: apiIncidents } = useApi(() => getAppIncidents(appId), [appId])

  const incidents: IncEntry[] = apiIncidents && apiIncidents.length > 0
    ? apiIncidents.map(i => {
        const m = mapAppIncident(i)
        return { id: m.id, title: m.title, severity: m.severity, opened: m.startedAt || "unknown", duration: m.duration || "—", status: m.status, assignee: m.assignee }
      })
    : INCIDENTS

  const resolved = incidents.filter(i => i.status === "resolved").length
  const open = incidents.filter(i => i.status !== "resolved").length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: String(incidents.length), color: "text-foreground" },
          { label: "Resolved", value: String(resolved), color: "text-emerald-500" },
          { label: "MTTR", value: "11.5m", color: "text-foreground" },
          { label: "Open", value: String(open), color: open > 0 ? "text-red-500" : "text-emerald-500" },
        ].map((s, i) => (
          <div key={i} className="premium-card px-4 py-3">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="premium-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/60">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Incidents</div>
        </div>
        <div className="divide-y divide-border/40">
          {incidents.map((inc, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              {inc.status === "resolved"
                ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-mono font-bold text-muted-foreground">{inc.id}</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", SEV_STYLE[inc.severity] || SEV_STYLE["info"])}>
                    {inc.severity}
                  </span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    inc.status === "resolved" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {inc.status}
                  </span>
                </div>
                <div className="text-sm font-semibold text-foreground">{inc.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" /> {inc.opened}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    Duration: {inc.duration}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <User className="w-3 h-3" /> {inc.assignee}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
