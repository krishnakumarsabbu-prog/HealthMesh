import { motion, AnimatePresence } from "framer-motion"
import React, { useState } from "react"
import {
  Wand as Wand2, Server, CircleCheck as CheckCircle, ChevronRight, ChevronLeft,
  Zap, LayoutGrid, Sparkles, TriangleAlert as AlertTriangle
} from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ONBOARDING_STEPS, AVAILABLE_CONNECTORS, AVAILABLE_METRICS,
  DEFAULT_THRESHOLDS, DEFAULT_WEIGHTS, RECENT_ONBOARDINGS,
  type ThresholdConfig, type WeightConfig
} from "./onboarding/data"
import { StepSummary } from "./onboarding/StepSummary"
import { HealthScorePreview } from "./onboarding/HealthScorePreview"
import { createApp } from "@/lib/api/apps"
import { listTeams } from "@/lib/api/misc"
import { useApi } from "@/hooks/useApi"
import {
  listConnectorInstances, type ConnectorInstanceRow
} from "@/lib/api/connectors"
import {
  listAvailableMetrics, listHealthScoreWeights, listEnvironments,
  type AvailableMetric, type HealthScoreWeight
} from "@/lib/api/dynamic"

const CRITICALITIES = ["P0 — Mission Critical", "P1 — High", "P2 — Medium", "P3 — Low"]
const APP_TYPES = ["REST API", "GraphQL API", "gRPC Service", "Frontend App", "Worker / Job", "Database", "Message Queue", "Gateway"]

function toThresholdConfigs(metrics: AvailableMetric[]): ThresholdConfig[] {
  return DEFAULT_THRESHOLDS.filter(t => metrics.some(m => m.id === t.metricId))
}

function toWeightConfigs(weights: HealthScoreWeight[]): WeightConfig[] {
  return weights.map(w => ({ label: w.label, weight: w.weight, color: w.color }))
}

