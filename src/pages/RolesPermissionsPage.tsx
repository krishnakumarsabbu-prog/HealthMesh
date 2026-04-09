import { PageHeader } from "@/components/shared/PageHeader"
import { RolesPermissions } from "@/pages/settings/RolesPermissions"

export function RolesPermissionsPage() {
  return (
    <div className="min-h-full">
      <PageHeader
        title="Roles & Permissions"
        description="Control who can access what in HealthMesh — define roles and assign permission sets"
      />
      <div className="px-6 pb-6">
        <RolesPermissions />
      </div>
    </div>
  )
}
