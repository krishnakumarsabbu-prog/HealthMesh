import { motion, AnimatePresence } from "framer-motion"
import { Users, Server, Mail, Plus, Search, X, ChevronRight, Phone, TriangleAlert as AlertTriangle, CreditCard as Edit2, UserPlus } from "lucide-react"
import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { useApi } from "@/hooks/useApi"
import { listTeams, type Team as ApiTeam } from "@/lib/api/misc"
import { LoadingShimmer } from "@/components/shared/LoadingShimmer"

const TEAM_MEMBERS: Record<string, { initials: string; name: string; role: string; email: string; oncall: boolean }[]> = {
  "Platform": [
    { initials: "AC", name: "Alex Chen", role: "Tech Lead", email: "alex.chen@acme.io", oncall: true },
    { initials: "SL", name: "Sara Lee", role: "SRE", email: "sara.lee@acme.io", oncall: false },
    { initials: "JK", name: "James Kim", role: "Engineer", email: "james.kim@acme.io", oncall: false },
  ],
  "Payments": [
    { initials: "RJ", name: "Rachel James", role: "Tech Lead", email: "rachel.james@acme.io", oncall: true },
    { initials: "KL", name: "Kevin Liu", role: "Engineer", email: "kevin.liu@acme.io", oncall: false },
    { initials: "MW", name: "Maya Watts", role: "QA", email: "maya.watts@acme.io", oncall: false },
  ],
  "Commerce": [
    { initials: "TP", name: "Tom Park", role: "Tech Lead", email: "tom.park@acme.io", oncall: true },
    { initials: "ND", name: "Nina Dey", role: "Engineer", email: "nina.dey@acme.io", oncall: false },
  ],
  "Discovery": [
    { initials: "JM", name: "Jake Moore", role: "Tech Lead", email: "jake.moore@acme.io", oncall: true },
    { initials: "AL", name: "Amy Lin", role: "SRE", email: "amy.lin@acme.io", oncall: false },
    { initials: "BK", name: "Ben Ko", role: "Engineer", email: "ben.ko@acme.io", oncall: false },
    { initials: "CP", name: "Cleo Patel", role: "Engineer", email: "cleo.patel@acme.io", oncall: false },
  ],
  "ML": [
    { initials: "DR", name: "David Rodriguez", role: "Tech Lead", email: "david.r@acme.io", oncall: true },
    { initials: "YT", name: "Yuki Tanaka", role: "ML Engineer", email: "yuki.t@acme.io", oncall: false },
  ],
  "Logistics": [
    { initials: "FW", name: "Fiona Walsh", role: "Tech Lead", email: "fiona.w@acme.io", oncall: true },
    { initials: "RS", name: "Ryan Singh", role: "Engineer", email: "ryan.s@acme.io", oncall: false },
  ],
  "Risk": [
    { initials: "MP", name: "Miguel Pena", role: "Tech Lead", email: "miguel.p@acme.io", oncall: true },
    { initials: "CS", name: "Clara Sato", role: "Engineer", email: "clara.s@acme.io", oncall: false },
    { initials: "AA", name: "Ahmed Ali", role: "Analyst", email: "ahmed.a@acme.io", oncall: false },
  ],
  "Analytics": [
    { initials: "LB", name: "Lucy Brown", role: "Tech Lead", email: "lucy.b@acme.io", oncall: true },
  ],
}

const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 — Mission Critical",
  2: "Tier 2 — Core",
  3: "Tier 3 — Supporting",
}

type TeamEntry = { name: string; apps: string[]; incidents: number; health: "healthy" | "warning" | "critical" | "degraded"; lead: string; tier: number }
type TeamMemberEntry = { initials: string; name: string; role: string; email: string; oncall: boolean }

function apiToTeam(a: ApiTeam): TeamEntry {
  const score = a.health_score
  const health: TeamEntry["health"] = score >= 90 ? "healthy" : score >= 75 ? "warning" : score >= 60 ? "degraded" : "critical"
  return { name: a.name, apps: a.app_names || [], incidents: a.incident_count, health, lead: a.lead_name, tier: a.tier }
}