export function OnboardingStudio() {
  const [step, setStep] = useState(0)

  const [appName, setAppName] = useState("")
  const [environment, setEnvironment] = useState("Production")
  const [appType, setAppType] = useState("REST API")
  const [runtime, setRuntime] = useState("")

  const [team, setTeam] = useState("")
  const [owner, setOwner] = useState("")
  const [criticality, setCriticality] = useState("P1 — High")
  const [description, setDescription] = useState("")

  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["latency_p99", "error_rate", "availability", "incidents_open", "slo_budget"])

  const [thresholds, setThresholds] = useState<ThresholdConfig[]>(DEFAULT_THRESHOLDS)
  const [weights, setWeights] = useState<WeightConfig[]>(DEFAULT_WEIGHTS)

  const [activationDone, setActivationDone] = useState(false)
  const [activating, setActivating] = useState(false)

  const { data: teamsData } = useApi(listTeams, [])
  const teamSuggestions = teamsData?.map(t => t.name) ?? []

  const { data: apiConnectors } = useApi(listConnectorInstances)
  const { data: apiMetrics } = useApi(listAvailableMetrics)
  const { data: apiWeights } = useApi(listHealthScoreWeights)
  const { data: apiEnvironments } = useApi(listEnvironments)

  const availableConnectors = apiConnectors && apiConnectors.length > 0
    ? apiConnectors.filter(c => c.status === "active").map((c: ConnectorInstanceRow) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        abbr: c.abbr || c.name.slice(0, 2).toUpperCase(),
        iconBg: c.icon_bg || "bg-muted text-muted-foreground",
        status: (c.status as "active" | "warning" | "error" | "inactive"),
      }))
    : AVAILABLE_CONNECTORS

  const availableMetrics: AvailableMetric[] = (apiMetrics && apiMetrics.length > 0)
    ? apiMetrics
    : AVAILABLE_METRICS.map(m => ({ id: m.id, label: m.label, connector_name: m.connector, metric_type: m.type, recommended: m.recommended, display_order: 0 }))

  const ENVIRONMENTS = apiEnvironments && apiEnvironments.length > 0
    ? apiEnvironments.map(e => e.name)
    : ["Production", "Staging", "Development"]

  React.useEffect(() => {
    if (apiWeights && apiWeights.length > 0) {
      setWeights(toWeightConfigs(apiWeights))
    }
  }, [apiWeights])

  React.useEffect(() => {
    if (apiMetrics && apiMetrics.length > 0) {
      setThresholds(toThresholdConfigs(apiMetrics))
    }
  }, [apiMetrics])

  React.useEffect(() => {
    if (apiConnectors && apiConnectors.length > 0) {
      const firstActive = apiConnectors.find(c => c.status === "active")
      if (firstActive) setSelectedConnectors([firstActive.id])
    }
  }, [apiConnectors])

  const handleActivate = async () => {
    setActivating(true)
    try {
      await createApp({
        name: appName,
        environment,
        app_type: appType,
        runtime,
        team_id: team,
        owner_name: owner,
        criticality: criticality.split(" — ")[0],
        description,
        status: "healthy",
      })
    } catch {
    } finally {
      setActivating(false)
      setActivationDone(true)
    }
  }

  const toggleConnector = (id: string) =>
    setSelectedConnectors(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleMetric = (id: string) =>
    setSelectedMetrics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const updateWeight = (label: string, val: number) =>
    setWeights(prev => prev.map(w => w.label === label ? { ...w, weight: val } : w))

  const updateThreshold = (metricId: string, field: "warnValue" | "critValue", val: string) =>
    setThresholds(prev => prev.map(t => t.metricId === metricId ? { ...t, [field]: val } : t))

  const totalWeight = weights.reduce((s, w) => s + w.weight, 0)

  return (
    <div className="min-h-full">
      <PageHeader
        title="Onboarding Studio"
        description="Instrument any application with HealthMesh in minutes — guided, visual, no-code"
        badge={<Badge variant="secondary" size="sm"><Wand2 className="w-3 h-3 mr-1" /> Studio</Badge>}
        actions={
          <Button size="sm" className="gap-2" onClick={() => { setStep(0); setAppName(""); setActivationDone(false) }}>
            <Wand2 className="w-3.5 h-3.5" /> New Application
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Recent onboardings strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RECENT_ONBOARDINGS.map((app, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="premium-card p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Server className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold font-mono text-foreground truncate">{app.name}</div>
                <div className="text-[10px] text-muted-foreground">{app.team} · {app.date}</div>
              </div>
              {app.status === "complete"
                ? <div className="flex flex-col items-end gap-0.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {app.score != null && <span className="text-[10px] font-mono font-bold text-emerald-500">{app.score}</span>}
                  </div>
                : <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              }
            </motion.div>
          ))}
        </div>

        {/* Main wizard */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

          {/* Left: step nav sidebar */}
          <div className="premium-card p-4 sticky top-4">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Setup Progress</div>
            <StepSummary
              currentStep={step}
              appName={appName}
              team={team}
              environment={environment}
              selectedConnectors={selectedConnectors}
              selectedMetrics={selectedMetrics}
            />
          </div>

          {/* Right: step content */}
          <div className="premium-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">{ONBOARDING_STEPS[step].label}</div>
                <div className="text-xs text-muted-foreground">{ONBOARDING_STEPS[step].desc}</div>
              </div>
              <div className="flex items-center gap-1.5">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div key={i} className={cn("rounded-full transition-all duration-300",
                    i === step ? "w-5 h-1.5 bg-primary" :
                    i < step ? "w-1.5 h-1.5 bg-primary/50" :
                    "w-1.5 h-1.5 bg-border"
                  )} />
                ))}
              </div>
            </div>

            <div className="p-6 min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.2 }} className="space-y-5">

                  {/* STEP 0: App Basics */}
                  {step === 0 && (
                    <div className="space-y-4 max-w-lg">
                      <div className="text-base font-bold text-foreground">What are you monitoring?</div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Application Name</label>
                          <Input value={appName} onChange={e => setAppName(e.target.value)} placeholder="e.g. payments-api, checkout-service" className="font-mono text-sm" />
                          <div className="text-[10px] text-muted-foreground mt-1">Use kebab-case to match your service registry naming</div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Environment</label>
                          <div className="flex gap-2 flex-wrap">
                            {ENVIRONMENTS.map(env => (
                              <button key={env} onClick={() => setEnvironment(env)}
                                className={cn("px-3.5 py-2 text-xs font-medium rounded-xl border-2 transition-all",
                                  environment === env ? "border-primary bg-primary/8 text-primary" : "border-border/60 text-muted-foreground hover:border-border"
                                )}>
                                {env}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Application Type</label>
                          <div className="flex gap-2 flex-wrap">
                            {APP_TYPES.map(t => (
                              <button key={t} onClick={() => setAppType(t)}
                                className={cn("px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                                  appType === t ? "border-primary bg-primary/8 text-primary" : "border-border/60 text-muted-foreground hover:border-border"
                                )}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Runtime / Platform (optional)</label>
                          <Input value={runtime} onChange={e => setRuntime(e.target.value)} placeholder="e.g. Kubernetes, ECS, Lambda, Node.js 20" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 1: Ownership */}
                  {step === 1 && (
                    <div className="space-y-4 max-w-lg">
                      <div className="text-base font-bold text-foreground">Who owns this application?</div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Owning Team</label>
                            <Input value={team} onChange={e => setTeam(e.target.value)} placeholder="e.g. Payments, Platform" list="team-suggestions" />
                            {teamSuggestions.length > 0 && (
                              <datalist id="team-suggestions">
                                {teamSuggestions.map(t => <option key={t} value={t} />)}
                              </datalist>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Primary Owner</label>
                            <Input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. sarah.chen" className="font-mono" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Business Criticality</label>
                          <div className="space-y-2">
                            {CRITICALITIES.map(c => (
                              <button key={c} onClick={() => setCriticality(c)}
                                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                                  criticality === c ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                                )}>
                                <div className={cn("w-3 h-3 rounded-full border-2 shrink-0 transition-colors",
                                  criticality === c ? "bg-primary border-primary" : "border-border"
                                )} />
                                <div>
                                  <span className={cn("text-sm font-semibold", criticality === c ? "text-primary" : "text-foreground")}>{c.split(" — ")[0]}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{c.split(" — ")[1]}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description (optional)</label>
                          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description of this application's purpose" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Select Connectors */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-base font-bold text-foreground">Connect Data Sources</div>
                        <div className="text-sm text-muted-foreground">Choose which connectors will provide signals for this application.</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableConnectors.map(conn => (
                          <button key={conn.id} onClick={() => toggleConnector(conn.id)}
                            className={cn("flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                              selectedConnectors.includes(conn.id)
                                ? "border-primary bg-primary/5"
                                : "border-border/60 hover:border-border"
                            )}>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0", conn.iconBg)}>
                              {conn.abbr}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-foreground leading-tight">{conn.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" size="sm">{conn.category}</Badge>
                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                  conn.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                                <span className="text-[10px] text-muted-foreground capitalize">{conn.status}</span>
                              </div>
                            </div>
                            {selectedConnectors.includes(conn.id) && (
                              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5 flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-primary shrink-0" />
                        <div className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{selectedConnectors.length} connector{selectedConnectors.length !== 1 ? "s" : ""} selected.</span>{" "}
                          HealthMesh will auto-discover available metrics from each connector.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Choose Metrics */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-base font-bold text-foreground">Bind Signals</div>
                        <div className="text-sm text-muted-foreground">Choose which metrics will drive the health score for this application.</div>
                      </div>
                      <div className="space-y-2">
                        {availableMetrics.map(m => (
                          <button key={m.id} onClick={() => toggleMetric(m.id)}
                            className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                              selectedMetrics.includes(m.id)
                                ? "border-primary bg-primary/5"
                                : "border-border/60 hover:border-border"
                            )}>
                            <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                              selectedMetrics.includes(m.id) ? "bg-primary border-primary" : "border-border"
                            )}>
                              {selectedMetrics.includes(m.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-foreground">{m.label}</span>
                              <span className="text-[10px] text-muted-foreground ml-2 font-mono">{m.connector_name}</span>
                            </div>
                            <Badge variant="secondary" size="sm">{m.metric_type}</Badge>
                            {m.recommended && <Badge variant="healthy" size="sm">Recommended</Badge>}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground text-right">{selectedMetrics.length} metrics selected</div>
                    </div>
                  )}

                  {/* STEP 4: Thresholds */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-base font-bold text-foreground">Configure Thresholds</div>
                        <div className="text-sm text-muted-foreground">Set warning and critical values for each signal.</div>
                      </div>
                      <div className="premium-card overflow-hidden">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 px-4 py-2.5 border-b border-border/60 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <span>Metric</span>
                          <span>Unit</span>
                          <span className="text-amber-500">Warn</span>
                          <span className="text-red-500">Critical</span>
                        </div>
                        <div className="divide-y divide-border/40">
                          {thresholds.map((t, i) => (
                            <div key={t.metricId} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 items-center px-4 py-3">
                              <div>
                                <div className="text-xs font-semibold text-foreground">{t.label}</div>
                                <div className="text-[10px] text-muted-foreground capitalize">{t.direction} threshold</div>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">{t.unit || "—"}</div>
                              <Input
                                value={t.warnValue}
                                onChange={e => updateThreshold(t.metricId, "warnValue", e.target.value)}
                                className="h-7 text-xs font-mono border-amber-500/40 focus:border-amber-500"
                              />
                              <Input
                                value={t.critValue}
                                onChange={e => updateThreshold(t.metricId, "critValue", e.target.value)}
                                className="h-7 text-xs font-mono border-red-500/40 focus:border-red-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        Smart defaults based on industry baselines. You can adjust these anytime after activation.
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Assign Weights */}
                  {step === 5 && (
                    <div className="space-y-5">
                      <div>
                        <div className="text-base font-bold text-foreground">Assign Signal Weights</div>
                        <div className="text-sm text-muted-foreground">Control how much each signal contributes to the composite health score.</div>
                      </div>
                      <div className="space-y-4">
                        {weights.map(w => (
                          <div key={w.label} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: w.color }} />
                                <span className="text-sm font-semibold text-foreground">{w.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number" min="0" max="100"
                                  value={w.weight}
                                  onChange={e => updateWeight(w.label, Number(e.target.value))}
                                  className="h-7 w-16 text-xs font-mono text-right"
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                            <input type="range" min="0" max="50" value={w.weight}
                              onChange={e => updateWeight(w.label, Number(e.target.value))}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted/50"
                              style={{ accentColor: w.color }}
                            />
                          </div>
                        ))}
                        <div className={cn("flex items-center justify-between text-sm font-bold pt-2 border-t border-border/60",
                          totalWeight === 100 ? "text-emerald-500" : "text-amber-500"
                        )}>
                          <span>Total Weight</span>
                          <span className="font-mono">{totalWeight}%</span>
                        </div>
                        {totalWeight !== 100 && (
                          <div className="flex items-center gap-2 text-xs text-amber-500">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Weights should sum to 100%. Current total: {totalWeight}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Health Score Preview */}
                  {step === 6 && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-base font-bold text-foreground">Health Score Preview</div>
                        <div className="text-sm text-muted-foreground">Simulated health score based on your configuration and industry baselines.</div>
                      </div>
                      <HealthScorePreview weights={weights} appName={appName} />
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score Formula</div>
                        <div className="font-mono text-xs text-foreground/80 leading-relaxed">
                          score = {weights.map(w => `(${w.label.toLowerCase()}_score × ${w.weight / 100})`).join(" + ")}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 7: Dashboard Preview */}
                  {step === 7 && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-base font-bold text-foreground">Dashboard Layout Preview</div>
                        <div className="text-sm text-muted-foreground">Your Application 360 view will include these panels.</div>
                      </div>
                      <div className="rounded-xl border-2 border-dashed border-border/60 p-4 bg-muted/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Server className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-xs font-bold font-mono text-foreground">{appName || "your-app"}</div>
                              <div className="text-[10px] text-muted-foreground">{environment} · {appType}</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-emerald-500">94</div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {["Uptime", "P99 Latency", "Error Rate", "Throughput"].map(label => (
                            <div key={label} className="rounded-lg bg-muted/40 border border-border/40 p-2 text-center">
                              <div className="text-xs font-bold text-foreground">—</div>
                              <div className="text-[9px] text-muted-foreground">{label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {["Overview", "Signals", "Transactions", "Logs", "Infra", "APIs"].map(tab => (
                            <div key={tab} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/30 text-[10px] text-muted-foreground">
                              <LayoutGrid className="w-2.5 h-2.5" />
                              {tab} tab
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">Tabs and widget content will auto-populate from your connected data sources. You can customize layout after activation.</div>
                    </div>
                  )}

                  {/* STEP 8: Save & Activate */}
                  {step === 8 && (
                    <div className="space-y-4">
                      {!activationDone ? (
                        <>
                          <div>
                            <div className="text-base font-bold text-foreground">Ready to Activate</div>
                            <div className="text-sm text-muted-foreground">Review your configuration and go live.</div>
                          </div>

                          <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3">
                            {[
                              { label: "Application", value: appName || "—" },
                              { label: "Environment", value: environment },
                              { label: "Type", value: appType },
                              { label: "Team", value: team || "—" },
                              { label: "Owner", value: owner || "—" },
                              { label: "Criticality", value: criticality.split(" — ")[0] },
                              { label: "Connectors", value: `${selectedConnectors.length} linked` },
                              { label: "Signals", value: `${selectedMetrics.length} metrics` },
                              { label: "Health Rules", value: `${DEFAULT_THRESHOLDS.length} configured` },
                            ].map((r, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{r.label}</span>
                                <span className="font-semibold font-mono text-foreground">{r.value}</span>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                            <div className="text-xs font-semibold text-primary mb-1.5">After activation</div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              <li>• First health score within 30 seconds</li>
                              <li>• Application 360 view available immediately</li>
                              <li>• Historical data populated within 5 minutes</li>
                              <li>• Alerting rules take effect on first evaluation cycle</li>
                            </ul>
                          </div>

                          <Button className="w-full gap-2 h-11 text-sm font-semibold" onClick={handleActivate} disabled={activating || !appName.trim()}>
                            <Zap className="w-4 h-4" /> {activating ? "Activating…" : `Activate ${appName || "Application"}`}
                          </Button>
                        </>
                      ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                            className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center"
                          >
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                          </motion.div>
                          <div>
                            <div className="text-lg font-bold text-foreground mb-1">
                              {appName || "Application"} is live
                            </div>
                            <div className="text-sm text-muted-foreground max-w-xs">
                              HealthMesh is now monitoring your application. First metrics will appear in Application 360 within 30 seconds.
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => { setStep(0); setActivationDone(false); setAppName("") }}>
                              <Wand2 className="w-3.5 h-3.5" /> Add Another
                            </Button>
                            <Button size="sm" className="gap-2">
                              <LayoutGrid className="w-3.5 h-3.5" /> View in App 360
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {!activationDone && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
                <Button variant="outline" size="sm" className="gap-2"
                  onClick={() => step > 0 ? setStep(step - 1) : undefined}
                  disabled={step === 0}>
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </Button>
                <div className="text-xs text-muted-foreground">Step {step + 1} of {ONBOARDING_STEPS.length}</div>
                {step < ONBOARDING_STEPS.length - 1 && (
                  <Button size="sm" className="gap-2"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 0 && !appName.trim()}>
                    Continue <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                )}
                {step === ONBOARDING_STEPS.length - 1 && <div />}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
