const TOKEN_KEY = "healthmesh_token"
const USER_KEY = "healthmesh_user"

export interface AuthUser {
  id: number
  name: string
  email: string
  role_id: string
  role_name: string
  lob_id: string | null
  lob_name: string | null
  team_id: string | null
  team_name: string | null
  project_id: string | null
  project_name: string | null
  is_active: boolean
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function storeAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getRoleLabel(roleId: string): string {
  const map: Record<string, string> = {
    LOB_ADMIN: "LOB Admin",
    TEAM_ADMIN: "Team Admin",
    PROJECT_ADMIN: "Project Admin",
    USER: "Viewer",
  }
  return map[roleId] ?? roleId
}

export function getRoleBadgeColor(roleId: string): string {
  const map: Record<string, string> = {
    LOB_ADMIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    TEAM_ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PROJECT_ADMIN: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    USER: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  }
  return map[roleId] ?? "bg-slate-100 text-slate-600"
}
