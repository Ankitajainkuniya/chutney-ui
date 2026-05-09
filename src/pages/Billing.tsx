import { useQuery } from '@tanstack/react-query'
import { getBillingUsage, getInvoices } from '../api/billing'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Billing() {
  const period = new Date().toISOString().slice(0, 7)
  const { data: usage } = useQuery({ queryKey: ['billing-usage', period], queryFn: () => getBillingUsage(period) })
  const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: getInvoices })

  const conversations = (usage?.conversations ?? []) as Array<{
    conversation_type: string; billed_usd: number; created_at: string
  }>

  const chartData = conversations.reduce<Record<string, number>>((acc, c) => {
    const day = c.created_at?.slice(5, 10) ?? '??'
    acc[day] = (acc[day] ?? 0) + (c.billed_usd ?? 0)
    return acc
  }, {})

  const chart = Object.entries(chartData).map(([day, usd]) => ({ day, usd: +usd.toFixed(4) }))

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-lg font-semibold">Billing</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">This month</p>
            <p className="text-2xl font-bold text-gray-900">${usage?.total_billed_usd?.toFixed(4) ?? '0.0000'}</p>
            <p className="text-xs text-gray-400 mt-1">BSP conversations</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 mb-1">Conversations</p>
            <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
            <p className="text-xs text-gray-400 mt-1">{period}</p>
          </div>
        </div>

        {/* Chart */}
        {chart.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">Daily spend (USD)</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chart}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(4)}`} />
                <Bar dataKey="usd" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-medium text-sm text-gray-700">Invoices</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {((invoices?.invoices ?? []) as Array<Record<string, unknown>>).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No invoices yet</p>
            )}
            {((invoices?.invoices ?? []) as Array<Record<string, unknown>>).map((inv, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between text-sm">
                <span className="text-gray-700">{String(inv.billing_period ?? inv.period ?? '—')}</span>
                <span className="font-medium">${Number(inv.total_usd ?? 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
