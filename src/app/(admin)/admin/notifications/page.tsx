import { adminGetNotifications } from '@/app/actions/admin'
import AdminNotificationsForm from '@/components/AdminNotificationsForm'

export default async function AdminNotificationsPage() {
  const notifications = await adminGetNotifications()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
          SYSTEM BROADCAST MANAGER
        </h2>
        <p className="text-xs text-gray-500 font-mono">
          Dispatch in-app notifications to either global hunter coordinates or specific targets.
        </p>
      </div>

      <AdminNotificationsForm notifications={notifications} />
    </div>
  )
}
