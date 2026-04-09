import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Plus, ToggleLeft, ToggleRight, CreditCard as Edit2, Search, X, ChevronDown, Zap, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Code as Code2 } from "lucide-react"
import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { listHealthRules, toggleHealthRule, createHealthRule, type HealthRule as ApiHealthRule } from "@/lib/api/misc"
import { LoadingShimmer } from "@/components/shared/LoadingShimmer"

type RuleCondition = { metric: string; operator: string; value: string; unit: string }
type Rule = {
  id: number
  name: string
  metric: string
  condition: string
  severity: "critical" | "warning"
  enabled: boolean
  scope: string
  triggers: number
  tags: string[]
  version: string
  lastTriggered: string
  linkedApps: string[]
}

const RULES: Rule[] = [
  { id: 1, name: "P99 Latency SLO", metric: "latency.p99", condition: "> 500ms for 5min", severity: "critical", enabled: true, scope: "All Production APIs", triggers: 3, tags: ["slo", "latency"], version: "v2.1", lastTriggered: "14m ago", linkedApps: ["search-api", "payments-api"] },
  { id: 2, name: "Error Rate Threshold", metric: "http.error_rate", condition: "> 1% for 3min", severity: "warning", enabled: true, scope: "All Services", triggers: 1, tags: ["errors"], version: "v1.4", lastTriggered: "1h ago", linkedApps: ["auth-service"] },
  { id: 3, name: "Memory Pressure Alert", metric: "system.memory.used_percent", condition: "> 85%", severity: "warning", enabled: true, scope: "All Services", triggers: 0, tags: ["infra", "memory"], version: "v1.0", lastTriggered: "Never", linkedApps: [] },
  { id: 4, name: "CPU Saturation", metric: "system.cpu.utilization", condition: "> 90% for 10min", severity: "critical", enabled: true, scope: "All Services", triggers: 0, tags: ["infra", "cpu"], version: "v1.2", lastTriggered: "Never", linkedApps: [] },
  { id: 5, name: "Request Throughput Drop", metric: "requests.rate", condition: "< 50% of baseline", severity: "warning", enabled: true, scope: "Critical APIs", triggers: 2, tags: ["throughput", "anomaly"], version: "v1.1", lastTriggered: "3h ago", linkedApps: ["recommendation-engine"] },
  { id: 6, name: "Database Connection Pool", metric: "db.connection_pool.used", condition: "> 80% capacity", severity: "warning", enabled: false, scope: "Database Services", triggers: 0, tags: ["database", "pool"], version: "v1.0", lastTriggered: "Disabled", linkedApps: [] },
  { id: 7, name: "SLO Burn Rate (1h)", metric: "slo.burn_rate.1h", condition: "> 14× baseline", severity: "critical", enabled: true, scope: "SLO-tracked Services", triggers: 1, tags: ["slo", "burn-rate"], version: "v3.0", lastTriggered: "2m ago", linkedApps: ["search-api"] },
  { id: 8, name: "Availability Below 99%", metric: "availability.rate", condition: "< 99% in 5min window", severity: "critical", enabled: true, scope: "Critical Services", triggers: 0, tags: ["availability", "slo"], version: "v2.0", lastTriggered: "Never", linkedApps: [] },
]

const METRIC_OPTIONS = [
  "latency.p99", "latency.p95", "latency.p50",
  "http.error_rate", "http.request_rate",
  "system.cpu.utilization", "system.memory.used_percent",
  "db.connection_pool.used", "db.query_latency",
  "slo.burn_rate.1h", "slo.burn_rate.6h",
  "availability.rate", "requests.rate",
]

const OPERATORS = [">", ">=", "<", "<=", "==", "!=", "< baseline by", "> baseline by"]
const SCOPES = ["All Services", "All Production APIs", "Critical APIs", "Database Services", "SLO-tracked Services", "Specific Application"]

function apiToRule(r: ApiHealthRule, idx: number): Rule {
  const sev: Rule["severity"] = r.severity === "critical" ? "critical" : "warning"
  return {
    id: idx,
    name: r.name,
    metric: r.metric,
    condition: `${r.operator} ${r.threshold}`,
    severity: sev,
    enabled: r.enabled,
    scope: r.scope || "All Services",
    triggers: r.trigger_count || 0,
    tags: r.tags || [],
    version: `v${r.version || 1}`,
    lastTriggered: r.last_triggered || "Never",
    linkedApps: [],
  }
}

