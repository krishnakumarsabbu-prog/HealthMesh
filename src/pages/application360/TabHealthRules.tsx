import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { HEALTH_RULES } from "./data"
import { CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from "lucide-react"

export function TabHealthRules() {
  const passing = HEALTH_RULES.filter(r => r.status === "pass").length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Applied Rules", value: String(HEALTH_RULES.length), color: "text-foreground" },
          { label: "Passing", value: String(passing), color: "text-emerald-500" },
          { label: "Warn / Fail", value: String(HEALTH_RULES.length - passing), color: "text-amber-500" },
        ].map((s, i) => (
          <div key={i} className="premium-card px-4 py-3">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rules detail */}
      <div className="premium-card overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1fr_auto_1fr] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Rule</span>
          <span>Condition</span>
          <span>Current Value</span>
          <span>Weight</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border/40">
          {HEALTH_RULES.map((rule, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="grid grid-cols-[2fr_1.5fr_1fr_auto_1fr] gap-4 items-center px-5 py-4 hover:bg-muted/20 transition-colors">
              <div>
                <div className="text-sm font-semibold text-foreground">{rule.name}</div>
              </div>
              <div className="text-xs font-mono text-foreground/70 bg-muted/50 px-2 py-1 rounded-lg w-fit">{rule.condition}</div>
              <div className={cn("text-sm font-bold font-mono",
                rule.status === "pass" ? "text-emerald-500" : rule.status === "warn" ? "text-amber-500" : "text-red-500"
              )}>{rule.current}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${rule.weight * 3.3}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{rule.weight}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                {rule.status === "pass"
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : <AlertTriangle className="w-4 h-4 text-amber-500" />
                }
                <span className={cn("text-xs font-semibold capitalize",
                  rule.status === "pass" ? "text-emerald-500" : "text-amber-500"
                )}>{rule.status === "pass" ? "Passing" : "Warning"}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
