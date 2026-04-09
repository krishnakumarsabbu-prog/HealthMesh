import { motion } from "framer-motion"
import { useState } from "react"
import { Plug2, CircleCheck as CheckCircle2, Plus, Settings, Zap, Database, Globe, ChartBar as BarChart3, Bell, Shield, Clock, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CONNECTORS = [
  { name: "Datadog", category: "Monitoring", icon: "🐶", status: "connected", lastSync: "2m ago", metrics: "42 apps", color: "from-purple-500/20 to-purple-500/5" },
  { name: "PagerDuty", category: "Alerting", icon: "🔔", status: "connected", lastSync: "Just now", metrics: "18 policies", color: "from-green-500/20 to-green-500/5" },
  { name: "GitHub", category: "CI/CD", icon: "🐙", status: "connected", lastSync: "5m ago", metrics: "89 repos", color: "from-slate-500/20 to-slate-500/5" },
  { name: "AWS CloudWatch", category: "Infrastructure", icon: "☁️", status: "connected", lastSync: "1m ago", metrics: "134 resources", color: "from-orange-500/20 to-orange-500/5" },
  { name: "Grafana", category: "Observability", icon: "📊", status: "connected", lastSync: "3m ago", metrics: "28 dashboards", color: "from-amber-500/20 to-amber-500/5" },
  { name: "Jira", category: "Ticketing", icon: "🎯", status: "connected", lastSync: "12m ago", metrics: "245 issues", color: "from-blue-500/20 to-blue-500/5" },
  { name: "Slack", category: "Communication", icon: "💬", status: "connected", lastSync: "Just now", metrics: "12 channels", color: "from-emerald-500/20 to-emerald-500/5" },
  { name: "Prometheus", category: "Metrics", icon: "🔥", status: "warning", lastSync: "18m ago", metrics: "3.2M series", color: "from-red-500/20 to-red-500/5" },
  { name: "Kubernetes", category: "Orchestration", icon: "⚙️", status: "connected", lastSync: "30s ago", metrics: "12 clusters", color: "from-cyan-500/20 to-cyan-500/5" },
  { name: "Splunk", category: "Log Management", icon: "🔍", status: "disconnected", lastSync: "2h ago", metrics: "—", color: "from-slate-500/20 to-slate-500/5" },
  { name: "New Relic", category: "APM", icon: "🚀", status: "disconnected", lastSync: "Never", metrics: "—", color: "from-slate-500/20 to-slate-500/5" },
  { name: "ServiceNow", category: "ITSM", icon: "🎫", status: "connected", lastSync: "8m ago", metrics: "54 incidents", color: "from-teal-500/20 to-teal-500/5" },
]

const CATEGORIES = ["All", "Monitoring", "Alerting", "CI/CD", "Infrastructure", "Observability", "Metrics"]

export function ConnectorHub() {
  const [activeCategory, setActiveCategory] = useState("All")
  const filtered = activeCategory === "All" ? CONNECTORS : CONNECTORS.filter(c => c.category === activeCategory)

  const connectedCount = CONNECTORS.filter(c => c.status === "connected").length

  return (
    <div className="min-h-full">
      <PageHeader
        title="Connector Hub"
        description="Integrate and manage all your data sources, alerting tools, and operational platforms"
        badge={<Badge variant="healthy" size="sm">{connectedCount} Connected</Badge>}
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Add Connector
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Connected", value: connectedCount, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: "text-emerald-500" },
            { label: "Warning", value: 1, icon: <Clock className="w-4 h-4 text-amber-500" />, color: "text-amber-500" },
            { label: "Disconnected", value: 2, icon: <Plug2 className="w-4 h-4 text-muted-foreground" />, color: "text-muted-foreground" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="premium-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center">{s.icon}</div>
              <div>
                <div className={cn("text-xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-150 border",
                activeCategory === cat
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Connector grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((connector, i) => (
            <motion.div
              key={connector.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              whileHover={{ y: -2 }}
              className="premium-card p-4 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl", connector.color)}>
                  {connector.icon}
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5",
                  connector.status === "connected" ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" :
                  connector.status === "warning" ? "bg-amber-500" : "bg-slate-400"
                )} />
              </div>

              <div className="font-semibold text-sm text-foreground mb-0.5">{connector.name}</div>
              <div className="text-xs text-muted-foreground mb-3">{connector.category}</div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-foreground">{connector.metrics}</div>
                  <div className="text-[10px] text-muted-foreground">Last sync: {connector.lastSync}</div>
                </div>
                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Add new connector */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -2 }}
            className="rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/3 p-4 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center min-h-[120px] group"
          >
            <div className="w-8 h-8 rounded-lg bg-muted/60 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add Connector</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
