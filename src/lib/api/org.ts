import { supabase } from "@/lib/supabase"

export interface OrgUser {
  id: string
  name: string
  email: string
  role_id: string
  lob_id: string | null
  team_id: string | null
  project_id: string | null
  status: string
  created_at: string
  last_active_at: string | null
  lob?: { name: string } | null
  team?: { name: string } | null
  project?: { name: string } | null
}

export interface Lob {
  id: string
  name: string
  description: string
  created_at: string
}

export interface OrgTeam {
  id: string
  lob_id: string
  name: string
  description: string
  health_score: number
  created_at: string
}

export interface Project {
  id: string
  team_id: string
  name: string
  description: string
  app_count: number
  health_score: number
  status: string
  created_at: string
}

export interface OrgHierarchy {
  lob: Lob
  teams: Array<{
    team: OrgTeam
    projects: Project[]
  }>
}

export async function listOrgUsers(): Promise<OrgUser[]> {
  const { data, error } = await supabase
    .from("org_users")
    .select("*, lob:lobs(name), team:org_teams(name), project:projects(name)")
    .order("name")
  if (error) throw error
  return data as OrgUser[]
}

export async function createOrgUser(payload: Omit<OrgUser, "id" | "created_at" | "lob" | "team" | "project">): Promise<OrgUser> {
  const { data, error } = await supabase
    .from("org_users")
    .insert(payload)
    .select("*, lob:lobs(name), team:org_teams(name), project:projects(name)")
    .single()
  if (error) throw error
  return data as OrgUser
}

export async function updateOrgUser(id: string, payload: Partial<OrgUser>): Promise<OrgUser> {
  const { data, error } = await supabase
    .from("org_users")
    .update(payload)
    .eq("id", id)
    .select("*, lob:lobs(name), team:org_teams(name), project:projects(name)")
    .single()
  if (error) throw error
  return data as OrgUser
}

export async function listLobs(): Promise<Lob[]> {
  const { data, error } = await supabase.from("lobs").select("*").order("name")
  if (error) throw error
  return data as Lob[]
}

export async function listOrgTeams(): Promise<OrgTeam[]> {
  const { data, error } = await supabase.from("org_teams").select("*").order("name")
  if (error) throw error
  return data as OrgTeam[]
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*").order("name")
  if (error) throw error
  return data as Project[]
}

export async function createOrgTeam(payload: Omit<OrgTeam, "id" | "created_at">): Promise<OrgTeam> {
  const { data, error } = await supabase.from("org_teams").insert(payload).select().single()
  if (error) throw error
  return data as OrgTeam
}

export async function createProject(payload: Omit<Project, "id" | "created_at">): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert(payload).select().single()
  if (error) throw error
  return data as Project
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
