import { useState } from "react"
import { Upload, Globe, Clock, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/context/ThemeContext"
import { cn } from "@/lib/utils"

const TIMEZONES = ["UTC", "US/Eastern", "US/Pacific", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Asia/Singapore"]
const LOCALES = ["en-US", "en-GB", "de-DE", "ja-JP", "fr-FR"]
const PLANS = [
  { id: "starter", label: "Starter", price: "$0", apps: 5, connectors: 3, users: 5 },
  { id: "professional", label: "Professional", price: "$299/mo", apps: 50, connectors: 20, users: 25, current: true },
  { id: "enterprise", label: "Enterprise", price: "Custom", apps: "Unlimited", connectors: "Unlimited", users: "Unlimited" },
]

export function BrandingWorkspace() {
  const { theme, setTheme } = useTheme()
  const [orgName, setOrgName] = useState("Acme Corporation")
  const [orgDomain, setOrgDomain] = useState("acme.io")
  const [timezone, setTimezone] = useState("UTC")
  const [locale, setLocale] = useState("en-US")

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-bold text-foreground mb-0.5">Branding & Workspace</div>
        <div className="text-xs text-muted-foreground">Customize your workspace identity, appearance, and regional settings</div>
      </div>

      {/* Organization */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Organization Identity</span>
        </div>
        <div className="p-4 space-y-4">
          {/* Logo uploader */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors group">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground mb-1">Workspace Logo</div>
              <div className="text-xs text-muted-foreground mb-2">Appears in sidebar and reports. PNG or SVG, 64×64px min.</div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                <Upload className="w-3 h-3" /> Upload Logo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Organization Name</label>
              <Input value={orgName} onChange={e => setOrgName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Domain</label>
              <Input value={orgDomain} onChange={e => setOrgDomain(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Theme</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              onClick={() => setTheme("ivory")}
              className={cn("relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer",
                theme === "ivory" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"
              )}
            >
              <div className="h-24 bg-gradient-to-br from-stone-50 to-stone-100 flex items-end p-3">
                <div className="space-y-1 w-full">
                  <div className="h-2 w-14 rounded bg-stone-300" />
                  <div className="h-1.5 w-20 rounded bg-stone-200" />
                </div>
              </div>
              <div className="px-3 py-2 bg-white border-t border-stone-100">
                <div className="text-xs font-semibold text-stone-900">Ivory Light</div>
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
              className={cn("relative rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer",
                theme === "green" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"
              )}
            >
              <div className="h-24 bg-gradient-to-br from-slate-950 to-slate-900 flex items-end p-3">
                <div className="space-y-1 w-full">
                  <div className="h-2 w-14 rounded bg-emerald-500/40" />
                  <div className="h-1.5 w-20 rounded bg-slate-700" />
                </div>
              </div>
              <div className="px-3 py-2 bg-slate-900 border-t border-slate-800">
                <div className="text-xs font-semibold text-white">Observability Dark</div>
                <div className="text-[10px] text-slate-400">NOC-grade dark theme</div>
              </div>
              {theme === "green" && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-[10px]">✓</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Regional */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Regional Settings</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Default Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full h-8 text-sm rounded-lg border border-input bg-background px-3 text-foreground">
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Locale</label>
            <select value={locale} onChange={e => setLocale(e.target.value)}
              className="w-full h-8 text-sm rounded-lg border border-input bg-background px-3 text-foreground">
              {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
          <span className="text-xs font-semibold text-foreground">Subscription Plan</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map(plan => (
              <div key={plan.id} className={cn("rounded-xl border p-3",
                plan.current ? "border-primary bg-primary/5" : "border-border/60 opacity-70"
              )}>
                <div className="font-bold text-sm text-foreground mb-0.5">{plan.label}</div>
                <div className="text-xs font-semibold text-primary mb-2">{plan.price}</div>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div>{plan.apps} apps</div>
                  <div>{plan.connectors} connectors</div>
                  <div>{plan.users} users</div>
                </div>
                {plan.current && (
                  <div className="mt-2 text-[10px] font-semibold text-primary">Current Plan</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button size="sm">Save Changes</Button>
    </div>
  )
}
