import { apiFetch } from './client'

export const getBillingUsage = (period?: string) =>
  apiFetch<{ period: string; total_billed_usd: number; conversations: unknown[] }>(
    `/api/v1/platform/billing/usage${period ? `?period=${period}` : ''}`
  )

export const getInvoices = () =>
  apiFetch<{ invoices: unknown[] }>('/api/v1/platform/billing/invoices')

export const getCreditsBalance = () =>
  apiFetch<{ balance: number; currency: string }>('/api/v1/platform/credits/balance')

export const getCreditsHistory = () =>
  apiFetch<{ history: unknown[] }>('/api/v1/platform/credits/history')
