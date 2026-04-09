import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Shield, CircleCheck as CheckCircle2, X, CreditCard as Edit2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const PERMISSIONS = [
  { id: "view_apps", label: "View Applications", group: "Applications" },
  { id: "edit_apps", label: "Edit Applications", group: "Applications" },
  { id: "onboard_apps", label: "Onboard Applications", group: "Applications" },
  { id: "view_incidents", label: "View Incidents", group: "Operations" },
  { id: "manage_incidents", label: "Manage Incidents", group: "Operations" },
  { id: "view_rules", label: "View Health Rules", group: "Operations" },
  { id: "edit_rules", label: "Edit Health Rules", group: "Operations" },
  { id: "manage_connectors", label: "Manage Connectors", group: "Integrations" },
  { id: "view_connectors", label: "View Connectors", group: "Integrations" },
  { id: "manage_teams", label: "Manage Teams", group: "Administration" },
  { id: "manage_users", label: "Manage Users", group: "Administration" },
  { id: "view_audit_logs", label: "View Audit Logs", group: "Administration" },
  { id: "manage_settings", label: "Manage Settings", group: "Administration" },
  { id: "manage_slos", label: "Manage SLOs", group: "Administration" },
]

const ROLES = [
  {
    id: "admin", name: "Admin", description: "Full platform access, can manage users and settings",
    color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20",
    permissions: ["view_apps", "edit_apps", "onboard_apps", "view_incidents", "manage_incidents", "view_rules", "edit_rules", "manage_connectors", "view_connectors", "manage_teams", "manage_users", "view_audit_logs", "manage_settings", "manage_slos"],
    members: ["AC", "RJ"],
  },
  {
    id: "operator", name: "Operator", description: "Can manage incidents, connectors, and health rules",
    color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20",
    permissions: ["view_apps", "edit_apps", "view_incidents", "manage_incidents", "view_rules", "edit_rules", "manage_connectors", "view_connectors", "view_audit_logs"],
    members: ["SL", "JM", "AL"],
  },
  {
    id: "developer", name: "Developer", description: "Can view all data and onboard applications",
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/20",
    permissions: ["view_apps", "edit_apps", "onboard_apps", "view_incidents", "view_rules", "view_connectors"],
    members: ["TP", "ND", "DR", "YT", "KL"],
  },
  {
    id: "viewer", name: "Viewer", description: "Read-only access to dashboards and reports",
    color: "text-muted-foreground", bg: "bg-muted", border: "border-border",
    permissions: ["view_apps", "view_incidents", "view_rules", "view_connectors"],
    members: ["LB", "CP"],
  },
]

const PERMISSION_GROUPS = [...new Set(PERMISSIONS.map(p => p.group))]

export function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState(ROLES[0])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-foreground mb-0.5">Roles & Permissions</div>
          <div className="text-xs text-muted-foreground">Control access levels and define what each role can do in HealthMesh</div>
        </div>
        <Button size="sm" className="gap-2"><Plus className="w-3.5 h-3.5" /> Custom Role</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        {/* Role list */}
        <div className="space-y-2">
          {ROLES.map(role => (
            <motion.button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              whileHover={{ x: 2 }}
              className={cn(
                "w-full text-left rounded-xl border p-3 transition-colors",
                selectedRole.id === role.id
                  ? `${role.bg} ${role.border} border`
                  : "border-border/60 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className={cn("w-3.5 h-3.5", role.color)} />
                <span className={cn("text-sm font-semibold", role.color)}>{role.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-relaxed">{role.description}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex -space-x-1">
                  {role.members.slice(0, 4).map((m, i) => (
                    <Avatar key={i} className="w-5 h-5 border border-card">
                      <AvatarFallback className="text-[8px]">{m}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">{role.members.length} users</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Permission matrix */}
        <div className={cn("rounded-xl border p-5", selectedRole.border, selectedRole.bg)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className={cn("w-4 h-4", selectedRole.color)} />
              <span className={cn("font-bold text-sm", selectedRole.color)}>{selectedRole.name} Role</span>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <Edit2 className="w-3 h-3" /> Edit Role
            </Button>
          </div>

          <div className="space-y-4">
            {PERMISSION_GROUPS.map(group => (
              <div key={group}>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {PERMISSIONS.filter(p => p.group === group).map(perm => {
                    const has = selectedRole.permissions.includes(perm.id)
                    return (
                      <div key={perm.id} className={cn("flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg",
                        has ? "bg-card/60" : "opacity-40"
                      )}>
                        {has
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          : <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        }
                        <span className={has ? "text-foreground" : "text-muted-foreground"}>{perm.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Users with this role</div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedRole.members.map(m => (
                <div key={m} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-card/50 border border-border/40">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-[8px]">{m}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-foreground">{m}</span>
                </div>
              ))}
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                <Users className="w-3 h-3" /> Manage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
