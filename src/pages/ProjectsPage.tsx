import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown, ChevronRight, Plus, FolderOpen, Users, Building2,
  Activity, Search, X, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle,
  CircleAlert as AlertCircle, Circle, Layers
} from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/useApi"
import { getOrgHierarchy, createProject, type OrgHierarchy, type Project } from "@/lib/api/org"
import { useAuth } from "@/context/AuthContext"
import { can } from "@/lib/permissions"

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-500"
  if (score >= 70) return "text-amber-500"
  return "text-red-500"
}

function scoreBg(score: number) {
  if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20"
  if (score >= 70) return "bg-amber-500/10 border-amber-500/20"
  return "bg-red-500/10 border-red-500/20"
}

function statusFromScore(score: number): "healthy" | "warning" | "critical" {
  if (score >= 90) return "healthy"
  if (score >= 70) return "warning"
  return "critical"
}

function StatusIcon({ score }: { score: number }) {
  const s = statusFromScore(score)
  if (s === "healthy") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
  if (s === "warning") return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
  return <AlertCircle className="w-3.5 h-3.5 text-red-500" />
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/2 transition-all duration-150 cursor-pointer group"
    >
      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", scoreBg(project.health_score))}>
        <FolderOpen className={cn("w-4 h-4", scoreColor(project.health_score))} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{project.name}</span>
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
            project.status === "active"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border/40"
          )}>
            {project.status}
          </span>
        </div>
        {project.description && (
          <div className="text-[11px] text-muted-foreground truncate mt-0.5">{project.description}</div>
        )}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Layers className="w-3.5 h-3.5" />
          <span>{project.app_count} apps</span>
        </div>
        <div className={cn("flex items-center gap-1.5 text-xs font-bold font-mono tabular-nums", scoreColor(project.health_score))}>
          <StatusIcon score={project.health_score} />
          {project.health_score}
        </div>
      </div>
    </motion.div>
  )
}

interface CreateProjectModalProps {
  teamId: string
  teamName: string
  onClose: () => void
  onCreated: () => void
}

