import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { X, ChevronRight, ChevronLeft, CircleCheck as CheckCircle, Zap, TriangleAlert as AlertTriangle, Loader } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CONNECTOR_TEMPLATES } from "./data"

interface Props {
  onClose: () => void
}

const WIZARD_STEPS = [
  { id: 0, label: "Choose Type", desc: "Select a connector template" },
  { id: 1, label: "Authentication", desc: "Configure credentials" },
  { id: 2, label: "Connection", desc: "Set endpoint details" },
  { id: 3, label: "Capabilities", desc: "Choose what to collect" },
  { id: 4, label: "Metric Templates", desc: "Select metric presets" },
  { id: 5, label: "Test & Preview", desc: "Validate connection" },
  { id: 6, label: "Review & Activate", desc: "Confirm and save" },
]

const CONNECTOR_AUTH_CONFIG: Record<string, { fields: { key: string; label: string; type: string; placeholder: string; hint?: string }[] }> = {
  datadog: {
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "dd-api-xxxxxxxxxxxx", hint: "Found in Datadog → Organization Settings → API Keys" },
      { key: "appKey", label: "Application Key", type: "password", placeholder: "dd-app-xxxxxxxxxxxx", hint: "Required for write operations and dashboards" },
      { key: "site", label: "Datadog Site", type: "text", placeholder: "datadoghq.com", hint: "e.g. datadoghq.eu for EU region" },
    ]
  },
  prometheus: {
    fields: [
      { key: "url", label: "Prometheus URL", type: "text", placeholder: "http://prometheus:9090", hint: "Base URL of your Prometheus instance" },
      { key: "username", label: "Username (optional)", type: "text", placeholder: "admin" },
      { key: "password", label: "Password (optional)", type: "password", placeholder: "••••••••" },
    ]
  },
  splunk: {
    fields: [
      { key: "url", label: "Splunk HEC URL", type: "text", placeholder: "https://splunk.example.com:8088", hint: "HTTP Event Collector endpoint" },
      { key: "token", label: "HEC Token", type: "password", placeholder: "Splunk xxxx-xxxx-xxxx" },
      { key: "index", label: "Default Index", type: "text", placeholder: "main", hint: "Default Splunk index for queries" },
    ]
  },
  appdynamics: {
    fields: [
      { key: "controllerUrl", label: "Controller URL", type: "text", placeholder: "https://company.saas.appdynamics.com", hint: "Your AppDynamics controller URL" },
      { key: "account", label: "Account Name", type: "text", placeholder: "company_prod" },
      { key: "clientId", label: "Client ID", type: "text", placeholder: "client@account" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "••••••••" },
    ]
  },
  custom: {
    fields: [
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://api.example.com/v1", hint: "Root URL for all API requests" },
      { key: "authType", label: "Auth Type", type: "text", placeholder: "Bearer / API Key / Basic" },
      { key: "token", label: "Token / Key", type: "password", placeholder: "your-api-token" },
      { key: "headers", label: "Extra Headers (JSON)", type: "text", placeholder: '{"X-Custom-Header": "value"}' },
    ]
  },
  database: {
    fields: [
      { key: "host", label: "Host", type: "text", placeholder: "db.internal.company.com", hint: "Database host or IP address" },
      { key: "port", label: "Port", type: "text", placeholder: "5432" },
      { key: "database", label: "Database Name", type: "text", placeholder: "production_db" },
      { key: "username", label: "Username", type: "text", placeholder: "healthmesh_reader" },
      { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
    ]
  },
}

const CAPABILITY_OPTIONS = [
  { id: "metrics", label: "Metrics", desc: "Time-series performance data" },
  { id: "traces", label: "Distributed Traces", desc: "Request flow and latency" },
  { id: "logs", label: "Log Events", desc: "Application and system logs" },
  { id: "alerts", label: "Alerting", desc: "Threshold-based notifications" },
  { id: "synthetic", label: "Synthetic Tests", desc: "Proactive health probes" },
  { id: "infra", label: "Infrastructure", desc: "Host / pod / container stats" },
]

const METRIC_PRESETS = [
  { id: "golden-signals", label: "Golden Signals", metrics: ["Latency P50/P95/P99", "Error Rate", "Throughput", "Saturation"], recommended: true },
  { id: "slo-pack", label: "SLO Pack", metrics: ["Availability %", "Error Budget", "SLA Compliance"], recommended: true },
  { id: "infra-pack", label: "Infrastructure Pack", metrics: ["CPU %", "Memory %", "Network I/O", "Disk Usage"] },
  { id: "db-pack", label: "Database Pack", metrics: ["Query Latency", "Connection Pool", "Replication Lag", "Lock Waits"] },
]

