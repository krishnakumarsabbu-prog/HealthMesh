import type { AuthUser } from "@/lib/auth"

export type Action =
  | "manage_users"
  | "create_user"
  | "create_project"
  | "manage_connectors"
  | "edit_connector"
  | "view_audit"
  | "manage_roles"
  | "edit_apps"
  | "view_admin_tools"
  | "manage_health_rules"
  | "manage_maintenance"
  | "manage_sla"
  | "view_all_teams"
  | "add_team_member"
  | "manage_settings"

const ROLE_LEVEL: Record<string, number> = {
  LOB_ADMIN: 4,
  TEAM_ADMIN: 3,
  PROJECT_ADMIN: 2,
  USER: 1,
}

const PERMISSIONS: Record<Action, string[]> = {
  manage_users: ["LOB_ADMIN"],
  create_user: ["LOB_ADMIN"],
  create_project: ["LOB_ADMIN", "TEAM_ADMIN"],
  manage_connectors: ["LOB_ADMIN", "TEAM_ADMIN"],
  edit_connector: ["LOB_ADMIN", "TEAM_ADMIN"],
  view_audit: ["LOB_ADMIN"],
  manage_roles: ["LOB_ADMIN"],
  edit_apps: ["LOB_ADMIN", "TEAM_ADMIN", "PROJECT_ADMIN"],
  view_admin_tools: ["LOB_ADMIN"],
  manage_health_rules: ["LOB_ADMIN", "TEAM_ADMIN"],
  manage_maintenance: ["LOB_ADMIN", "TEAM_ADMIN"],
  manage_sla: ["LOB_ADMIN", "TEAM_ADMIN"],
  view_all_teams: ["LOB_ADMIN"],
  add_team_member: ["LOB_ADMIN", "TEAM_ADMIN"],
  manage_settings: ["LOB_ADMIN"],
}

export function can(user: AuthUser | null, action: Action): boolean {
  if (!user) return false
  const allowed = PERMISSIONS[action]
  return allowed.includes(user.role_id)
}

export function hasMinRole(user: AuthUser | null, minRole: string): boolean {
  if (!user) return false
  const userLevel = ROLE_LEVEL[user.role_id] ?? 0
  const minLevel = ROLE_LEVEL[minRole] ?? 0
  return userLevel >= minLevel
}
