import { getBkashConfig } from '@/app/actions/bkash'
import { adminGetBkashRequests } from '@/app/actions/admin'
import AdminBkashPanel from '@/components/AdminBkashPanel'

export const dynamic = 'force-dynamic'

export default async function AdminBkashPage() {
  const config = await getBkashConfig()
  const requests = await adminGetBkashRequests()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-mono text-white uppercase tracking-wider">
          MONARCH AWAKENING GATEWAYS (bKash)
        </h2>
        <p className="text-xs text-gray-500 font-mono">
          Verify manual player transaction credentials, authorize Pro status upgrades, and configure pricing plans.
        </p>
      </div>

      <AdminBkashPanel 
        initialConfig={config} 
        initialRequests={requests} 
      />
    </div>
  )
}
