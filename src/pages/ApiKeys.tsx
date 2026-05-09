import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import { apiFetch } from '../api/client'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  is_sandbox: boolean
}

export default function ApiKeys() {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiFetch<{ keys: ApiKey[] }>('/api/v1/platform/keys'),
  })

  const create = useMutation({
    mutationFn: () => apiFetch<{ key: string }>('/api/v1/platform/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
    onSuccess: (res) => {
      setNewKey(res.key)
      setName('')
      qc.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })

  const revoke = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/v1/platform/keys/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  })

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-lg font-semibold">API Keys</h1>

        {/* New key revealed */}
        {newKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-amber-800">Save this key — it won't be shown again</p>
            <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
              <code className="flex-1 text-xs font-mono text-gray-800 truncate">
                {showKey ? newKey : '•'.repeat(40)}
              </code>
              <button onClick={() => setShowKey(v => !v)} className="text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={() => copy(newKey)} className="text-gray-400 hover:text-gray-600">
                <Copy size={14} />
              </button>
            </div>
            {copied && <p className="text-xs text-amber-600">Copied!</p>}
          </div>
        )}

        {/* Create */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium text-sm text-gray-700 mb-3">Create new key</h2>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Production, Mobile app"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={() => create.mutate()}
              disabled={!name.trim() || create.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

        {/* Keys list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {data?.keys.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No API keys yet</p>
            )}
            {data?.keys.map(k => (
              <div key={k.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{k.name || 'Unnamed key'}</p>
                    {k.is_sandbox && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">sandbox</span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{k.key_prefix}•••</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => revoke.mutate(k.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Revoke key"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
