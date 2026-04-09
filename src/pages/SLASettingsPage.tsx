import { PageHeader } from "@/components/shared/PageHeader"
import { SLASettings } from "@/pages/settings/SLASettings"

export function SLASettingsPage() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="SLA / SLO Settings"
        description="Define service level objectives, track error budgets, and enforce availability commitments"
      />
      <div className="px-6 pb-6">
        <SLASettings />
      </div>
    </div>
  )
}
