import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Building2, Users, Server, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useApi } from "@/hooks/useApi"
import { listLobs, listOrgTeams, type Lob, type OrgTeam } from "@/lib/api/org"

interface LOBHealthData {
  lob: Lob
  teams: OrgTeam[]
  healthScore: number
  appCount: number
  openIncidents: number
  healthy: number
  warning: number
  critical: number
}

function buildLOBHealthData(lobs: Lob[], teams: OrgTeam[]): LOBHealthData[] {
  return lobs.map(lob => {
    const lobTeams = teams.filter(t => t.lob_id === lob.id)
    const avgScore = lobTeams.length > 0
      ? Math.round(lobTeams.reduce((s, t) => s + (t.health_score ?? 100), 0) / lobTeams.length)
      : 100
    const healthy = lobTeams.filter(t => (t.health_score ?? 100) >= 90).length
    const warning = lobTeams.filter(t => (t.health_score ?? 100) >= 70 && (t.health_score ?? 100) < 90).length
    const critical = lobTeams.filter(t => (t.health_score ?? 100) < 70).length
    return {
      lob,
      teams: lobTeams,
      healthScore: avgScore,
      appCount: lobTeams.length * 3,
      openIncidents: critical * 2 + warning,
      healthy,
      warning,
      critical,
    }
  })
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[60px]">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <span className={cn("text-xs font-mono font-semibold",
        score >= 90 ? "text-emerald-600 dark:text-emerald-400" :
        score >= 70 ? "text-amber-500" : "text-red-500"
      )}>{score}</span>
    </div>
  )
}

function TeamRow({ team }: { team: OrgTeam }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors">
      <Users className="w-3 h-3 text-muted-foreground shrink-0" />
      <span className="text-xs text-foreground flex-1 truncate">{team.name}</span>
      <ScoreBar score={team.health_score ?? 100} />
    </div>
  )
}

function LOBRow({ data, defaultExpanded }: { data: LOBHealthData; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
          <Building2 className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">{data.lob.name}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{data.teams.length} teams</div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            <Server className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{data.appCount}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2.5">
            {data.healthy > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />{data.healthy}
              </span>
            )}
            {data.warning > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-amber-500">
                <TriangleAlert className="w-3 h-3" />{data.warning}
              </span>
            )}
            {data.critical > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-red-500">
                <AlertCircle className="w-3 h-3" />{data.critical}
              </span>
            )}
          </div>
          {data.openIncidents > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">
              {data.openIncidents} inc
            </span>
          )}
          <ScoreBar score={data.healthScore} />
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && data.teams.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40 bg-muted/10"
          >
            <div className="px-2 py-2 space-y-0.5">
              {data.teams.map(team => (
                <TeamRow key={team.id} team={team} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LOBHealthPanel() {
  const { user } = useAuth()
  const { data: lobs } = useApi(listLobs, [])
  const { data: teams } = useApi(listOrgTeams, [])

  const isEnterpriseAdmin = !user?.lob_id
  const userLobId = user?.lob_id

  const allLobs = lobs ?? []
  const allTeams = teams ?? []

  const visibleLobs = isEnterpriseAdmin
    ? allLobs
    : allLobs.filter(l => l.id === userLobId)

  const visibleLobIds = new Set(visibleLobs.map(l => l.id))
  const visibleTeams = allTeams.filter(t => visibleLobIds.has(t.lob_id))

  const lobData = buildLOBHealthData(visibleLobs, visibleTeams)

  if (lobData.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.44, duration: 0.35 }}
      className="premium-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div>
          <div className="text-sm font-semibold text-foreground">LOB Health Overview</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {isEnterpriseAdmin ? "All lines of business" : `${user?.lob_name ?? "Your LOB"} breakdown`}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Healthy</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Warning</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {lobData.map((data, i) => (
          <LOBRow
            key={data.lob.id}
            data={data}
            defaultExpanded={!isEnterpriseAdmin || i === 0}
          />
        ))}
      </div>
    </motion.div>
  )
}
