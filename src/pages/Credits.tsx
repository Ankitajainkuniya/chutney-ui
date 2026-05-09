import { useQuery } from '@tanstack/react-query'
import { Coins } from 'lucide-react'
import { getCreditsBalance, getCreditsHistory } from '../api/billing'

export default function Credits() {
  const { data: balance } = useQuery({ queryKey: ['credits-balance'], queryFn: getCreditsBalance })
  const { data: history } = useQuery({ queryKey: ['credits-history'], queryFn: getCreditsHistory })

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-xl space-y-6">
        <h1 className="text-lg font-semibold">AI Credits</h1>

        {/* Balance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
            <Coins size={22} className="text-brand-700" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Current balance</p>
            <p className="text-3xl font-bold text-gray-900">{balance?.balance ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">credits</p>
          </div>
        </div>

        {/* Top up CTA */}
        <div className="bg-brand-50 rounded-xl border border-brand-100 p-5">
          <p className="text-sm font-medium text-brand-800 mb-1">Need more credits?</p>
          <p className="text-xs text-brand-600 mb-3">Each AI credit costs $0.01 and is consumed per agent operation.</p>
          <a
            href="mailto:ankitajainkuniya@gmail.com?subject=Chutney credit top-up"
            className="inline-flex px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Request top-up
          </a>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-medium text-sm text-gray-700">Usage history</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {((history?.history ?? []) as Array<Record<string, unknown>>).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No credit usage yet</p>
            )}
            {((history?.history ?? []) as Array<Record<string, unknown>>).map((h, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-700">{String(h.operation ?? 'AI operation')}</p>
                  <p className="text-xs text-gray-400">{h.created_at ? new Date(String(h.created_at)).toLocaleString() : ''}</p>
                </div>
                <span className="text-red-500 font-medium">-{String(h.credits_used ?? 1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
