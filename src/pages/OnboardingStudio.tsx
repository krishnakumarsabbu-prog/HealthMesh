import { motion } from "framer-motion"
import { useState } from "react"
import { Wand as Wand2, Server, CircleCheck as CheckCircle2, Circle, ArrowRight, ArrowLeft, Plug2, Settings, Zap } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STEPS = ["Application Details", "Connector Setup", "Health Rules", "Review & Activate"]

const CONNECTOR_OPTIONS = [
  { id: "datadog", name: "Datadog", icon: "🐶", desc: "APM, metrics, traces" },
  { id: "prometheus", name: "Prometheus", icon: "🔥", desc: "Metrics scraping" },
  { id: "cloudwatch", name: "CloudWatch", icon: "☁️", desc: "AWS infrastructure" },
  { id: "newrelic", name: "New Relic", icon: "🚀", desc: "Full-stack observability" },
  { id: "grafana", name: "Grafana", icon: "📊", desc: "Dashboards & alerts" },
  { id: "pagerduty", name: "PagerDuty", icon: "🔔", desc: "Incident management" },
]

const RECENT_ONBOARDINGS = [
  { name: "billing-service", team: "Finance", date: "2h ago", status: "complete" },
  { name: "content-cdn", team: "Content", date: "1d ago", status: "complete" },
  { name: "analytics-pipeline", team: "Data", date: "2d ago", status: "in-progress" },
]

export function OnboardingStudio() {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>(["datadog"])
  const [appName, setAppName] = useState("")
  const [team, setTeam] = useState("")

  const toggleConnector = (id: string) => {
    setSelectedConnectors(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-full">
      <PageHeader
        title="Onboarding Studio"
        description="Connect a new application to HealthMesh in minutes with guided setup"
      />

      <div className="px-6 pb-6 space-y-6">
        {/* Recent onboardings */}
        <div className="grid grid-cols-3 gap-4">
          {RECENT_ONBOARDINGS.map((app, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="premium-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Server className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold font-mono text-foreground truncate">{app.name}</div>
                <div className="text-xs text-muted-foreground">{app.team} · {app.date}</div>
              </div>
              {app.status === "complete"
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                : <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              }
            </motion.div>
          ))}
        </div>

        {/* Wizard */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="premium-card overflow-hidden">

          {/* Step indicators */}
          <div className="flex border-b border-border/60">
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={cn(
                  "flex-1 flex items-center gap-2 px-4 py-3.5 text-xs font-medium transition-colors text-left border-b-2",
                  i === activeStep
                    ? "border-primary text-primary bg-primary/5"
                    : i < activeStep
                    ? "border-transparent text-muted-foreground hover:text-foreground"
                    : "border-transparent text-muted-foreground/50"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  i < activeStep ? "bg-primary text-primary-foreground" :
                  i === activeStep ? "border-2 border-primary text-primary" : "border-2 border-border text-muted-foreground"
                )}>
                  {i < activeStep ? "✓" : i + 1}
                </div>
                <span className="hidden sm:block">{step}</span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="p-6">
            {activeStep === 0 && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 max-w-lg">
                <div>
                  <div className="text-base font-semibold text-foreground mb-1">Application Details</div>
                  <div className="text-sm text-muted-foreground">Tell us about the application you want to monitor.</div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Application Name</label>
                    <Input value={appName} onChange={e => setAppName(e.target.value)} placeholder="e.g. payments-api, auth-service" className="font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Owning Team</label>
                    <Input value={team} onChange={e => setTeam(e.target.value)} placeholder="e.g. Platform, Payments, ML" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Environment</label>
                    <div className="flex gap-2">
                      {["Production", "Staging", "Development"].map(env => (
                        <button key={env} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                          {env}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <div className="text-base font-semibold text-foreground mb-1">Connect Data Sources</div>
                  <div className="text-sm text-muted-foreground">Select the tools and platforms to pull metrics and events from.</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CONNECTOR_OPTIONS.map(conn => (
                    <button
                      key={conn.id}
                      onClick={() => toggleConnector(conn.id)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150",
                        selectedConnectors.includes(conn.id)
                          ? "border-primary bg-primary/8 shadow-sm"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <span className="text-xl">{conn.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">{conn.name}</div>
                        <div className="text-[10px] text-muted-foreground">{conn.desc}</div>
                      </div>
                      {selectedConnectors.includes(conn.id) && (
                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 max-w-lg">
                <div>
                  <div className="text-base font-semibold text-foreground mb-1">Health Rules</div>
                  <div className="text-sm text-muted-foreground">Configure alerting thresholds for this application.</div>
                </div>
                <div className="space-y-3">
                  {["P99 Latency > 500ms", "Error Rate > 1%", "Memory > 85%", "CPU > 90% for 10min"].map((rule, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-mono text-foreground">{rule}</span>
                      <Badge variant="secondary" size="sm" className="ml-auto">Default</Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 max-w-lg">
                <div>
                  <div className="text-base font-semibold text-foreground mb-1">Ready to Activate</div>
                  <div className="text-sm text-muted-foreground">Review your configuration and activate monitoring.</div>
                </div>
                <div className="rounded-xl border border-border/60 p-4 space-y-3 bg-muted/20">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Application</span><span className="font-semibold font-mono">{appName || "payments-service"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Team</span><span className="font-semibold">{team || "Platform"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Connectors</span><span className="font-semibold">{selectedConnectors.length} selected</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Health Rules</span><span className="font-semibold">4 default rules</span></div>
                </div>
                <Button className="gap-2 w-full" size="lg">
                  <Zap className="w-4 h-4" /> Activate Monitoring
                </Button>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
            <Button variant="outline" size="sm" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <div className="text-xs text-muted-foreground">Step {activeStep + 1} of {STEPS.length}</div>
            <Button size="sm" onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))} disabled={activeStep === STEPS.length - 1} className="gap-2">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
