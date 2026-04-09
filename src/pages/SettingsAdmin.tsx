import { motion } from "framer-motion"
import { useState } from "react"
import { Settings, User, Bell, Shield, Palette, Database, Key, Globe, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

const SETTINGS_NAV = [
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API Access", icon: Key },
  { id: "data", label: "Data & Retention", icon: Database },
]

export function SettingsAdmin() {
  const [activeSection, setActiveSection] = useState("general")
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-full">
      <PageHeader
        title="Settings & Admin"
        description="Configure HealthMesh platform settings, access control, and system preferences"
      />

      <div className="px-6 pb-6">
        <div className="flex gap-6">
          {/* Settings nav */}
          <div className="w-48 shrink-0">
            <nav className="space-y-0.5 sticky top-24">
              {SETTINGS_NAV.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Settings content */}
          <div className="flex-1 min-w-0">
            {activeSection === "general" && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="premium-card p-5">
                  <div className="text-sm font-semibold text-foreground mb-4">Organization</div>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Organization Name</label>
                      <Input defaultValue="Acme Corporation" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Default Environment</label>
                      <Input defaultValue="Production" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Timezone</label>
                      <Input defaultValue="UTC" />
                    </div>
                    <Button size="sm">Save Changes</Button>
                  </div>
                </div>

                <div className="premium-card p-5">
                  <div className="text-sm font-semibold text-foreground mb-1">Data Retention</div>
                  <div className="text-xs text-muted-foreground mb-4">Configure how long HealthMesh retains metric and event data.</div>
                  <div className="space-y-3 max-w-md">
                    {[
                      { label: "Raw Metrics", value: "30 days" },
                      { label: "Aggregated Metrics", value: "1 year" },
                      { label: "Events & Logs", value: "90 days" },
                      { label: "Incident History", value: "Unlimited" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                        <span className="text-sm text-foreground">{item.label}</span>
                        <Badge variant="secondary" size="sm">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "appearance" && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div className="premium-card p-5 space-y-5">
                  <div className="text-sm font-semibold text-foreground mb-4">Theme</div>
                  <div className="grid grid-cols-2 gap-4 max-w-lg">
                    <button
                      onClick={() => setTheme("ivory")}
                      className={cn(
                        "relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer",
                        theme === "ivory" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className="h-28 bg-gradient-to-br from-stone-50 to-stone-100 flex items-end p-3">
                        <div className="space-y-1 w-full">
                          <div className="h-2 w-16 rounded bg-stone-300" />
                          <div className="h-1.5 w-24 rounded bg-stone-200" />
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-white border-t border-stone-100">
                        <div className="text-xs font-semibold text-stone-900">Ivory</div>
                        <div className="text-[10px] text-stone-500">Premium light theme</div>
                      </div>
                      {theme === "ivory" && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setTheme("green")}
                      className={cn(
                        "relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer",
                        theme === "green" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className="h-28 bg-gradient-to-br from-slate-950 to-slate-900 flex items-end p-3">
                        <div className="space-y-1 w-full">
                          <div className="h-2 w-16 rounded bg-emerald-500/40" />
                          <div className="h-1.5 w-24 rounded bg-slate-700" />
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800">
                        <div className="text-xs font-semibold text-white">Green</div>
                        <div className="text-[10px] text-slate-400">Observability dark theme</div>
                      </div>
                      {theme === "green" && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground text-[10px]">✓</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeSection === "notifications" || activeSection === "security" || activeSection === "api" || activeSection === "data") && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div className="premium-card p-8 text-center text-muted-foreground text-sm">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} settings coming soon.
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