export function TeamsOwnership() {
  const [search, setSearch] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<TeamEntry | null>(null)
  const [activeTab, setActiveTab] = useState<"members" | "apps" | "oncall">("members")

  const { data: apiTeams, loading: teamsLoading } = useApi(listTeams)

  const TEAMS: TeamEntry[] = apiTeams && apiTeams.length > 0
    ? apiTeams.map(apiToTeam)
    : [
        { name: "Platform", apps: ["api-gateway", "auth-service", "config-service", "secret-manager"], incidents: 1, health: "warning", lead: "Alex Chen", tier: 1 },
        { name: "Payments", apps: ["payments-api", "billing-service", "subscription-mgr", "invoice-engine"], incidents: 0, health: "healthy", lead: "Rachel James", tier: 1 },
        { name: "Commerce", apps: ["catalog-service", "cart-service", "order-mgr", "pricing-engine", "promotions"], incidents: 0, health: "healthy", lead: "Tom Park", tier: 2 },
        { name: "Discovery", apps: ["search-api", "recommendation-engine", "indexer"], incidents: 1, health: "critical", lead: "Jake Moore", tier: 2 },
        { name: "ML", apps: ["feature-store", "model-server", "training-pipeline"], incidents: 1, health: "degraded", lead: "David Rodriguez", tier: 2 },
        { name: "Logistics", apps: ["shipping-api", "tracking-service", "fulfillment"], incidents: 0, health: "healthy", lead: "Fiona Walsh", tier: 3 },
        { name: "Risk", apps: ["fraud-detection", "compliance-api", "audit-service"], incidents: 0, health: "healthy", lead: "Miguel Pena", tier: 3 },
        { name: "Analytics", apps: ["events-pipeline", "reporting-api", "warehouse-sync", "dashboard-api", "export-service", "data-quality", "metrics-store"], incidents: 0, health: "healthy", lead: "Lucy Brown", tier: 3 },
      ]

  const MEMBERS_BY_TEAM: Record<string, TeamMemberEntry[]> = apiTeams && apiTeams.length > 0
    ? Object.fromEntries(apiTeams.map(t => [
        t.name,
        t.members.map(m => ({ initials: m.initials, name: m.name, role: m.role, email: m.email, oncall: m.on_call }))
      ]))
    : Object.fromEntries(Object.entries(TEAM_MEMBERS))

  const filtered = TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.lead.toLowerCase().includes(search.toLowerCase())
  )

  const tierGroups = [1, 2, 3].map(tier => ({
    tier,
    label: TIER_LABELS[tier],
    teams: filtered.filter(t => t.tier === tier),
  })).filter(g => g.teams.length > 0)

  const totalMembers = Object.values(MEMBERS_BY_TEAM).reduce((a, m) => a + m.length, 0)
  const oncallCount = Object.values(MEMBERS_BY_TEAM).reduce((a, m) => a + m.filter(p => p.oncall).length, 0)
  const criticalTeams = TEAMS.filter(t => t.health === "critical" || t.health === "degraded").length

  return (
    <div className="min-h-full">
      <PageHeader
        title="Teams & Ownership"
        description="Manage team ownership, responsibilities, on-call rotation, and application accountability"
        actions={
          <PermissionGuard action="view_all_teams">
            <Button size="sm" className="gap-2">
              <Plus className="w-3.5 h-3.5" /> Add Team
            </Button>
          </PermissionGuard>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Teams", value: TEAMS.length, icon: Users },
            { label: "Members", value: totalMembers, icon: Users },
            { label: "On-call Now", value: oncallCount, icon: Phone },
            { label: "Needs Attention", value: criticalTeams, icon: AlertTriangle, warn: criticalTeams > 0 },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="premium-card px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className={cn("text-2xl font-bold", s.warn ? "text-amber-500" : "text-foreground")}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams or leads..." className="pl-9 h-8 text-sm" />
        </div>

        {/* Teams by tier */}
        {teamsLoading && !apiTeams && <LoadingShimmer rows={6} className="px-0 pt-0" />}
        <div className="space-y-6">
          {tierGroups.map(group => (
            <div key={group.tier}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("w-1.5 h-1.5 rounded-full",
                  group.tier === 1 ? "bg-red-500" : group.tier === 2 ? "bg-amber-500" : "bg-emerald-500"
                )} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.teams.map((team, i) => {
                  const members = MEMBERS_BY_TEAM[team.name] || []
                  const oncall = members.find(m => m.oncall)
                  return (
                    <motion.div
                      key={team.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ y: -2 }}
                      onClick={() => { setSelectedTeam(team); setActiveTab("members") }}
                      className="premium-card p-4 cursor-pointer group hover:shadow-elevation-2 transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={team.health} size="sm" />
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="font-bold text-sm text-foreground mb-0.5">{team.name}</div>
                      <div className="text-xs text-muted-foreground mb-3">Lead: {team.lead}</div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex -space-x-1.5">
                          {members.slice(0, 4).map((m, j) => (
                            <Avatar key={j} className="w-5 h-5 border border-card">
                              <AvatarFallback className="text-[8px]">{m.initials}</AvatarFallback>
                            </Avatar>
                          ))}
                          {members.length > 4 && (
                            <div className="w-5 h-5 rounded-full bg-muted border border-card flex items-center justify-center text-[8px] font-semibold text-muted-foreground">
                              +{members.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{members.length} members</span>
                      </div>

                      {oncall && (
                        <div className="flex items-center gap-1.5 mb-3 px-2 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">On-call: {oncall.name}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                          <div className="text-xs font-bold text-foreground">{team.apps.length}</div>
                          <div className="text-[10px] text-muted-foreground">Apps</div>
                        </div>
                        <div className={cn("rounded-lg px-2 py-1.5", team.incidents > 0 ? "bg-amber-500/10" : "bg-muted/50")}>
                          <div className={cn("text-xs font-bold", team.incidents > 0 ? "text-amber-500" : "text-foreground")}>{team.incidents}</div>
                          <div className="text-[10px] text-muted-foreground">Incidents</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Detail Drawer */}
      <AnimatePresence>
        {selectedTeam && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
              onClick={() => setSelectedTeam(null)}
            />
            <motion.div
              initial={{ x: 440, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 440, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[420px] bg-card border-l border-border flex flex-col shadow-elevation-3"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{selectedTeam.name}</div>
                    <div className="text-xs text-muted-foreground">Lead: {selectedTeam.lead}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedTeam.health} />
                  <button onClick={() => setSelectedTeam(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-0 border-b border-border divide-x divide-border">
                {[
                  { label: "Members", value: (MEMBERS_BY_TEAM[selectedTeam.name] || []).length },
                  { label: "Apps", value: selectedTeam.apps.length },
                  { label: "Incidents", value: selectedTeam.incidents },
                ].map(s => (
                  <div key={s.label} className="px-4 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex border-b border-border px-5">
                {(["members", "apps", "oncall"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn("px-3 py-3 text-xs font-semibold capitalize border-b-2 transition-colors",
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "oncall" ? "On-call" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  {activeTab === "members" && (
                    <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground">{(MEMBERS_BY_TEAM[selectedTeam.name] || []).length} members</span>
                        <PermissionGuard action="add_team_member">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                            <UserPlus className="w-3 h-3" /> Add Member
                          </Button>
                        </PermissionGuard>
                      </div>
                      {(MEMBERS_BY_TEAM[selectedTeam.name] || []).map(m => (
                        <div key={m.email} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors group">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{m.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-foreground">{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.role}</div>
                          </div>
                          {m.oncall && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">On-call</span>
                            </div>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 rounded hover:bg-muted transition-colors">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            <button className="p-1 rounded hover:bg-muted transition-colors">
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "apps" && (
                    <motion.div key="apps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <span className="text-xs text-muted-foreground block mb-3">{selectedTeam.apps.length} applications owned</span>
                      {selectedTeam.apps.map(app => (
                        <div key={app} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors cursor-pointer group">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Server className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="font-mono text-sm font-semibold text-foreground flex-1">{app}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === "oncall" && (
                    <motion.div key="oncall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Current On-call</div>
                        {(MEMBERS_BY_TEAM[selectedTeam.name] || []).filter(m => m.oncall).map(m => (
                          <div key={m.email} className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="text-sm">{m.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-sm text-foreground">{m.name}</div>
                              <div className="text-xs text-muted-foreground">{m.email}</div>
                            </div>
                            <Button size="sm" variant="outline" className="ml-auto h-7 text-xs gap-1">
                              <Phone className="w-3 h-3" /> Page
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rotation Schedule</div>
                        <div className="space-y-2">
                          {(MEMBERS_BY_TEAM[selectedTeam.name] || []).map((m, i) => (
                            <div key={m.email} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                m.oncall ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                              )}>{i + 1}</div>
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-[9px]">{m.initials}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-foreground">{m.name}</span>
                              {m.oncall && <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">Active</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-border p-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">Edit Team</Button>
                <Button size="sm" className="flex-1">View Dashboard</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
