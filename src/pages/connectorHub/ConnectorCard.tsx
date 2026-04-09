import { motion } from "framer-motion"
import { Settings, Activity, Zap, TriangleAlert as AlertTriangle, CircleX, Plug } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ConnectorInstance } from "./data"

interface Props {
  connector: ConnectorInstance
  onSelect: (connector: ConnectorInstance) => void
  index: number
}

const STATUS_CONFIG = {
  active: { dot: "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]", label: "Active", color: "text-emerald-500" },
  warning: { dot: "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]", label: "Warning", color: "text-amber-500" },
  error: { dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]", label: "Error", color: "text-red-500" },
  inactive: { dot: "bg-slate-400", label: "Inactive", color: "text-muted-foreground" },
}

export function ConnectorCard({ connector, onSelect, index }: Props) {
  const status = STATUS_CONFIG[connector.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={() => onSelect(connector)}
      className="premium-card p-4 cursor-pointer group hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-bold font-mono shrink-0", connector.bgColor, connector.iconBg)}>
          {connector.abbr}
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-2 h-2 rounded-full", status.dot)} />
          <span className={cn("text-[10px] font-semibold", status.color)}>{status.label}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="font-semibold text-sm text-foreground leading-tight mb-0.5">{connector.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" size="sm">{connector.category}</Badge>
          <span className="text-[10px] text-muted-foreground font-mono">{connector.environment}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {connector.capabilities.slice(0, 3).map(cap => (
          <span key={cap} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{cap}</span>
        ))}
        {connector.capabilities.length > 3 && (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">+{connector.capabilities.length - 3}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-xs font-bold text-foreground">{connector.appsConnected}</div>
          <div className="text-[10px] text-muted-foreground">Apps</div>
        </div>
        <div>
          <div className={cn("text-xs font-bold", connector.healthScore >= 90 ? "text-emerald-500" : connector.healthScore >= 70 ? "text-amber-500" : "text-red-500")}>
            {connector.healthScore > 0 ? `${connector.healthScore}%` : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground">Health</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
        <div className="text-[10px] text-muted-foreground">
          {connector.status === "error" ? (
            <span className="text-red-500 flex items-center gap-1"><CircleX className="w-3 h-3" /> Disconnected</span>
          ) : (
            <>Synced {connector.lastSync}</>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation() }}>
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}