function CreateProjectModal({ teamId, teamName, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError("")
    try {
      await createProject({ team_id: teamId, name: name.trim(), description: description.trim(), app_count: 0, health_score: 100, status: "active" })
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-2xl shadow-2xl max-w-md mx-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-base font-bold text-foreground">New Project</div>
            <div className="text-xs text-muted-foreground mt-0.5">Under team: {teamName}</div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Project Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Customer Portal" autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description (optional)</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="flex-1 gap-2" disabled={loading || !name.trim()}>
              <Plus className="w-3.5 h-3.5" />
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </motion.div>
    </>
  )
}

interface TeamSectionProps {
  teamName: string
  teamId: string
  lobName: string
  healthScore: number
  projects: Project[]
  defaultOpen?: boolean
  canCreate: boolean
  onCreateProject: (teamId: string, teamName: string) => void
}

function TeamSection({ teamName, teamId, healthScore, projects, defaultOpen = false, canCreate, onCreateProject }: TeamSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors text-left"
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
        <Users className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="flex-1 text-sm font-semibold text-foreground">{teamName}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
          <div className={cn("text-xs font-bold font-mono tabular-nums", scoreColor(healthScore))}>
            {healthScore > 0 ? healthScore : "—"}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 border-t border-border/40">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center mb-3">
                    <FolderOpen className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <div className="text-xs text-muted-foreground">No projects in this team yet</div>
                </div>
              ) : (
                projects.map(p => <ProjectCard key={p.id} project={p} />)
              )}
              {canCreate && (
                <button
                  onClick={() => onCreateProject(teamId, teamName)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-150"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add project to {teamName}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface LobSectionProps {
  hierarchy: OrgHierarchy
  search: string
  canCreate: boolean
  onCreateProject: (teamId: string, teamName: string) => void
  defaultOpen?: boolean
}

function LobSection({ hierarchy, search, canCreate, onCreateProject, defaultOpen = true }: LobSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const filteredTeams = useMemo(() => {
    if (!search) return hierarchy.teams
    const q = search.toLowerCase()
    return hierarchy.teams
      .map(t => ({
        ...t,
        projects: t.projects.filter(p =>
          p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
        ),
      }))
      .filter(t => t.team.name.toLowerCase().includes(q) || t.projects.length > 0)
  }, [hierarchy.teams, search])

  const totalProjects = hierarchy.teams.reduce((s, t) => s + t.projects.length, 0)
  const avgHealth = hierarchy.teams.length > 0
    ? Math.round(hierarchy.teams.reduce((s, t) => s + t.team.health_score, 0) / hierarchy.teams.length)
    : 0

  if (filteredTeams.length === 0) return null

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 text-left group"
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
        <Building2 className="w-5 h-5 text-muted-foreground" />
        <span className="text-base font-bold text-foreground flex-1">{hierarchy.lob.name}</span>
        <div className="flex items-center gap-3 shrink-0 opacity-70">
          <Badge variant="secondary" size="sm">{filteredTeams.length} teams</Badge>
          <span className="text-xs text-muted-foreground">{totalProjects} projects</span>
          {avgHealth > 0 && (
            <span className={cn("text-xs font-bold font-mono tabular-nums", scoreColor(avgHealth))}>{avgHealth} avg</span>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden pl-5 space-y-2.5"
          >
            {filteredTeams.map(({ team, projects }) => (
              <TeamSection
                key={team.id}
                teamId={team.id}
                teamName={team.name}
                lobName={hierarchy.lob.name}
                healthScore={team.health_score}
                projects={projects}
                defaultOpen={filteredTeams.length === 1}
                canCreate={canCreate}
                onCreateProject={onCreateProject}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ProjectsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [createFor, setCreateFor] = useState<{ teamId: string; teamName: string } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: hierarchyData, loading } = useApi(() => getOrgHierarchy(), [refreshKey])
  const rawHierarchy: OrgHierarchy[] = hierarchyData ?? []
  const hierarchy: OrgHierarchy[] = useMemo(() => {
    if (!user?.lob_id) return rawHierarchy
    return rawHierarchy.filter(h => h.lob.id === user.lob_id)
  }, [rawHierarchy, user])
  const canCreate = can(user, "create_project")

  const stats = useMemo(() => {
    const allProjects = hierarchy.flatMap(h => h.teams.flatMap(t => t.projects))
    const allTeams = hierarchy.flatMap(h => h.teams)
    return {
      lobs: hierarchy.length,
      teams: allTeams.length,
      projects: allProjects.length,
      healthy: allProjects.filter(p => p.health_score >= 90).length,
      atRisk: allProjects.filter(p => p.health_score < 70).length,
    }
  }, [hierarchy])

  return (
    <>
      <AnimatePresence>
        {createFor && (
          <CreateProjectModal
            teamId={createFor.teamId}
            teamName={createFor.teamName}
            onClose={() => setCreateFor(null)}
            onCreated={() => setRefreshKey(k => k + 1)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-full">
        <PageHeader
          title="Projects"
          description="Browse and manage all projects grouped by Line of Business and Team"
          actions={
            <PermissionGuard action="create_project">
              <Button size="sm" className="gap-2" onClick={() => setCreateFor({ teamId: "", teamName: "" })}>
                <Plus className="w-3.5 h-3.5" /> New Project
              </Button>
            </PermissionGuard>
          }
        />

        <div className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Lines of Business", value: stats.lobs, icon: <Building2 className="w-4 h-4 text-muted-foreground" />, color: "text-foreground" },
              { label: "Teams", value: stats.teams, icon: <Users className="w-4 h-4 text-muted-foreground" />, color: "text-foreground" },
              { label: "Total Projects", value: stats.projects, icon: <FolderOpen className="w-4 h-4 text-primary" />, color: "text-primary" },
              { label: "Healthy", value: stats.healthy, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: "text-emerald-500" },
              { label: "At Risk", value: stats.atRisk, icon: <AlertTriangle className="w-4 h-4 text-red-500" />, color: "text-red-500" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="premium-card p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">{s.icon}</div>
                <div>
                  <div className={cn("text-xl font-bold leading-tight", s.color)}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects or teams..."
              className="pl-9 h-8 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : hierarchy.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1.5">No organization data</div>
              <div className="text-xs text-muted-foreground">Set up LOBs and teams in the Organization page first</div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {hierarchy.map((h, i) => (
                <LobSection
                  key={h.lob.id}
                  hierarchy={h}
                  search={search}
                  canCreate={canCreate}
                  onCreateProject={(teamId, teamName) => setCreateFor({ teamId, teamName })}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
