import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { can, hasMinRole, type Action } from "@/lib/permissions"

interface ProtectedRouteProps {
  requiredPermission?: Action
  requiredMinRole?: string
  redirectTo?: string
}

export function ProtectedRoute({
  requiredPermission,
  requiredMinRole,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && !can(user, requiredPermission)) {
    return <Navigate to={redirectTo} replace />
  }

  if (requiredMinRole && !hasMinRole(user, requiredMinRole)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
