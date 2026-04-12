import type { ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"
import { can, hasMinRole, type Action } from "@/lib/permissions"

interface PermissionGuardProps {
  action?: Action
  minRole?: string
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({ action, minRole, fallback = null, children }: PermissionGuardProps) {
  const { user } = useAuth()

  const allowed =
    (action ? can(user, action) : true) &&
    (minRole ? hasMinRole(user, minRole) : true)

  return allowed ? <>{children}</> : <>{fallback}</>
}
