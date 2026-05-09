import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, ChevronDown, ChevronUp } from 'lucide-react'
import { getAgentConfig, updateAgentConfig, getAgentLogs } from '../api/agent'
import clsx from 'clsx'

export default function AgentConfig() {
  const qc = useQueryClient()
  const [showLogs, setShowLogs] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['agent-config'], queryFn: getAgentConfig })
  const { data: logsData } = useQuery({
    queryKey: ['agent-logs'],
    queryFn: () => getAgentLogs(20),
    enabled: showLogs,
  })

  const [form, setForm] = useState<{
    model: string; system_prompt: string; tools_enabled: string[];
    sql_connection_string: string; max_history: number;
  } | null>(null)

  // Initialise form once data loads
  if (data && !form) {
    setForm({
      model: data.config.model,
      system_prompt: data.config.system_prompt || '',
      tools_enabled: data.config.tools_enabled,
      sql_connection_string: '',
      max_history: data.config.max_history,
    })
  }

  const mutation = useMutation({
    mutationFn: () => updateAgentConfig({
      model: form!.model,
      system_prompt: form!.system_prompt || undefined,
      tools_enabled: form!.tools_enabled,
      sql_connection_string: form!.sql_connection_string || undefined,
      max_history: form!.max_history,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-config'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  if (isLoading || !form || !data) {
    return <div className="p-8 text-sm text-gray-400">Loading…</div>
  }

  function toggleTool(tool: string) {
    setForm(f => f && ({
      ...f,
      tools_enabled: f.tools_enabled.includes(tool)
        ? f.tools_enabled.filter(t => t !== tool)
        : [...f.tools_enabled, tool],
    }))
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Agent Configuration</h1>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save size={14} />
            {saved ? 'Saved!' : mutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>

        {/* Model */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-medium text-sm text-gray-700">Model</h2>
          <div className="grid grid-cols-1 gap-2">
            {data.available_models.map(m => (
              <label key={m} className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors',
                form.model === m ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'
              )}>
                <input type="radio" name="model" value={m} checked={form.model === m}
                  onChange={() => setForm(f => f && ({ ...f, model: m }))} className="accent-brand-600" />
                <span className="text-sm font-mono">{m}</span>
              </label>
            ))}
          </div>
        </div>

        {/* System prompt */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-medium text-sm text-gray-700">System Prompt</h2>
          <textarea
            value={form.system_prompt}
            onChange={e => setForm(f => f && ({ ...f, system_prompt: e.target.value }))}
            rows={5}
            placeholder="You are a helpful WhatsApp customer support assistant…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Tools */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-medium text-sm text-gray-700">Enabled Tools</h2>
          <div className="space-y-2">
            {data.available_tools.map(tool => (
              <label key={tool} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.tools_enabled.includes(tool)}
                  onChange={() => toggleTool(tool)} className="accent-brand-600 w-4 h-4" />
                <span className="text-sm font-mono text-gray-700">{tool}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SQL */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-medium text-sm text-gray-700">SQL Connection String</h2>
          <p className="text-xs text-gray-400">Connect the agent to your own database for order lookups, inventory checks, etc.</p>
          {data.config.sql_connection_string && (
            <p className="text-xs text-brand-600 bg-brand-50 px-3 py-1.5 rounded">Currently configured (hidden for security)</p>
          )}
          <input
            type="password"
            value={form.sql_connection_string}
            onChange={e => setForm(f => f && ({ ...f, sql_connection_string: e.target.value }))}
            placeholder="postgresql://user:pass@host/db"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Max history */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-medium text-sm text-gray-700">Conversation History</h2>
          <div className="flex items-center gap-3">
            <input type="range" min={5} max={100} step={5} value={form.max_history}
              onChange={e => setForm(f => f && ({ ...f, max_history: Number(e.target.value) }))}
              className="flex-1 accent-brand-600" />
            <span className="text-sm font-medium w-12 text-right">{form.max_history} msgs</span>
          </div>
        </div>

        {/* Tool logs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowLogs(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Recent Tool Calls
            {showLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showLogs && (
            <div className="border-t border-gray-100 divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {logsData?.logs.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No tool calls yet</p>
              )}
              {logsData?.logs.map((log, i) => (
                <div key={i} className="px-5 py-3 text-xs space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">{log.tool_name}</span>
                    <span className="text-gray-400">iter {log.iteration}</span>
                    <span className="text-gray-300 ml-auto">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-500 truncate">{log.tool_result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
