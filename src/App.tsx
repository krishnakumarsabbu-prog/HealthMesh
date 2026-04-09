import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/context/ThemeContext"
import { AppProvider } from "@/context/AppContext"
import { AppLayout } from "@/components/layout/AppLayout"
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

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<ExecutiveOverview />} />
              <Route path="/catalog" element={<ApplicationCatalog />} />
              <Route path="/app360" element={<Application360 />} />
              <Route path="/connectors" element={<ConnectorHub />} />
              <Route path="/incidents" element={<IncidentsAlerts />} />
              <Route path="/dependencies" element={<DependencyMap />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/health-rules" element={<HealthRules />} />
              <Route path="/onboarding" element={<OnboardingStudio />} />
              <Route path="/trends" element={<HistoricalTrends />} />
              <Route path="/teams" element={<TeamsOwnership />} />
              <Route path="/settings" element={<SettingsAdmin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
