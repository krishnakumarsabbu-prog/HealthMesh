import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Settings, Bell, Shield, Palette, Database, Key, Globe, Wrench, Target, FileText, Users, Activity, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { MaintenanceWindows } from "@/pages/settings/MaintenanceWindows"
import { SLASettings } from "@/pages/settings/SLASettings"
import { AuditLogs } from "@/pages/settings/AuditLogs"
import { RolesPermissions } from "@/pages/settings/RolesPermissions"
import { NotificationPreferences } from "@/pages/settings/NotificationPreferences"
import { BrandingWorkspace } from "@/pages/settings/BrandingWorkspace"
import { SystemStatus } from "@/pages/settings/SystemStatus"

type SettingsSection =
  | "general"
  | "branding"
  | "notifications"
  | "roles"
  | "api"
  | "data"
  | "maintenance"
  | "sla"
  | "audit"
  | "system"

const SETTINGS_NAV: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; description: string }[] = [
  { id: "general", label: "General", icon: Settings, description: "Organization & data settings" },
  { id: "branding", label: "Branding & Workspace", icon: Palette, description: "Theme, logo, and regional" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Alert routing & preferences" },
  { id: "roles", label: "Roles & Permissions", icon: Shield, description: "Access control & user roles" },
  { id: "api", label: "API Access", icon: Key, description: "API keys & tokens" },
  { id: "maintenance", label: "Maintenance Windows", icon: Wrench, description: "Scheduled downtime windows" },
  { id: "sla", label: "SLA / SLO Settings", icon: Target, description: "Objectives & error budgets" },
  { id: "audit", label: "Audit Logs", icon: FileText, description: "Activity & change history" },
  { id: "system", label: "System Status", icon: Activity, description: "Platform health & uptime", badge: "1 issue" },
  { id: "data", label: "Data & Retention", icon: Database, description: "Storage & retention policy" },
]

function GeneralSettings() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Organization</span>
        </div>
        <div className="p-4 space-y-4 max-w-md">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Organization Name</label>
            <Input defaultValue="Acme Corporation" className="h-8 text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Default Environment</label>
            <Input defaultValue="Production" className="h-8 text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Timezone</label>
            <Input defaultValue="UTC" className="h-8 text-sm" />
          </div>
          <Button size="sm">Save Changes</Button>
        </div>
      </div>
    </motion.div>
  )
}

function APISettings() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-foreground mb-0.5">API Access</div>
          <div className="text-xs text-muted-foreground">Manage API keys for programmatic access to HealthMesh</div>
        </div>
        <Button size="sm" className="gap-2"><Key className="w-3.5 h-3.5" /> Generate Key</Button>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="divide-y divide-border/40">
          {[
            { name: "CI/CD Integration", key: "hm_live_****3a8f", created: "2026-01-15", lastUsed: "2 hours ago", perms: ["read:apps", "write:rules"] },
            { name: "Monitoring Dashboard", key: "hm_live_****9c2d", created: "2025-12-01", lastUsed: "5 min ago", perms: ["read:*"] },
            { name: "Grafana Plugin", key: "hm_live_****1b7e", created: "2025-11-20", lastUsed: "1 day ago", perms: ["read:metrics"] },
          ].map((k, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
              <div>
                <div className="font-semibold text-sm text-foreground">{k.name}</div>
                <div className="font-mono text-xs text-muted-foreground mt-0.5">{k.key}</div>
                <div className="flex gap-1.5 mt-1">
                  {k.perms.map(p => <span key={p} className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{p}</span>)}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>Created {k.created}</div>
                <div>Used {k.lastUsed}</div>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-500 hover:text-red-500 mt-1">Revoke</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function DataRetentionSettings() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <div className="text-sm font-bold text-foreground mb-0.5">Data & Retention</div>
        <div className="text-xs text-muted-foreground">Configure how long HealthMesh retains metric, event, and log data</div>
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="divide-y divide-border/40">
          {[
            { label: "Raw Metrics", value: "30 days", editable: true },
            { label: "Aggregated Metrics (1m)", value: "1 year", editable: true },
            { label: "Events & Logs", value: "90 days", editable: true },
            { label: "Incident History", value: "Unlimited", editable: false },
            { label: "Audit Logs", value: "90 days", editable: false },
            { label: "AI Insight Records", value: "6 months", editable: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
              <span className="text-sm text-foreground">{item.label}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{item.value}</Badge>
                {item.editable && <Button size="sm" variant="ghost" className="h-6 text-xs">Edit</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-600 dark:text-amber-400">
        Reducing retention periods will permanently delete historical data. This action cannot be undone.
      </div>
    </motion.div>
  )
}

export function SettingsAdmin() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general")

  const SECTION_CONTENT: Record<SettingsSection, React.ReactNode> = {
    general: <GeneralSettings />,
    branding: <BrandingWorkspace />,
    notifications: <NotificationPreferences />,
    roles: <RolesPermissions />,
    api: <APISettings />,
    maintenance: <MaintenanceWindows />,
    sla: <SLASettings />,
    audit: <AuditLogs />,
    system: <SystemStatus />,
    data: <DataRetentionSettings />,
  }

  const activeNav = SETTINGS_NAV.find(n => n.id === activeSection)

  return (
    <div className="min-h-full">
      <PageHeader
        title="Settings & Admin"
        description="Configure platform settings, access control, integrations, and operational policies"
      />

      <div className="px-6 pb-6">
        <div className="flex gap-6">
          {/* Settings nav */}
          <div className="w-52 shrink-0">
            <nav className="space-y-0.5 sticky top-24">
              {SETTINGS_NAV.map(item => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left group relative",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {isActive && (
                      <motion.div layoutId="settings-active" className="absolute inset-0 bg-primary/10 rounded-lg" transition={{ duration: 0.18 }} />
                    )}
                    <Icon className="w-4 h-4 relative z-10 shrink-0" />
                    <span className="flex-1 truncate relative z-10">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full relative z-10">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 relative z-10 shrink-0 text-primary" />}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {SECTION_CONTENT[activeSection]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
