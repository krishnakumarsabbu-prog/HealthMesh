import { useState } from "react"
import { Bell, Mail, Slack, Phone, MessageSquare, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const CHANNELS = [
  { id: "email", label: "Email", icon: Mail, connected: true, value: "ops-alerts@acme.io" },
  { id: "slack", label: "Slack", icon: Slack, connected: true, value: "#platform-alerts" },
  { id: "pagerduty", label: "PagerDuty", icon: Phone, connected: true, value: "Integration Key: ****7a2c" },
  { id: "teams", label: "Microsoft Teams", icon: MessageSquare, connected: false, value: "" },
  { id: "webhook", label: "Custom Webhook", icon: Webhook, connected: false, value: "" },
]

type Severity = "critical" | "warning" | "info"
type Channel = "email" | "slack" | "pagerduty" | "teams" | "webhook"

const DEFAULT_RULES: Record<Severity, Channel[]> = {
  critical: ["email", "slack", "pagerduty"],
  warning: ["email", "slack"],
  info: ["slack"],
}

const ALERT_TYPES = [
  { id: "incident_created", label: "Incident Created", severity: "critical" as Severity },
  { id: "incident_resolved", label: "Incident Resolved", severity: "info" as Severity },
  { id: "slo_breach", label: "SLO Breach", severity: "critical" as Severity },
  { id: "slo_at_risk", label: "SLO At Risk", severity: "warning" as Severity },
  { id: "health_drop", label: "Health Score Drop", severity: "warning" as Severity },
  { id: "connector_error", label: "Connector Error", severity: "warning" as Severity },
  { id: "maintenance_start", label: "Maintenance Window Start", severity: "info" as Severity },
  { id: "new_anomaly", label: "New AI Anomaly Detected", severity: "warning" as Severity },
]

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  info: "bg-primary/10 text-primary border-primary/20",
}

export function NotificationPreferences() {
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [quietStart, setQuietStart] = useState("22:00")
  const [quietEnd, setQuietEnd] = useState("07:00")
  const [quietEnabled, setQuietEnabled] = useState(true)

  const toggleChannel = (severity: Severity, channel: Channel) => {
    setRules(prev => {
      const current = prev[severity]
      return {
        ...prev,
        [severity]: current.includes(channel)
          ? current.filter(c => c !== channel)
          : [...current, channel],
      }
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-bold text-foreground mb-0.5">Notification Preferences</div>
        <div className="text-xs text-muted-foreground">Configure where and when alerts are sent for different severity levels</div>
      </div>

      {/* Channels */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Connected Channels</span>
        </div>
        <div className="divide-y divide-border/40">
          {CHANNELS.map(ch => {
            const Icon = ch.icon
            return (
              <div key={ch.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">{ch.label}</div>
                  {ch.connected ? (
                    <div className="text-xs text-muted-foreground">{ch.value}</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Not connected</div>
                  )}
                </div>
                {ch.connected ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Connected</span>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 text-xs">Connect</Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Routing rules */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Alert Routing by Severity</span>
        </div>
        <div className="p-4 space-y-3">
          {(["critical", "warning", "info"] as Severity[]).map(sev => (
            <div key={sev} className="flex items-center gap-4">
              <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize w-20 text-center", SEVERITY_STYLE[sev])}>
                {sev}
              </span>
              <div className="flex gap-2 flex-wrap">
                {CHANNELS.filter(c => c.connected).map(ch => {
                  const active = rules[sev].includes(ch.id as Channel)
                  const Icon = ch.icon
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(sev, ch.id as Channel)}
                      className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        active
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-muted/40 border-border/40 text-muted-foreground hover:border-border"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {ch.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert types */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Alert Types</span>
        </div>
        <div className="divide-y divide-border/40">
          {ALERT_TYPES.map(at => (
            <div key={at.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize", SEVERITY_STYLE[at.severity])}>
                  {at.severity}
                </span>
                <span className="text-sm text-foreground">{at.label}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-8 h-4 bg-muted rounded-full peer peer-checked:bg-primary transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet hours */}
      <div className="rounded-xl border border-border/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Quiet Hours</div>
            <div className="text-xs text-muted-foreground">Suppress non-critical alerts during this period</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={quietEnabled} onChange={e => setQuietEnabled(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
          </label>
        </div>
        {quietEnabled && (
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Start</label>
              <Input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="h-8 text-sm w-28" />
            </div>
            <span className="text-muted-foreground mt-5">to</span>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">End</label>
              <Input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="h-8 text-sm w-28" />
            </div>
          </div>
        )}
      </div>

      <Button size="sm">Save Preferences</Button>
    </div>
  )
}
