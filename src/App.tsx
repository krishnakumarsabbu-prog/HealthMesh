import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import { ThemeProvider } from "@/context/ThemeContext"
import { AppProvider } from "@/context/AppContext"
import { AuthProvider } from "@/context/AuthContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Login } from "@/pages/Login"
import { LoadingShimmer } from "@/components/shared/LoadingShimmer"

const ExecutiveOverview = lazy(() => import("@/pages/ExecutiveOverview").then(m => ({ default: m.ExecutiveOverview })))
const ApplicationCatalog = lazy(() => import("@/pages/ApplicationCatalog").then(m => ({ default: m.ApplicationCatalog })))
const Application360 = lazy(() => import("@/pages/Application360").then(m => ({ default: m.Application360 })))
const ConnectorHub = lazy(() => import("@/pages/ConnectorHub").then(m => ({ default: m.ConnectorHub })))
const IncidentsAlerts = lazy(() => import("@/pages/IncidentsAlerts").then(m => ({ default: m.IncidentsAlerts })))
const DependencyMap = lazy(() => import("@/pages/DependencyMap").then(m => ({ default: m.DependencyMap })))
const AIInsights = lazy(() => import("@/pages/AIInsights").then(m => ({ default: m.AIInsights })))
const HealthRules = lazy(() => import("@/pages/HealthRules").then(m => ({ default: m.HealthRules })))
const OnboardingStudio = lazy(() => import("@/pages/OnboardingStudio").then(m => ({ default: m.OnboardingStudio })))
const HistoricalTrends = lazy(() => import("@/pages/HistoricalTrends").then(m => ({ default: m.HistoricalTrends })))
const TeamsOwnership = lazy(() => import("@/pages/TeamsOwnership").then(m => ({ default: m.TeamsOwnership })))
const SettingsAdmin = lazy(() => import("@/pages/SettingsAdmin").then(m => ({ default: m.SettingsAdmin })))
const MaintenanceWindowsPage = lazy(() => import("@/pages/MaintenanceWindowsPage").then(m => ({ default: m.MaintenanceWindowsPage })))
const SLASettingsPage = lazy(() => import("@/pages/SLASettingsPage").then(m => ({ default: m.SLASettingsPage })))
const AuditLogsPage = lazy(() => import("@/pages/AuditLogsPage").then(m => ({ default: m.AuditLogsPage })))
const RolesPermissionsPage = lazy(() => import("@/pages/RolesPermissionsPage").then(m => ({ default: m.RolesPermissionsPage })))
const UserManagementPage = lazy(() => import("@/pages/UserManagementPage").then(m => ({ default: m.UserManagementPage })))
const OrganizationPage = lazy(() => import("@/pages/OrganizationPage").then(m => ({ default: m.OrganizationPage })))
const SystemStatusPage = lazy(() => import("@/pages/SystemStatusPage").then(m => ({ default: m.SystemStatusPage })))
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage").then(m => ({ default: m.ProjectsPage })))
const OperationsTab = lazy(() => import("@/pages/OperationsTab").then(m => ({ default: m.OperationsTab })))

function PageFallback() {
  return (
    <div className="min-h-full bg-background px-6 py-6">
      <LoadingShimmer rows={4} />
    </div>
  )
}

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
                  <Route index element={
                    <Suspense fallback={<PageFallback />}>
                      <ExecutiveOverview />
                    </Suspense>
                  } />
                  <Route path="/catalog" element={
                    <Suspense fallback={<PageFallback />}><ApplicationCatalog /></Suspense>
                  } />
                  <Route path="/app360" element={
                    <Suspense fallback={<PageFallback />}><Application360 /></Suspense>
                  } />
                  <Route path="/connectors" element={
                    <Suspense fallback={<PageFallback />}><ConnectorHub /></Suspense>
                  } />
                  <Route path="/incidents" element={
                    <Suspense fallback={<PageFallback />}><IncidentsAlerts /></Suspense>
                  } />
                  <Route path="/operations" element={
                    <Suspense fallback={<PageFallback />}><OperationsTab /></Suspense>
                  } />
                  <Route path="/dependencies" element={
                    <Suspense fallback={<PageFallback />}><DependencyMap /></Suspense>
                  } />
                  <Route path="/ai-insights" element={
                    <Suspense fallback={<PageFallback />}><AIInsights /></Suspense>
                  } />
                  <Route path="/health-rules" element={
                    <Suspense fallback={<PageFallback />}><HealthRules /></Suspense>
                  } />
                  <Route path="/trends" element={
                    <Suspense fallback={<PageFallback />}><HistoricalTrends /></Suspense>
                  } />
                  <Route path="/teams" element={
                    <Suspense fallback={<PageFallback />}><TeamsOwnership /></Suspense>
                  } />

                  <Route element={<ProtectedRoute requiredMinRole="TEAM_ADMIN" />}>
                    <Route path="/onboarding" element={
                      <Suspense fallback={<PageFallback />}><OnboardingStudio /></Suspense>
                    } />
                    <Route path="/maintenance" element={
                      <Suspense fallback={<PageFallback />}><MaintenanceWindowsPage /></Suspense>
                    } />
                    <Route path="/sla" element={
                      <Suspense fallback={<PageFallback />}><SLASettingsPage /></Suspense>
                    } />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="manage_settings" />}>
                    <Route path="/settings" element={
                      <Suspense fallback={<PageFallback />}><SettingsAdmin /></Suspense>
                    } />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="view_audit" />}>
                    <Route path="/audit" element={
                      <Suspense fallback={<PageFallback />}><AuditLogsPage /></Suspense>
                    } />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="manage_roles" />}>
                    <Route path="/roles" element={
                      <Suspense fallback={<PageFallback />}><RolesPermissionsPage /></Suspense>
                    } />
                  </Route>

                  <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
                    <Route path="/users" element={
                      <Suspense fallback={<PageFallback />}><UserManagementPage /></Suspense>
                    } />
                  </Route>

                  <Route path="/organization" element={
                    <Suspense fallback={<PageFallback />}><OrganizationPage /></Suspense>
                  } />
                  <Route path="/projects" element={
                    <Suspense fallback={<PageFallback />}><ProjectsPage /></Suspense>
                  } />

                  <Route element={<ProtectedRoute requiredPermission="view_admin_tools" />}>
                    <Route path="/system-status" element={
                      <Suspense fallback={<PageFallback />}><SystemStatusPage /></Suspense>
                    } />
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
