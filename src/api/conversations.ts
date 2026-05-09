import { apiFetch, apiUrl } from './client'

export interface Conversation {
  id: string
  contact_phone: string
  contact_name: string | null
  status: string
  ai_enabled: boolean
  assigned_to: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

export interface Message {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  content: string
  msg_type: string
  created_at: string
  status: string | null
}

export const getConversations = (limit = 50, status?: string) =>
  apiFetch<{ conversations: Conversation[]; total: number }>(
    `/api/v1/platform/conversations?limit=${limit}${status ? `&status=${status}` : ''}`
  )

export const getMessages = (conversationId: string, limit = 50) =>
  apiFetch<{ messages: Message[]; conversation: Conversation }>(
    `/api/v1/platform/conversations/${conversationId}/messages?limit=${limit}`
  )

export const sendMessage = (conversationId: string, message: string) =>
  apiFetch(`/api/v1/platform/conversations/${conversationId}/send`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })

export const toggleAI = (conversationId: string, enabled: boolean) =>
  apiFetch(`/api/v1/platform/conversations/${conversationId}/ai`, {
    method: 'PATCH',
    body: JSON.stringify({ ai_enabled: enabled }),
  })

export const resolveConversation = (conversationId: string) =>
  apiFetch(`/api/v1/platform/conversations/${conversationId}/resolve`, {
    method: 'PATCH',
  })

export function openStream(onEvent: (data: unknown) => void): () => void {
  const apiKey = localStorage.getItem('chutney_api_key') || ''
  const url = apiUrl(`/api/v1/platform/stream?api_key=${encodeURIComponent(apiKey)}`)
  const es = new EventSource(url)
  es.onmessage = (e) => {
    try { onEvent(JSON.parse(e.data)) } catch { /* non-JSON ping */ }
  }
  return () => es.close()
}
