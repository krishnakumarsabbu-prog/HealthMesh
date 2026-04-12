import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Users, FolderOpen, Plus, ChevronDown, ChevronRight, X, CircleAlert as AlertCircle, Loader as Loader2, LayoutGrid, Server, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { LoadingShimmer } from "@/components/shared/LoadingShimmer"
import {
  getOrgHierarchy, createOrgTeam, createProject,
  type OrgHierarchy, type Lob, type OrgTeam,
} from "@/lib/api/org"
import { useAuth } from "@/context/AuthContext"

function healthColor(score: number) {
  if (score >= 90) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  if (score >= 75) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
  if (score >= 60) return { bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" }
  return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" }
}

function statusLabel(score: number) {
  if (score >= 90) return "Healthy"
  if (score >= 75) return "Warning"
  if (score >= 60) return "Degraded"
  return "Critical"
}

function HealthBar({ score, className }: { score: number; className?: string }) {
  const c = healthColor(score)
  return (
    <div className={cn("h-1.5 rounded-full bg-muted/50 overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("h-full rounded-full", c.bar)}
      />
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const c = healthColor(score)
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", c.bg, c.text, c.border)}>
      {score >= 90 ? <TrendingUp className="w-2.5 h-2.5" /> : score >= 75 ? <Minus className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {score}
    </span>
  )
}

interface AddTeamDialogProps {
  lob: Lob
  onClose: () => void
  onSave: (team: OrgTeam) => void
}

function AddTeamDialog({ lob, onClose, onSave }: AddTeamDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Team name is required."); return }
    setSaving(true); setError("")
    try {
      const team = await createOrgTeam({ lob_id: lob.id, name: name.trim(), description: description.trim(), health_score: 100 })
      onSave(team)
    } catch {
      setError("Failed to create team.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="bg-card border border-border rounded-2xl shadow-elevation-3 w-full max-w-sm mx-4"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">Add Team</div>
              <div className="text-xs text-muted-foreground">Under {lob.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Team Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Discovery" className="h-8 text-sm" autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description…" className="h-8 text-sm" />
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/8 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="flex-1 gap-1.5" disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {saving ? "Adding…" : "Add Team"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

interface AddProjectDialogProps {
  team: OrgTeam
  onClose: () => void
  onSave: () => void
}

function AddProjectDialog({ team, onClose, onSave }: AddProjectDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Project name is required."); return }
    setSaving(true); setError("")
    try {
      await createProject({ team_id: team.id, name: name.trim(), description: description.trim(), app_count: 0, health_score: 100, status: "healthy" })
      onSave()
    } catch {
      setError("Failed to create project.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="bg-card border border-border rounded-2xl shadow-elevation-3 w-full max-w-sm mx-4"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">Add Project</div>
              <div className="text-xs text-muted-foreground">Under {team.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Project Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. API Gateway" className="h-8 text-sm" autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description…" className="h-8 text-sm" />
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/8 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="flex-1 gap-1.5" disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {saving ? "Adding…" : "Add Project"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

interface AddTeamState { lob: Lob }
interface AddProjectState { team: OrgTeam }

export function OrganizationPage() {
  const { user } = useAuth()
  const [hierarchy, setHierarchy] = useState<OrgHierarchy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedLobs, setExpandedLobs] = useState<Set<string>>(new Set())
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [addTeam, setAddTeam] = useState<AddTeamState | null>(null)
  const [addProject, setAddProject] = useState<AddProjectState | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const data = await getOrgHierarchy()
      const scoped = user?.lob_id && user.role_id !== "LOB_ADMIN" || user?.role_id === "LOB_ADMIN" && user.lob_id
        ? data.filter(h => !user.lob_id || h.lob.id === user.lob_id)
        : data
      setHierarchy(scoped)
      setExpandedLobs(new Set(scoped.map(h => h.lob.id)))
    } catch {
      setError("Failed to load organization structure.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  function toggleLob(id: string) {
    setExpandedLobs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleTeam(id: string) {
    setExpandedTeams(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const totalTeams = hierarchy.reduce((a, h) => a + h.teams.length, 0)
  const totalProjects = hierarchy.reduce((a, h) => a + h.teams.reduce((b, t) => b + t.projects.length, 0), 0)
  const totalApps = hierarchy.reduce((a, h) => a + h.teams.reduce((b, t) => b + t.projects.reduce((c, p) => c + (p.app_count ?? 0), 0), 0), 0)
  const avgHealth = hierarchy.length > 0
    ? Math.round(hierarchy.reduce((a, h) => {
        const scores = h.teams.flatMap(t => t.projects.map(p => p.health_score ?? 100))
        return a + (scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : 100)
      }, 0) / hierarchy.length)
    : 0

  return (
    <div className="min-h-full">
      <PageHeader
        title="Organization"
        description="Browse and manage the LOB → Team → Project hierarchy across your organization"
        actions={
          <PermissionGuard action="create_project">
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setExpandedLobs(new Set(hierarchy.map(h => h.lob.id)))}>
              <LayoutGrid className="w-3.5 h-3.5" /> Expand All
            </Button>
          </PermissionGuard>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "LOBs", value: hierarchy.length, icon: Building2 },
            { label: "Teams", value: totalTeams, icon: Users },
            { label: "Projects", value: totalProjects, icon: FolderOpen },
            { label: "Applications", value: totalApps, icon: Server },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="premium-card px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Avg health bar */}
        {!loading && hierarchy.length > 0 && (
          <div className="premium-card px-5 py-4 flex items-center gap-4">
            <div className="shrink-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Portfolio Health</div>
              <div className={cn("text-2xl font-bold", healthColor(avgHealth).text)}>{avgHealth}</div>
            </div>
            <div className="flex-1">
              <HealthBar score={avgHealth} />
              <div className="mt-1 text-xs text-muted-foreground">{statusLabel(avgHealth)} across all lines of business</div>
            </div>
          </div>
        )}

        {loading && <LoadingShimmer rows={6} className="px-0 pt-0" />}

        {!loading && error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/8 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={load}>Retry</Button>
          </div>
        )}

        {/* Hierarchy Tree */}
        {!loading && !error && (
          <div className="space-y-3">
            {hierarchy.length === 0 ? (
              <div className="premium-card px-6 py-12 text-center">
                <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <div className="text-sm font-semibold text-muted-foreground">No organization data found</div>
              </div>
            ) : hierarchy.map((h, lobIdx) => {
              const lobExpanded = expandedLobs.has(h.lob.id)
              const lobAvgHealth = h.teams.length > 0
                ? Math.round(h.teams.reduce((a, t) => {
                    const s = t.projects.map(p => p.health_score ?? 100)
                    return a + (s.length ? s.reduce((x, y) => x + y, 0) / s.length : 100)
                  }, 0) / h.teams.length)
                : 100

              return (
                <motion.div
                  key={h.lob.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: lobIdx * 0.06 }}
                  className="premium-card overflow-hidden"
                >
                  {/* LOB Header */}
                  <button
                    onClick={() => toggleLob(h.lob.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group text-left"
                  >
                    <motion.div
                      animate={{ rotate: lobExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-foreground">{h.lob.name}</span>
                        <ScoreBadge score={lobAvgHealth} />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{h.lob.description}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                      <span className="hidden sm:block">{h.teams.length} teams</span>
                      <span className="hidden md:block">{h.teams.reduce((a, t) => a + t.projects.length, 0)} projects</span>
                      <PermissionGuard action="manage_users">
                        <button
                          onClick={e => { e.stopPropagation(); setAddTeam({ lob: h.lob }) }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/60 hover:border-border hover:bg-muted transition-all text-[10px] font-semibold opacity-0 group-hover:opacity-100"
                        >
                          <Plus className="w-3 h-3" /> Add Team
                        </button>
                      </PermissionGuard>
                    </div>
                  </button>

                  {/* Teams */}
                  <AnimatePresence initial={false}>
                    {lobExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/50 divide-y divide-border/30">
                          {h.teams.length === 0 ? (
                            <div className="px-10 py-4 text-xs text-muted-foreground italic">No teams yet</div>
                          ) : h.teams.map((t, teamIdx) => {
                            const teamExpanded = expandedTeams.has(t.team.id)
                            const teamAvgHealth = t.projects.length > 0
                              ? Math.round(t.projects.reduce((a, p) => a + (p.health_score ?? 100), 0) / t.projects.length)
                              : (t.team.health_score ?? 100)

                            return (
                              <div key={t.team.id}>
                                {/* Team Row */}
                                <button
                                  onClick={() => toggleTeam(t.team.id)}
                                  className="w-full flex items-center gap-3 pl-10 pr-5 py-3 hover:bg-muted/15 transition-colors group text-left"
                                >
                                  <motion.div
                                    animate={{ rotate: teamExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.18 }}
                                  >
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                                  </motion.div>
                                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                                    <Users className="w-3.5 h-3.5 text-sky-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm text-foreground">{t.team.name}</span>
                                      <ScoreBadge score={teamAvgHealth} />
                                    </div>
                                    {t.team.description && (
                                      <div className="text-xs text-muted-foreground truncate">{t.team.description}</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                                    <span className="hidden sm:block">{t.projects.length} projects</span>
                                    <span className="hidden md:block">{t.projects.reduce((a, p) => a + (p.app_count ?? 0), 0)} apps</span>
                                    <PermissionGuard action="create_project">
                                      <button
                                        onClick={e => { e.stopPropagation(); setAddProject({ team: t.team }); setExpandedTeams(prev => new Set([...prev, t.team.id])) }}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/60 hover:border-border hover:bg-muted transition-all text-[10px] font-semibold opacity-0 group-hover:opacity-100"
                                      >
                                        <Plus className="w-3 h-3" /> Add Project
                                      </button>
                                    </PermissionGuard>
                                  </div>
                                </button>

                                {/* Projects */}
                                <AnimatePresence initial={false}>
                                  {teamExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                      className="overflow-hidden bg-muted/10"
                                    >
                                      {t.projects.length === 0 ? (
                                        <div className="pl-20 pr-5 py-3 text-xs text-muted-foreground italic">No projects yet</div>
                                      ) : (
                                        <div className="pl-20 pr-5 py-2 space-y-1">
                                          {t.projects.map((p, pIdx) => {
                                            const pc = healthColor(p.health_score ?? 100)
                                            return (
                                              <motion.div
                                                key={p.id}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: pIdx * 0.04 }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/40 bg-card hover:border-border/70 hover:bg-muted/20 transition-all group/proj"
                                              >
                                                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", pc.bg)}>
                                                  <FolderOpen className={cn("w-3 h-3", pc.text)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="font-semibold text-xs text-foreground">{p.name}</div>
                                                  {p.description && <div className="text-[10px] text-muted-foreground truncate">{p.description}</div>}
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                  <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Server className="w-3 h-3" /> {p.app_count ?? 0} apps
                                                  </div>
                                                  <div className="w-16 hidden md:block">
                                                    <HealthBar score={p.health_score ?? 100} />
                                                  </div>
                                                  <ScoreBadge score={p.health_score ?? 100} />
                                                </div>
                                              </motion.div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {addTeam && (
          <AddTeamDialog
            lob={addTeam.lob}
            onClose={() => setAddTeam(null)}
            onSave={team => {
              setHierarchy(prev => prev.map(h =>
                h.lob.id === addTeam.lob.id
                  ? { ...h, teams: [...h.teams, { team, projects: [] }] }
                  : h
              ))
              setAddTeam(null)
            }}
          />
        )}
        {addProject && (
          <AddProjectDialog
            team={addProject.team}
            onClose={() => setAddProject(null)}
            onSave={() => { setAddProject(null); load() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
