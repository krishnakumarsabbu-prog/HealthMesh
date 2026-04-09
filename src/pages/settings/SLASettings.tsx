import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, CreditCard as Edit2, Target, TrendingUp, TrendingDown, TriangleAlert as AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SLO_TARGETS = [
  { id: "slo-001", name: "API Availability", app: "api-gateway", metric: "availability", target: 99.95, current: 99.97, window: "30d", owner: "Platform", status: "on-track" as const },
  { id: "slo-002", name: "Payment Success Rate", app: "payments-api", metric: "success_rate", target: 99.9, current: 99.94, window: "7d", owner: "Payments", status: "on-track" as const },
  { id: "slo-003", name: "Search Latency P99", app: "search-api", metric: "p99_latency", target: 200, current: 312, window: "24h", owner: "Discovery", status: "breached" as const },
  { id: "slo-004", name: "Auth Response Time", app: "auth-service", metric: "p95_latency", target: 100, current: 84, window: "24h", owner: "Identity", status: "on-track" as const },
  { id: "slo-005", name: "Catalog Error Rate", app: "catalog-service", metric: "error_rate", target: 0.1, current: 0.05, window: "7d", owner: "Commerce", status: "on-track" as const },
  { id: "slo-006", name: "ML Inference Latency", app: "model-server", metric: "p95_latency", target: 150, current: 148, window: "24h", owner: "ML", status: "at-risk" as const },
]

const ERROR_BUDGETS = [
  { app: "api-gateway", budget: 0.05, consumed: 0.012, percent: 24 },
  { app: "payments-api", budget: 0.1, consumed: 0.031, percent: 31 },
  { app: "search-api", budget: 0.1, consumed: 0.18, percent: 180, breached: true },
  { app: "auth-service", budget: 0.05, consumed: 0.008, percent: 16 },
  { app: "catalog-service", budget: 0.1, consumed: 0.019, percent: 19 },
]

const STATUS_STYLE = {
  "on-track": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "at-risk": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "breached": "bg-red-500/10 text-red-500 border-red-500/20",
}

export function SLASettings() {
  const [activeView, setActiveView] = useState<"slos" | "budgets">("slos")

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-foreground mb-0.5">SLA / SLO Configuration</div>
          <div className="text-xs text-muted-foreground">Define service level objectives and track error budgets across applications</div>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-3.5 h-3.5" /> Add SLO
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "SLOs Defined", value: SLO_TARGETS.length },
          { label: "On Track", value: SLO_TARGETS.filter(s => s.status === "on-track").length, color: "text-emerald-500" },
          { label: "Breached", value: SLO_TARGETS.filter(s => s.status === "breached").length, color: "text-red-500" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-center">
            <div className={cn("text-lg font-bold", s.color || "text-foreground")}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["slos", "budgets"] as const).map(v => (
          <button key={v} onClick={() => setActiveView(v)}
            className={cn("px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-colors",
              activeView === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {v === "slos" ? "SLO Targets" : "Error Budgets"}
          </button>
        ))}
      </div>

      {activeView === "slos" && (
        <div className="space-y-2">
          {SLO_TARGETS.map((slo, i) => {
            const isLatency = slo.metric.includes("latency")
            const isGood = slo.status === "on-track"
            const diff = isLatency
              ? slo.target - slo.current
              : slo.current - slo.target
            return (
              <motion.div key={slo.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-card transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
                      slo.status === "on-track" ? "bg-emerald-500/10" :
                      slo.status === "at-risk" ? "bg-amber-500/10" : "bg-red-500/10"
                    )}>
                      <Target className={cn("w-3.5 h-3.5",
                        slo.status === "on-track" ? "text-emerald-500" :
                        slo.status === "at-risk" ? "text-amber-500" : "text-red-500"
                      )} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{slo.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{slo.app} · {slo.window} window</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Target / Current</div>
                      <div className="text-sm font-bold text-foreground">
                        {slo.target}{isLatency ? "ms" : "%"} / <span className={cn(isGood ? "text-emerald-500" : slo.status === "at-risk" ? "text-amber-500" : "text-red-500")}>{slo.current}{isLatency ? "ms" : "%"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {diff >= 0
                        ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                        : <TrendingDown className="w-3 h-3 text-red-500" />}
                      <span className={diff >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {Math.abs(diff).toFixed(2)}{isLatency ? "ms" : "%"}
                      </span>
                    </div>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", STATUS_STYLE[slo.status])}>
                      {slo.status.replace("-", " ")}
                    </span>
                    <button className="p-1 rounded hover:bg-muted transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {activeView === "budgets" && (
        <div className="space-y-3">
          {ERROR_BUDGETS.map((b, i) => (
            <motion.div key={b.app} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border/60 bg-card/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {b.breached && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                  <span className="font-mono text-sm font-semibold text-foreground">{b.app}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className={cn("font-semibold", b.breached ? "text-red-500" : b.percent > 60 ? "text-amber-500" : "text-foreground")}>
                    {b.percent}%
                  </span> consumed
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-full transition-all",
                    b.breached ? "bg-red-500" : b.percent > 60 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(b.percent, 100)}%` }}
                />
                {b.breached && (
                  <div className="absolute inset-y-0 left-0 w-full bg-red-500/20 rounded-full" />
                )}
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>Consumed: {b.consumed}%</span>
                <span>Budget: {b.budget}% / 30d</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