export function AddConnectorWizard({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [authFields, setAuthFields] = useState<Record<string, string>>({})
  const [connectorName, setConnectorName] = useState("")
  const [environment, setEnvironment] = useState("Production")
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(["metrics", "alerts"])
  const [selectedPresets, setSelectedPresets] = useState<string[]>(["golden-signals", "slo-pack"])
  const [testState, setTestState] = useState<"idle" | "testing" | "success" | "error">("idle")

  const template = CONNECTOR_TEMPLATES.find(t => t.id === selectedTemplate)
  const authConfig = selectedTemplate ? (CONNECTOR_AUTH_CONFIG[selectedTemplate] || CONNECTOR_AUTH_CONFIG.custom) : null

  const toggleCap = (id: string) =>
    setSelectedCapabilities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const togglePreset = (id: string) =>
    setSelectedPresets(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const runTest = () => {
    setTestState("testing")
    setTimeout(() => setTestState("success"), 2000)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed inset-4 md:inset-8 z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-4xl mx-auto"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div>
            <div className="text-base font-bold text-foreground">Add Connector</div>
            <div className="text-xs text-muted-foreground">{WIZARD_STEPS[step].desc}</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        {/* Step progress */}
        <div className="flex items-center px-6 py-3 border-b border-border/40 gap-0 overflow-x-auto">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center shrink-0">
              <button
                onClick={() => i <= step && setStep(i)}
                className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                  i === step ? "text-primary" :
                  i < step ? "text-foreground cursor-pointer hover:bg-muted/50" :
                  "text-muted-foreground/50 cursor-default"
                )}
              >
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border",
                  i < step ? "bg-primary border-primary text-primary-foreground" :
                  i === step ? "border-primary text-primary bg-primary/5" :
                  "border-border text-muted-foreground"
                )}>
                  {i < step ? <CheckCircle className="w-3 h-3" /> : i + 1}
                </div>
                <span className="hidden sm:block whitespace-nowrap">{s.label}</span>
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <div className={cn("w-6 h-px mx-1 shrink-0", i < step ? "bg-primary/40" : "bg-border/60")} />
              )}
            </div>
          ))}
        </div>

        {/* Step body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }} className="space-y-5">

                {/* Step 0: Choose Type */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-foreground mb-0.5">Choose Connector Type</div>
                      <div className="text-sm text-muted-foreground">Select the platform or service you want to connect to HealthMesh.</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CONNECTOR_TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setSelectedTemplate(t.id); setConnectorName(t.name) }}
                          className={cn(
                            "flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150",
                            selectedTemplate === t.id
                              ? "border-primary bg-primary/8 shadow-sm"
                              : "border-border/60 hover:border-border hover:bg-muted/20"
                          )}
                        >
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0", t.iconBg)}>{t.abbr}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground leading-tight">{t.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{t.description}</div>
                            <Badge variant="secondary" size="sm" className="mt-1">{t.category}</Badge>
                          </div>
                          {selectedTemplate === t.id && (
                            <CheckCircle className="w-4 h-4 text-primary ml-auto shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Auth */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-foreground mb-0.5">Authentication</div>
                      <div className="text-sm text-muted-foreground">Configure credentials for {template?.name}.</div>
                    </div>
                    {authConfig && (
                      <div className="space-y-3">
                        {authConfig.fields.map(f => (
                          <div key={f.key}>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{f.label}</label>
                            <Input
                              type={f.type}
                              placeholder={f.placeholder}
                              value={authFields[f.key] || ""}
                              onChange={e => setAuthFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                              className="font-mono"
                            />
                            {f.hint && <div className="text-[10px] text-muted-foreground mt-1">{f.hint}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security Note</div>
                      <p className="text-xs text-muted-foreground">Credentials are encrypted at rest using AES-256 and never logged. HealthMesh uses read-only API scopes wherever possible.</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Connection details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-foreground mb-0.5">Connection Details</div>
                      <div className="text-sm text-muted-foreground">Name this connector and set its scope.</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Connector Name</label>
                        <Input value={connectorName} onChange={e => setConnectorName(e.target.value)} placeholder={`${template?.name} (Production)`} className="font-mono" />
                        <div className="text-[10px] text-muted-foreground mt-1">A display name for this connector instance</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Environment</label>
                        <div className="flex gap-2">
                          {["Production", "Staging", "Development"].map(env => (
                            <button key={env} onClick={() => setEnvironment(env)}
                              className={cn("px-3 py-1.5 text-xs font-medium rounded-lg border transition-all",
                                environment === env ? "border-primary bg-primary/8 text-primary" : "border-border/60 text-muted-foreground hover:border-border"
                              )}>
                              {env}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sync Interval</label>
                        <div className="flex gap-2">
                          {["15s", "30s", "1m", "5m"].map(t => (
                            <button key={t}
                              className="px-3 py-1.5 text-xs font-medium font-mono rounded-lg border border-border/60 text-muted-foreground hover:border-border transition-all">
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Capabilities */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-foreground mb-0.5">Capabilities & Scope</div>
                      <div className="text-sm text-muted-foreground">Choose what data HealthMesh will collect from this connector.</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {CAPABILITY_OPTIONS.map(cap => (
                        <button key={cap.id} onClick={() => toggleCap(cap.id)}
                          className={cn("flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                            selectedCapabilities.includes(cap.id)
                              ? "border-primary bg-primary/8"
                              : "border-border/60 hover:border-border"
                          )}>
                          <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            selectedCapabilities.includes(cap.id) ? "bg-primary border-primary" : "border-border"
                          )}>
                            {selectedCapabilities.includes(cap.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{cap.label}</div>
                            <div className="text-[10px] text-muted-foreground">{cap.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-3.5">
                      <div className="text-xs text-primary font-medium">{selectedCapabilities.length} capabilities selected</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Only selected capabilities will be requested from the connector API.</div>
                    </div>
                  </div>
                )}

                {/* Step 4: Metric templates */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-foreground mb-0.5">Metric Templates</div>
                      <div className="text-sm text-muted-foreground">Select pre-built metric packs to apply instantly.</div>
                    </div>
                    <div className="space-y-3">
                      {METRIC_PRESETS.map(preset => (
                        <button key={preset.id} onClick={() => togglePreset(preset.id)}
                          className={cn("w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                            selectedPresets.includes(preset.id)
                              ? "border-primary bg-primary/5"
                              : "border-border/60 hover:border-border"
                          )}>
                          <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            selectedPresets.includes(preset.id) ? "bg-primary border-primary" : "border-border"
                          )}>
                            {selectedPresets.includes(preset.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-foreground">{preset.label}</div>
                              {preset.recommended && <Badge variant="healthy" size="sm">Recommended</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {preset.metrics.map(m => (
                                <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">{m}</span>
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Test & Preview */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-foreground mb-0.5">Test Connection</div>
                      <div className="text-sm text-muted-foreground">Validate the connection before activating.</div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Connector</span>
                        <span className="font-semibold font-mono text-foreground">{connectorName || template?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Template</span>
                        <span className="font-semibold text-foreground">{template?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Environment</span>
                        <span className="font-semibold text-foreground">{environment}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capabilities</span>
                        <span className="font-semibold text-foreground">{selectedCapabilities.length} selected</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {testState === "idle" && (
                        <Button className="w-full gap-2" onClick={runTest}>
                          <Zap className="w-4 h-4" /> Test Connection
                        </Button>
                      )}
                      {testState === "testing" && (
                        <div className="flex items-center justify-center gap-3 py-4 rounded-xl border border-border/60 bg-muted/20">
                          <Loader className="w-4 h-4 text-primary animate-spin" />
                          <span className="text-sm text-muted-foreground">Connecting to {template?.name}…</span>
                        </div>
                      )}
                      {testState === "success" && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" /> Connection Successful
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {["Authentication: Verified", "API Access: Read-only granted", "Metric Discovery: 284 metrics found", "Latency: 38ms"].map(l => (
                              <div key={l} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {l}
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" className="gap-2 text-xs mt-1" onClick={runTest}>
                            <Zap className="w-3.5 h-3.5" /> Re-test
                          </Button>
                        </motion.div>
                      )}
                      {testState === "error" && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                            <AlertTriangle className="w-4 h-4" /> Connection Failed
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Could not reach the endpoint. Check your credentials and network.</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Review & Activate */}
                {step === 6 && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-base font-bold text-foreground mb-0.5">Review & Activate</div>
                      <div className="text-sm text-muted-foreground">Everything looks good. Activate your connector.</div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3">
                      {[
                        { label: "Connector Name", value: connectorName || template?.name },
                        { label: "Template", value: template?.name },
                        { label: "Category", value: template?.category },
                        { label: "Environment", value: environment },
                        { label: "Capabilities", value: `${selectedCapabilities.length} selected` },
                        { label: "Metric Packs", value: `${selectedPresets.length} selected` },
                        { label: "Connection Test", value: testState === "success" ? "Passed" : "Skipped" },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{r.label}</span>
                          <span className={cn("font-semibold", r.value === "Passed" ? "text-emerald-500" : r.value === "Skipped" ? "text-amber-500" : "text-foreground")}>{r.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="text-xs font-semibold text-primary mb-1">What happens next</div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• Connector will begin syncing on its first poll cycle</li>
                        <li>• Metrics will appear in Application 360 within ~30 seconds</li>
                        <li>• You can bind apps to this connector from the Onboarding Studio</li>
                      </ul>
                    </div>

                    <Button className="w-full gap-2 h-11 text-sm font-semibold" onClick={onClose}>
                      <Zap className="w-4 h-4" /> Activate Connector
                    </Button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => step > 0 ? setStep(step - 1) : onClose()} >
            <ChevronLeft className="w-3.5 h-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="text-xs text-muted-foreground">Step {step + 1} of {WIZARD_STEPS.length}</div>
          <Button size="sm" className="gap-2"
            onClick={() => step < WIZARD_STEPS.length - 1 ? setStep(step + 1) : onClose()}
            disabled={step === 0 && !selectedTemplate}
          >
            {step === WIZARD_STEPS.length - 1 ? "Done" : "Continue"} <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    </>
  )
}
