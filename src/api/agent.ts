import { apiFetch } from './client'

export interface AgentConfig {
  model: string
  system_prompt: string | null
  tools_enabled: string[]
  http_allowed_urls: string[]
  sql_connection_string: string | null
  a2a_agents: { name: string; description: string; url: string; api_key?: string }[]
  max_history: number
}

export interface AgentLog {
  tool_name: string
  tool_input: Record<string, unknown>
  tool_result: string
  iteration: number
  conv_id: string
  created_at: string
}

export const getAgentConfig = () =>
  apiFetch<{ config: AgentConfig; available_tools: string[]; available_models: string[] }>(
    '/api/v1/platform/agent/config'
  )

export const updateAgentConfig = (body: Partial<AgentConfig>) =>
  apiFetch('/api/v1/platform/agent/config', {
    method: 'PUT',
    body: JSON.stringify(body),
  })

export const getAgentLogs = (limit = 50) =>
  apiFetch<{ logs: AgentLog[]; total: number }>(`/api/v1/platform/agent/logs?limit=${limit}`)
