import { motion } from "framer-motion"
import { ShieldCheck, Plus, ToggleLeft, ToggleRight, CreditCard as Edit2, Trash2, Search } from "lucide-react"
import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const RULES = [
  { id: 1, name: "P99 Latency SLO", metric: "latency.p99", condition: "> 500ms for 5min", severity: "critical", enabled: true, scope: "All Production APIs", triggers: 3 },
  { id: 2, name: "Error Rate Threshold", metric: "http.error_rate", condition: "> 1% for 3min", severity: "warning", enabled: true, scope: "All Services", triggers: 1 },
  { id: 3, name: "Memory Pressure Alert", metric: "system.memory.used_percent", condition: "> 85%", severity: "warning", enabled: true, scope: "All Services", triggers: 0 },
  { id: 4, name: "CPU Saturation", metric: "system.cpu.utilization", condition: "> 90% for 10min", severity: "critical", enabled: true, scope: "All Services", triggers: 0 },
  { id: 5, name: "Request Throughput Drop", metric: "requests.rate", condition: "< 50% of baseline", severity: "warning", enabled: true, scope: "Critical APIs", triggers: 2 },
  { id: 6, name: "Database Connection Pool", metric: "db.connection_pool.used", condition: "> 80% capacity", severity: "warning", enabled: false, scope: "Database Services", triggers: 0 },
  { id: 7, name: "SLO Burn Rate (1h)", metric: "slo.burn_rate.1h", condition: "> 14× baseline", severity: "critical", enabled: true, scope: "SLO-tracked Services", triggers: 1 },
  { id: 8, name: "Availability Below 99%", metric: "availability.rate", condition: "< 99% in 5min window", severity: "critical", enabled: true, scope: "Critical Services", triggers: 0 },
]

export function HealthRules() {
  const [search, setSearch] = useState("")
  const [rules, setRules] = useState(RULES)

  const filtered = rules.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.metric.toLowerCase().includes(search.toLowerCase())
  )

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="Health Rules"
        description="Define and manage threshold-based alerting rules and SLO policies"
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Create Rule
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Rules", value: rules.filter(r => r.enabled).length, color: "text-foreground" },
            { label: "Triggered (24h)", value: rules.reduce((acc, r) => acc + r.triggers, 0), color: "text-amber-500" },
            { label: "Disabled Rules", value: rules.filter(r => !r.enabled).length, color: "text-muted-foreground" },
          ].map((s, i) => (
            <div key={i} className="premium-card px-4 py-3">
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules..." className="pl-9 h-8 text-sm" />
        </div>

        {/* Rules table */}
        <div className="premium-card overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Rule</span>
            <span>Condition</span>
            <span>Severity</span>
            <span>Triggers (24h)</span>
            <span></span>
          </div>

          <div className="divide-y divide-border/40">
            {filtered.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn("grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 transition-colors", rule.enabled ? "hover:bg-muted/20" : "opacity-50 hover:bg-muted/20")}
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">{rule.name}</div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">{rule.metric}</div>
                  <div className="text-[10px] text-muted-foreground/60 mt-0.5">{rule.scope}</div>
                </div>

                <div className="text-xs font-mono text-foreground/80 bg-muted/60 px-2 py-1 rounded-lg">
                  {rule.condition}
                </div>

                <div>
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    rule.severity === "critical" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {rule.severity}
                  </span>
                </div>

                <div className="text-sm font-mono font-semibold text-foreground">
                  {rule.triggers > 0 ? (
                    <span className="text-amber-500">{rule.triggers}×</span>
                  ) : "0"}
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => toggleRule(rule.id)}>
                    {rule.enabled
                      ? <ToggleRight className="w-4 h-4 text-primary" />
                      : <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                    }
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
