import { PageHeader } from "@/components/shared/PageHeader"
import { MaintenanceWindows } from "@/pages/settings/MaintenanceWindows"

export function MaintenanceWindowsPage() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Maintenance Windows"
        description="Schedule downtime windows to suppress alerts and notify stakeholders during planned changes"
      />
      <div className="px-6 pb-6">
        <MaintenanceWindows />
      </div>
    </div>
  )
}
