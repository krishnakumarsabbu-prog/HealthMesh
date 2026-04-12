import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Plus, Search, X, ChevronDown, MoveHorizontal as MoreHorizontal, UserCheck, UserX, Pencil, Shield, Building2, Layers, FolderOpen, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader as Loader2 } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/PermissionGuard"
import { LoadingShimmer } from "@/components/shared/LoadingShimmer"
import {
  listOrgUsers, createOrgUser, updateOrgUser, listLobs, listOrgTeams, listProjects,
  type OrgUser, type Lob, type OrgTeam, type Project,
} from "@/lib/api/org"

const ROLES = [
  { id: "LOB_ADMIN", label: "LOB Admin", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  { id: "TEAM_ADMIN", label: "Team Admin", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { id: "PROJECT_ADMIN", label: "Project Admin", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  { id: "USER", label: "User", color: "bg-muted text-muted-foreground border-border" },
]

const STATUSES = ["active", "inactive", "pending"]

function getRoleMeta(roleId: string) {
  return ROLES.find(r => r.id === roleId) ?? ROLES[3]
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function StatusPill({ status }: { status: string }) {
  if (status === "active") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <CheckCircle className="w-2.5 h-2.5" /> Active
    </span>
  )
  if (status === "inactive") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
      <UserX className="w-2.5 h-2.5" /> Inactive
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
      <Clock className="w-2.5 h-2.5" /> Pending
    </span>
  )
}

interface AddUserDialogProps {
  lobs: Lob[]
  teams: OrgTeam[]
  projects: Project[]
  onClose: () => void
  onSave: (user: OrgUser) => void
}

function AddUserDialog({ lobs, teams, projects, onClose, onSave }: AddUserDialogProps) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role_id: "USER",
    lob_id: "", team_id: "", project_id: "", status: "active",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const filteredTeams = teams.filter(t => !form.lob_id || t.lob_id === form.lob_id)
  const filteredProjects = projects.filter(p => !form.team_id || p.team_id === form.team_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return }
    if (!form.password.trim() || form.password.length < 8) { setError("Password must be at least 8 characters."); return }
    setSaving(true)
    setError("")
    try {
      const created = await createOrgUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role_id: form.role_id,
        lob_id: form.lob_id || null,
        team_id: form.team_id || null,
        project_id: form.project_id || null,
        status: form.status,
        last_active_at: null,
      })
      onSave(created)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create user"
      setError(msg.includes("duplicate") ? "A user with this email already exists." : msg)
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
        className="bg-card border border-border rounded-2xl shadow-elevation-3 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">Add User</div>
              <div className="text-xs text-muted-foreground">Invite a new user to HealthMesh</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Full Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Email *</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@acme.io" className="h-8 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Password * (min 8 chars)</label>
            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="h-8 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Role</label>
              <select
                value={form.role_id}
                onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Line of Business</label>
            <select
              value={form.lob_id}
              onChange={e => setForm(f => ({ ...f, lob_id: e.target.value, team_id: "", project_id: "" }))}
              className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— None —</option>
              {lobs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Team</label>
              <select
                value={form.team_id}
                onChange={e => setForm(f => ({ ...f, team_id: e.target.value, project_id: "" }))}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— None —</option>
                {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Project</label>
              <select
                value={form.project_id}
                onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— None —</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/8 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="flex-1 gap-1.5" disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {saving ? "Adding…" : "Add User"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

interface EditUserDrawerProps {
  user: OrgUser
  lobs: Lob[]
  teams: OrgTeam[]
  projects: Project[]
  onClose: () => void
  onSave: (user: OrgUser) => void
}

function EditUserDrawer({ user, lobs, teams, projects, onClose, onSave }: EditUserDrawerProps) {
  const [form, setForm] = useState({
    role_id: user.role_id,
    lob_id: user.lob_id ?? "",
    team_id: user.team_id ?? "",
    project_id: user.project_id ?? "",
    status: user.status,
  })
  const [saving, setSaving] = useState(false)

  const filteredTeams = teams.filter(t => !form.lob_id || t.lob_id === form.lob_id)
  const filteredProjects = projects.filter(p => !form.team_id || p.team_id === form.team_id)

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateOrgUser(user.id, {
        role_id: form.role_id,
        lob_id: form.lob_id || null,
        team_id: form.team_id || null,
        project_id: form.project_id || null,
        status: form.status,
      })
      onSave(updated)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate() {
    setSaving(true)
    try {
      const updated = await updateOrgUser(user.id, { status: "inactive" })
      onSave(updated)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-[400px] bg-card border-l border-border flex flex-col shadow-elevation-3"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-sm font-bold">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setForm(f => ({ ...f, role_id: r.id }))}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left",
                    form.role_id === r.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Status</label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg border text-xs font-semibold capitalize transition-all",
                    form.status === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Line of Business</label>
              <select
                value={form.lob_id}
                onChange={e => setForm(f => ({ ...f, lob_id: e.target.value, team_id: "", project_id: "" }))}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— None —</option>
                {lobs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Team</label>
              <select
                value={form.team_id}
                onChange={e => setForm(f => ({ ...f, team_id: e.target.value, project_id: "" }))}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— None —</option>
                {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Project</label>
              <select
                value={form.project_id}
                onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— None —</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium text-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last active</span>
              <span className="font-medium text-foreground">
                {user.last_active_at ? new Date(user.last_active_at).toLocaleString() : "Never"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4 space-y-2">
          {user.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-rose-600 border-rose-500/30 hover:bg-rose-500/8"
              onClick={handleDeactivate}
              disabled={saving}
            >
              <UserX className="w-3.5 h-3.5" /> Deactivate User
            </Button>
          )}
          <Button size="sm" className="w-full gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </>
  )
}

export function UserManagementPage() {
  const [users, setUsers] = useState<OrgUser[]>([])
  const [lobs, setLobs] = useState<Lob[]>([])
  const [teams, setTeams] = useState<OrgTeam[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<OrgUser | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [u, l, t, p] = await Promise.all([listOrgUsers(), listLobs(), listOrgTeams(), listProjects()])
      setUsers(u); setLobs(l); setTeams(t); setProjects(p)
    } catch {
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) ||
      (u.lob?.name ?? "").toLowerCase().includes(q) || (u.team?.name ?? "").toLowerCase().includes(q)
    const matchRole = !filterRole || u.role_id === filterRole
    const matchStatus = !filterStatus || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    admins: users.filter(u => u.role_id === "LOB_ADMIN" || u.role_id === "TEAM_ADMIN").length,
    pending: users.filter(u => u.status === "pending").length,
  }

  return (
    <div className="min-h-full" onClick={() => setActionMenuOpen(null)}>
      <PageHeader
        title="User Management"
        description="Manage user access, roles, and organizational scope across HealthMesh"
        actions={
          <PermissionGuard action="manage_users">
            <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-3.5 h-3.5" /> Add User
            </Button>
          </PermissionGuard>
        }
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "text-foreground" },
            { label: "Active", value: stats.active, icon: CheckCircle, color: "text-emerald-500" },
            { label: "Admins", value: stats.admins, icon: Shield, color: "text-sky-500" },
            { label: "Pending", value: stats.pending, icon: Clock, color: stats.pending > 0 ? "text-amber-500" : "text-foreground" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="premium-card px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                <s.icon className={cn("w-3.5 h-3.5", s.color)} />
              </div>
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 h-8 text-sm" />
          </div>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring min-w-[140px]"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring min-w-[130px]"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          {(filterRole || filterStatus || search) && (
            <button
              onClick={() => { setSearch(""); setFilterRole(""); setFilterStatus("") }}
              className="flex items-center gap-1 h-8 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {users.length} users</span>
        </div>

        {/* Table */}
        {loading && <LoadingShimmer rows={8} className="px-0 pt-0" />}

        {!loading && error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/8 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={load}>Retry</Button>
          </div>
        )}

        {!loading && !error && (
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">LOB</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Team</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Project</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Last Active</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center">
                          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                          <div className="text-sm font-semibold text-muted-foreground">No users found</div>
                          <div className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters</div>
                        </td>
                      </tr>
                    ) : filtered.map((u, i) => {
                      const roleMeta = getRoleMeta(u.role_id)
                      return (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="text-xs font-bold">{getInitials(u.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-foreground">{u.name}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", roleMeta.color)}>
                              <Shield className="w-2.5 h-2.5" /> {roleMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {u.lob?.name ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Building2 className="w-3 h-3 shrink-0" /> {u.lob.name}
                              </div>
                            ) : <span className="text-xs text-muted-foreground/50">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {u.team?.name ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="w-3 h-3 shrink-0" /> {u.team.name}
                              </div>
                            ) : <span className="text-xs text-muted-foreground/50">—</span>}
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            {u.project?.name ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FolderOpen className="w-3 h-3 shrink-0" /> {u.project.name}
                              </div>
                            ) : <span className="text-xs text-muted-foreground/50">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={u.status ?? "active"} />
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                            {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : "Never"}
                          </td>
                          <td className="px-4 py-3 relative">
                            <PermissionGuard action="manage_users">
                              <button
                                onClick={e => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === u.id ? null : u.id) }}
                                className="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <AnimatePresence>
                                {actionMenuOpen === u.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute right-4 top-full z-20 mt-1 w-40 bg-card border border-border rounded-xl shadow-elevation-2 overflow-hidden"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <button
                                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                                      onClick={() => { setEditingUser(u); setActionMenuOpen(null) }}
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Edit User
                                    </button>
                                    {u.status === "active" && (
                                      <button
                                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/8 transition-colors"
                                        onClick={async () => {
                                          setActionMenuOpen(null)
                                          const updated = await updateOrgUser(u.id, { status: "inactive" })
                                          setUsers(prev => prev.map(x => x.id === u.id ? updated : x))
                                        }}
                                      >
                                        <UserX className="w-3.5 h-3.5" /> Deactivate
                                      </button>
                                    )}
                                    {u.status === "inactive" && (
                                      <button
                                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/8 transition-colors"
                                        onClick={async () => {
                                          setActionMenuOpen(null)
                                          const updated = await updateOrgUser(u.id, { status: "active" })
                                          setUsers(prev => prev.map(x => x.id === u.id ? updated : x))
                                        }}
                                      >
                                        <UserCheck className="w-3.5 h-3.5" /> Reactivate
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </PermissionGuard>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddDialog && (
          <AddUserDialog
            lobs={lobs} teams={teams} projects={projects}
            onClose={() => setShowAddDialog(false)}
            onSave={u => { setUsers(prev => [...prev, u]); setShowAddDialog(false) }}
          />
        )}
        {editingUser && (
          <EditUserDrawer
            user={editingUser} lobs={lobs} teams={teams} projects={projects}
            onClose={() => setEditingUser(null)}
            onSave={u => { setUsers(prev => prev.map(x => x.id === u.id ? u : x)); setEditingUser(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
