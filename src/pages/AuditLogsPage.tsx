import { PageHeader } from "@/components/shared/PageHeader"
import { AuditLogs } from "@/pages/settings/AuditLogs"

export function AuditLogsPage() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Audit Logs"
        description="Track all administrative actions, configuration changes, and security events across your workspace"
      />
      <div className="px-6 pb-6">
        <AuditLogs />
      </div>
    </div>
  )
}