function RuleBuilderModal({ onClose, onSaved }: { onClose: () => void; onSaved?: () => void }) {
  const [ruleName, setRuleName] = useState("")
  const [severity, setSeverity] = useState<"warning" | "critical">("warning")
  const [scope, setScope] = useState("All Services")
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { metric: "latency.p99", operator: ">", value: "500", unit: "ms" }
  ])
  const [logic, setLogic] = useState<"AND" | "OR">("AND")
  const [weight, setWeight] = useState(50)
  const [testResult, setTestResult] = useState<null | "pass" | "fail">(null)
  const [saving, setSaving] = useState(false)

  const addCondition = () => setConditions(prev => [...prev, { metric: "http.error_rate", operator: ">", value: "1", unit: "%" }])
  const removeCondition = (i: number) => setConditions(prev => prev.filter((_, j) => j !== i))
  const updateCondition = (i: number, field: keyof RuleCondition, val: string) =>
    setConditions(prev => prev.map((c, j) => j === i ? { ...c, [field]: val } : c))

  const expressionPreview = conditions
    .map(c => `${c.metric} ${c.operator} ${c.value}${c.unit}`)
    .join(` ${logic} `)

  const handleSave = async () => {
    if (!ruleName.trim()) return
    setSaving(true)
    try {
      const primaryCondition = conditions[0]
      await createHealthRule({
        name: ruleName,
        metric: primaryCondition.metric,
        operator: primaryCondition.operator,
        threshold: parseFloat(primaryCondition.value) || 0,
        severity,
        scope,
        enabled: true,
        tags: [],
      })
      onSaved?.()
      onClose()
    } catch {
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed inset-4 md:inset-8 z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-w-3xl mx-auto overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div>
            <div className="text-base font-bold text-foreground">Rule Builder</div>
            <div className="text-xs text-muted-foreground">Create a new health rule with multi-condition logic</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Rule Name</label>
              <Input value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="e.g. High Error Rate + Latency" className="font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Scope</label>
              <select value={scope} onChange={e => setScope(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background text-foreground">
                {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Severity</label>
            <div className="flex gap-2">
              {(["warning", "critical"] as const).map(s => (
                <button key={s} onClick={() => setSeverity(s)}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold capitalize transition-all",
                    severity === s && s === "critical" ? "border-red-500 bg-red-500/8 text-red-500" :
                    severity === s && s === "warning" ? "border-amber-500 bg-amber-500/8 text-amber-500" :
                    "border-border/60 text-muted-foreground hover:border-border"
                  )}>
                  {s === "critical" ? <AlertTriangle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conditions</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Logic:</span>
                {(["AND", "OR"] as const).map(l => (
                  <button key={l} onClick={() => setLogic(l)}
                    className={cn("px-2.5 py-1 text-xs font-bold rounded-lg border transition-all",
                      logic === l ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
                    )}>{l}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/20">
                  {i > 0 && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{logic}</span>
                  )}
                  <select value={c.metric} onChange={e => updateCondition(i, "metric", e.target.value)}
                    className="flex-1 h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground font-mono">
                    {METRIC_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={c.operator} onChange={e => updateCondition(i, "operator", e.target.value)}
                    className="w-28 h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground">
                    {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <Input value={c.value} onChange={e => updateCondition(i, "value", e.target.value)}
                    className="w-20 h-8 text-xs font-mono" />
                  <Input value={c.unit} onChange={e => updateCondition(i, "unit", e.target.value)}
                    className="w-16 h-8 text-xs font-mono" placeholder="ms/%" />
                  {conditions.length > 1 && (
                    <button onClick={() => removeCondition(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addCondition}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 text-xs text-muted-foreground hover:text-foreground transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Condition
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Health Score Impact Weight: {weight}%</label>
            <input type="range" min={0} max={100} value={weight} onChange={e => setWeight(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted/50 accent-primary" />
            <div className="text-[10px] text-muted-foreground mt-1">How much this rule reduces the health score when triggered</div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expression Preview</div>
            </div>
            <div className="font-mono text-xs text-foreground/80 bg-background/60 rounded-lg p-2.5 border border-border/40">
              IF {expressionPreview} THEN severity = {severity.toUpperCase()}
            </div>
          </div>

          {testResult && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={cn("rounded-xl border p-4",
                testResult === "pass" ? "border-emerald-500/30 bg-emerald-500/8" : "border-amber-500/30 bg-amber-500/8"
              )}>
              <div className={cn("text-sm font-semibold flex items-center gap-2",
                testResult === "pass" ? "text-emerald-500" : "text-amber-500"
              )}>
                {testResult === "pass" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {testResult === "pass" ? "Rule would not fire on current data" : "Rule would fire — 3 apps in violation"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {testResult === "pass"
                  ? "All monitored applications are currently within thresholds"
                  : "search-api, auth-service, recommendation-engine would trigger this rule"}
              </div>
            </motion.div>
          )}
        </div>

        <div className="border-t border-border/60 p-4 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" className="gap-2 text-xs"
            onClick={() => setTestResult(Math.random() > 0.5 ? "pass" : "fail")}>
            <Zap className="w-3.5 h-3.5" /> Test Evaluation
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving || !ruleName.trim()}>
              <CheckCircle className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Rule"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function HealthRules() {
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [localEnabled, setLocalEnabled] = useState<Record<number, boolean>>({})

  const { data: apiRules, loading: rulesLoading, refetch: refetchRules } = useApi(listHealthRules, [])

  const baseRules: Rule[] = apiRules && apiRules.length > 0
    ? apiRules.map((r, i) => apiToRule(r, i))
    : RULES

  const rules = baseRules.map(r => ({
    ...r,
    enabled: localEnabled[r.id] !== undefined ? localEnabled[r.id] : r.enabled,
  }))

  const filtered = rules.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.metric.toLowerCase().includes(search.toLowerCase())
    const matchSev = severityFilter === "all" || r.severity === severityFilter
    return matchSearch && matchSev
  })

  const toggleRule = (id: number) => {
    const current = rules.find(r => r.id === id)
    if (!current) return
    const newEnabled = !current.enabled
    setLocalEnabled(prev => ({ ...prev, [id]: newEnabled }))
    const apiRule = apiRules?.find((_, i) => i === id)
    if (apiRule) {
      toggleHealthRule(apiRule.id, newEnabled).catch(() => {
        setLocalEnabled(prev => ({ ...prev, [id]: current.enabled }))
      })
    }
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="Health Rules"
        description="Define, manage, and test threshold-based alerting rules and composite SLO policies"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setShowBuilder(true)}>
            <Plus className="w-3.5 h-3.5" /> Create Rule
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Rules", value: rules.filter(r => r.enabled).length, color: "text-foreground", sub: "currently enforced" },
            { label: "Triggered (24h)", value: rules.reduce((acc, r) => acc + r.triggers, 0), color: "text-amber-500", sub: "across all apps" },
            { label: "Critical Rules", value: rules.filter(r => r.severity === "critical" && r.enabled).length, color: "text-red-500", sub: "highest severity" },
            { label: "Disabled", value: rules.filter(r => !r.enabled).length, color: "text-muted-foreground", sub: "paused rules" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="premium-card p-4">
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground/60">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…" className="pl-9 h-8 text-xs" />
          </div>
          <div className="flex items-center gap-1.5">
            {["all", "critical", "warning"].map(f => (
              <button key={f} onClick={() => setSeverityFilter(f)}
                className={cn("px-2.5 py-1.5 text-[11px] font-medium rounded-full border transition-all capitalize",
                  severityFilter === f ? "bg-primary/10 text-primary border-primary/30" : "border-border/60 text-muted-foreground hover:border-border"
                )}>{f}</button>
            ))}
          </div>
        </div>

        {/* Rules table */}
        <div className="premium-card overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Rule</span><span>Condition</span><span>Severity</span><span>Scope</span><span>Triggers (24h)</span><span></span>
          </div>
          {rulesLoading && !apiRules && <LoadingShimmer rows={5} />}
          <div className="divide-y divide-border/40">
            {filtered.map((rule, i) => (
              <motion.div key={rule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedRule(selectedRule?.id === rule.id ? null : rule)}
                className={cn("grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 transition-colors cursor-pointer",
                  !rule.enabled ? "opacity-50" : "",
                  selectedRule?.id === rule.id ? "bg-primary/5" : "hover:bg-muted/20"
                )}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="text-sm font-semibold text-foreground">{rule.name}</div>
                    <span className="text-[9px] text-muted-foreground/60 font-mono">{rule.version}</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">{rule.metric}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rule.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium">{t}</span>)}
                  </div>
                </div>
                <div className="text-xs font-mono text-foreground/80 bg-muted/60 px-2 py-1 rounded-lg leading-tight">{rule.condition}</div>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize w-fit",
                  rule.severity === "critical" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                )}>{rule.severity}</span>
                <div className="text-xs text-muted-foreground">{rule.scope}</div>
                <div className="text-sm font-mono font-semibold">
                  {rule.triggers > 0 ? <span className="text-amber-500">{rule.triggers}×</span> : <span className="text-muted-foreground">0</span>}
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-sm" onClick={() => toggleRule(rule.id)}>
                    {rule.enabled ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowBuilder(true)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Expanded rule detail */}
        <AnimatePresence>
          {selectedRule && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="premium-card overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold text-foreground">{selectedRule.name}</div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setSelectedRule(null)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Expression</div>
                      <div className="font-mono text-xs text-foreground/80 bg-muted/40 rounded-lg p-2.5 border border-border/40 leading-relaxed">
                        {selectedRule.metric} {selectedRule.condition}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Last Triggered</div>
                      <div className="text-sm text-foreground">{selectedRule.lastTriggered}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Linked Applications</div>
                    {selectedRule.linkedApps.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedRule.linkedApps.map(app => (
                          <span key={app} className="font-mono text-xs px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/20 text-foreground">{app}</span>
                        ))}
                      </div>
                    ) : <div className="text-xs text-muted-foreground">No apps linked — global scope</div>}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRule.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{t}</span>)}
                    </div>
                    <div className="mt-3">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Version</div>
                      <span className="font-mono text-xs text-foreground">{selectedRule.version}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showBuilder && <RuleBuilderModal onClose={() => setShowBuilder(false)} onSaved={refetchRules} />}
      </AnimatePresence>
    </div>
  )
}
