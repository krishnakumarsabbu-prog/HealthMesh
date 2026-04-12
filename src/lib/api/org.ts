import { api } from "@/lib/api/client"

export interface OrgUser {
  id: string
  name: string
  email: string
  role_id: string
  role_name?: string | null
  lob_id: string | null
  team_id: string | null
  project_id: string | null
  status?: string
  created_at?: string
  last_active_at?: string | null
  is_active?: boolean
  lob?: { name: string } | null
  team?: { name: string } | null
  project?: { name: string } | null
  lob_name?: string | null
  team_name?: string | null
  project_name?: string | null
}

export interface Lob {
  id: string
  name: string
  description: string
  created_at?: string
}

export interface OrgTeam {
  id: string
  lob_id: string
  name: string
  description?: string
  health_score?: number
  created_at?: string
}

export interface Project {
  id: string
  team_id: string
  name: string
  description?: string
  app_count?: number
  health_score?: number
  status?: string
  created_at?: string
  lob_id?: string | null
  lob_name?: string | null
  team_name?: string | null
}

export interface OrgHierarchy {
  lob: Lob
  teams: Array<{
    team: OrgTeam
    projects: Project[]
  }>
}

function normalizeUser(u: OrgUser): OrgUser {
  return {
    ...u,
    lob: u.lob ?? (u.lob_name ? { name: u.lob_name } : null),
    team: u.team ?? (u.team_name ? { name: u.team_name } : null),
    project: u.project ?? (u.project_name ? { name: u.project_name } : null),
    status: u.is_active === false ? "inactive" : "active",
  }
}

export async function listOrgUsers(): Promise<OrgUser[]> {
  const users = await api.get<OrgUser[]>("/api/users")
  return users.map(normalizeUser)
}

export async function createOrgUser(
  payload: Omit<OrgUser, "id" | "created_at" | "lob" | "team" | "project"> & { password?: string }
): Promise<OrgUser> {
  const body = {
    name: payload.name,
    email: payload.email,
    password: payload.password ?? "ChangeMe123!",
    role_id: payload.role_id,
    lob_id: payload.lob_id ?? null,
    team_id: payload.team_id ?? null,
    project_id: payload.project_id ?? null,
  }
  const user = await api.post<OrgUser>("/api/users", body)
  return normalizeUser(user)
}

export async function updateOrgUser(id: string, payload: Partial<OrgUser>): Promise<OrgUser> {
  const user = await api.put<OrgUser>(`/api/users/${id}`, payload)
  return normalizeUser(user)
}

export async function listLobs(): Promise<Lob[]> {
  return api.get<Lob[]>("/api/lobs")
}

export async function listOrgTeams(): Promise<OrgTeam[]> {
  return api.get<OrgTeam[]>("/api/teams")
}

export async function listProjects(): Promise<Project[]> {
  return api.get<Project[]>("/api/projects")
}

export async function createOrgTeam(payload: Omit<OrgTeam, "id" | "created_at">): Promise<OrgTeam> {
  return api.post<OrgTeam>("/api/teams", payload)
}

export async function createProject(payload: Omit<Project, "id" | "created_at">): Promise<Project> {
  return api.post<Project>("/api/projects", { name: payload.name, team_id: payload.team_id })
}

export async function getOrgHierarchy(): Promise<OrgHierarchy[]> {
  const [lobs, teams, projects] = await Promise.all([listLobs(), listOrgTeams(), listProjects()])
  return lobs.map(lob => ({
    lob,
    teams: teams
      .filter(t => t.lob_id === lob.id)
      .map(team => ({
        team,
        projects: projects.filter(p => p.team_id === team.id),
      })),
  }))
}
