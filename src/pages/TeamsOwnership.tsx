import { motion } from "framer-motion"
import { Users, Server, Mail, Plus, Search } from "lucide-react"
import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const TEAMS = [
  { name: "Platform", members: ["AC", "SL", "JK"], apps: 24, incidents: 1, health: "warning" as const, lead: "Alex Chen" },
  { name: "Payments", members: ["RJ", "KL", "MW"], apps: 8, incidents: 0, health: "healthy" as const, lead: "Rachel James" },
  { name: "Commerce", members: ["TP", "ND"], apps: 12, incidents: 0, health: "healthy" as const, lead: "Tom Park" },
  { name: "Discovery", members: ["JM", "AL", "BK", "CP"], apps: 6, incidents: 1, health: "critical" as const, lead: "Jake Moore" },
  { name: "ML", members: ["DR", "YT"], apps: 5, incidents: 1, health: "degraded" as const, lead: "David Rodriguez" },
  { name: "Logistics", members: ["FW", "RS"], apps: 4, incidents: 0, health: "healthy" as const, lead: "Fiona Walsh" },
  { name: "Risk", members: ["MP", "CS", "AA"], apps: 3, incidents: 0, health: "healthy" as const, lead: "Miguel Pena" },
  { name: "Analytics", members: ["LB"], apps: 7, incidents: 0, health: "healthy" as const, lead: "Lucy Brown" },
]

export function TeamsOwnership() {
  const [search, setSearch] = useState("")
  const filtered = TEAMS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.lead.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-full">
      <PageHeader
        title="Teams & Ownership"
        description="Manage team ownership, responsibilities, and on-call assignments across applications"
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="w-3.5 h-3.5" /> Add Team
          </Button>
        }
      />

      <div className="px-6 pb-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Teams", value: TEAMS.length },
            { label: "Team Members", value: TEAMS.reduce((a, t) => a + t.members.length, 0) },
            { label: "Applications", value: TEAMS.reduce((a, t) => a + t.apps, 0) },
          ].map((s, i) => (
            <div key={i} className="premium-card px-4 py-3">
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..." className="pl-9 h-8 text-sm" />
        </div>

        {/* Teams grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((team, i) => (
            <motion.div key={team.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="premium-card p-4 cursor-pointer group">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-primary" />
                </div>
                <StatusBadge status={team.health} size="sm" />
              </div>

              <div className="font-bold text-base text-foreground mb-0.5">{team.name}</div>
              <div className="text-xs text-muted-foreground mb-4">Lead: {team.lead}</div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 3).map((m, j) => (
                    <Avatar key={j} className="w-6 h-6 border-2 border-card">
                      <AvatarFallback className="text-[9px]">{m}</AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-semibold text-muted-foreground">
                      +{team.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{team.members.length} members</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <div className="text-sm font-bold text-foreground">{team.apps}</div>
                  <div className="text-[10px] text-muted-foreground">Apps</div>
                </div>
                <div className={cn("rounded-lg px-2 py-1.5", team.incidents > 0 ? "bg-amber-500/10" : "bg-muted/50")}>
                  <div className={cn("text-sm font-bold", team.incidents > 0 ? "text-amber-500" : "text-foreground")}>{team.incidents}</div>
                  <div className="text-[10px] text-muted-foreground">Incidents</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
