import { adminGetAllUsers } from '@/app/actions/admin'
import AdminUsersList from '@/components/AdminUsersList'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await adminGetAllUsers()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
          HUNTER DIRECTORY AUDITING
        </h2>
        <p className="text-xs text-gray-500 font-mono">
          Modify hunter level limits, coordinates, stats, and Pro configurations.
        </p>
      </div>

      <AdminUsersList users={users} />
    </div>
  )
}
