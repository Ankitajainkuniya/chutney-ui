const BASE_URL = import.meta.env.VITE_API_URL || 'https://web-production-82d65.up.railway.app'

export function apiUrl(path: string) {
  return `${BASE_URL}${path}`
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiKey = localStorage.getItem('chutney_api_key') || ''
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}
