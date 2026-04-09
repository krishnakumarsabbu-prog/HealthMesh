import { PageHeader } from "@/components/shared/PageHeader"
import { SystemStatus } from "@/pages/settings/SystemStatus"

export function SystemStatusPage() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="System Status"
        description="Real-time health of HealthMesh platform infrastructure, services, and uptime history"
      />
      <div className="px-6 pb-6">
        <SystemStatus />
      </div>
    </div>
  )
}
