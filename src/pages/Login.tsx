import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { apiFetch } from '../api/client'

export default function Login() {
  const [apiKey, setApiKey] = useState('')
  const [apiBase, setApiBase] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setApiKey: save } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Verify key works by hitting a lightweight endpoint
      localStorage.setItem('chutney_api_key', apiKey.trim())
      if (apiBase.trim()) localStorage.setItem('chutney_api_base', apiBase.trim())
      await apiFetch('/api/v1/platform/credits/balance')
      save(apiKey.trim(), apiBase.trim() || undefined)
      navigate('/inbox')
    } catch {
      setError('Invalid API key. Check your key and try again.')
      localStorage.removeItem('chutney_api_key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">Chutney</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your API key to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="cht_live_..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Base URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={apiBase}
              onChange={e => setApiBase(e.target.value)}
              placeholder="https://your-instance.railway.app"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Verifying…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Powered by <strong>Chutney</strong>
        </p>
      </div>
    </div>
  )
}
