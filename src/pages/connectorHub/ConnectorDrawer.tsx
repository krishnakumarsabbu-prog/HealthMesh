import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, Activity, Settings, Unplug, Archive, RefreshCw, ChartBar as BarChart2, ExternalLink, CircleCheck as CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import type { ConnectorInstance } from "./data"

interface Props {
  connector: ConnectorInstance | null
  onClose: () => void
  onEdit: () => void
}

const SYNC_HISTORY = [
  { time: "14:52:10", status: "success", records: "1,284" },
  { time: "14:51:40", status: "success", records: "1,102" },
  { time: "14:51:10", status: "success", records: "998" },
  { time: "14:50:40", status: "warning", records: "204" },
  { time: "14:50:10", status: "success", records: "1,340" },
]

export function ConnectorDrawer({ connector, onClose, onEdit }: Props) {
  return (
    <AnimatePresence>
      {connector && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[440px] bg-background border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-border/60">
              <div className="flex items-start gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold font-mono shrink-0",
                  connector.iconBg, `bg-gradient-to-br ${connector.bgColor}`
                )}>
                  {connector.abbr}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{connector.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" size="sm">{connector.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{connector.version}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Status + health */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Health", value: connector.healthScore > 0 ? `${connector.healthScore}%` : "—", color: connector.healthScore >= 90 ? "text-emerald-500" : connector.healthScore >= 70 ? "text-amber-500" : "text-red-500" },
                  { label: "Apps", value: String(connector.appsConnected), color: "text-foreground" },
                  { label: "Environment", value: connector.environment, color: "text-foreground" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl bg-muted/30 border border-border/60 p-3 text-center">
                    <div className={cn("text-lg font-bold", s.color)}>{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</div>
                <p className="text-sm text-foreground/80">{connector.description}</p>
              </div>

              {/* Capabilities */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Capabilities</div>
                <div className="flex flex-wrap gap-2">
                  {connector.capabilities.map(cap => (
                    <div key={cap} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/20">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-foreground">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync history */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Sync History</div>
                <div className="rounded-xl border border-border/60 overflow-hidden">
                  {SYNC_HISTORY.map((h, i) => (
                    <div key={i} className={cn("flex items-center gap-3 px-4 py-2.5 text-xs", i < SYNC_HISTORY.length - 1 && "border-b border-border/40")}>
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                        h.status === "success" ? "bg-emerald-500" : "bg-amber-500"
                      )} />
                      <span className="font-mono text-muted-foreground flex-1">{h.time}</span>
                      <span className="font-mono text-foreground">{h.records} records</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected apps */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connected Apps ({connector.appsConnected})</div>
                <div className="flex flex-wrap gap-2">
                  {["payments-api", "customer-auth", "order-gateway", "search-api", "fraud-detection"].slice(0, connector.appsConnected < 5 ? connector.appsConnected : 5).map(app => (
                    <span key={app} className="text-xs font-mono px-2 py-1 rounded-lg bg-muted/60 text-muted-foreground">{app}</span>
                  ))}
                  {connector.appsConnected > 5 && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-muted/60 text-muted-foreground">+{connector.appsConnected - 5} more</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-border/60 p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Zap className="w-3.5 h-3.5" /> Test Connection
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Activity className="w-3.5 h-3.5" /> Discover Metrics
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <RefreshCw className="w-3.5 h-3.5" /> Force Sync
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <BarChart2 className="w-3.5 h-3.5" /> View Usage
                </Button>
              </div>
              <PermissionGuard action="edit_connector">
                <Button onClick={onEdit} className="w-full gap-2 text-sm" size="sm">
                  <Settings className="w-3.5 h-3.5" /> Edit Configuration
                </Button>
              </PermissionGuard>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
