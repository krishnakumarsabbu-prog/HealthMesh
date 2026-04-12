import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/context/ThemeContext"
import { AppProvider } from "@/context/AppContext"
import { AuthProvider } from "@/context/AuthContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Login } from "@/pages/Login"
import { ExecutiveOverview } from "@/pages/ExecutiveOverview"
import { ApplicationCatalog } from "@/pages/ApplicationCatalog"
import { Application360 } from "@/pages/Application360"
import { ConnectorHub } from "@/pages/ConnectorHub"
import { IncidentsAlerts } from "@/pages/IncidentsAlerts"
import { DependencyMap } from "@/pages/DependencyMap"
import { AIInsights } from "@/pages/AIInsights"
import { HealthRules } from "@/pages/HealthRules"
import { OnboardingStudio } from "@/pages/OnboardingStudio"
import { HistoricalTrends } from "@/pages/HistoricalTrends"
import { TeamsOwnership } from "@/pages/TeamsOwnership"
import { SettingsAdmin } from "@/pages/SettingsAdmin"
import { MaintenanceWindowsPage } from "@/pages/MaintenanceWindowsPage"
import { SLASettingsPage } from "@/pages/SLASettingsPage"
import { AuditLogsPage } from "@/pages/AuditLogsPage"
import { RolesPermissionsPage } from "@/pages/RolesPermissionsPage"
import { UserManagementPage } from "@/pages/UserManagementPage"
import { OrganizationPage } from "@/pages/OrganizationPage"
import { SystemStatusPage } from "@/pages/SystemStatusPage"

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<ExecutiveOverview />} />
                  <Route path="/catalog" element={<ApplicationCatalog />} />
                  <Route path="/app360" element={<Application360 />} />
                  <Route path="/connectors" element={<ConnectorHub />} />
                  <Route path="/incidents" element={<IncidentsAlerts />} />
                  <Route path="/dependencies" element={<DependencyMap />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/health-rules" element={<HealthRules />} />
                  <Route path="/trends" element={<HistoricalTrends />} />
                  <Route path="/teams" element={<TeamsOwnership />} />

                  <Route element={<ProtectedRoute requiredMinRole="TEAM_ADMIN" />}>
                    <Route path="/onboarding" element={<OnboardingStudio />} />
                    <Route path="/maintenance" element={<MaintenanceWindowsPage />} />
                    <Route path="/sla" element={<SLASettingsPage />} />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="manage_settings" />}>
                    <Route path="/settings" element={<SettingsAdmin />} />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="view_audit" />}>
                    <Route path="/audit" element={<AuditLogsPage />} />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="manage_roles" />}>
                    <Route path="/roles" element={<RolesPermissionsPage />} />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
                    <Route path="/users" element={<UserManagementPage />} />
                  </Route>

                  <Route path="/organization" element={<OrganizationPage />} />

                  <Route element={<ProtectedRoute requiredPermission="view_admin_tools" />}>
                    <Route path="/system-status" element={<SystemStatusPage />} />
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
