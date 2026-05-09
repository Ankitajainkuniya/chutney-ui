import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Send, Bot, BotOff, CheckCheck, Phone } from 'lucide-react'
import clsx from 'clsx'
import {
  getConversations, getMessages, sendMessage, toggleAI, openStream,
  type Conversation, type Message,
} from '../api/conversations'

function timeAgo(iso: string | null) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function ConvItem({ conv, active, onClick }: { conv: Conversation; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors',
        active && 'bg-brand-50 border-l-2 border-l-brand-600'
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-medium text-sm truncate">
          {conv.contact_name || conv.contact_phone}
        </span>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(conv.last_message_at)}</span>
      </div>
      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message || '—'}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={clsx(
          'text-xs px-1.5 py-0.5 rounded-full',
          conv.ai_enabled ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
        )}>
          {conv.ai_enabled ? 'AI on' : 'AI off'}
        </span>
        {conv.unread_count > 0 && (
          <span className="text-xs bg-brand-600 text-white rounded-full px-1.5">{conv.unread_count}</span>
        )}
      </div>
    </button>
  )
}

function Bubble({ msg }: { msg: Message }) {
  const out = msg.direction === 'outbound'
  return (
    <div className={clsx('flex', out ? 'justify-end' : 'justify-start')}>
      <div className={clsx(
        'max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm',
        out ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
      )}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className={clsx('text-xs mt-1', out ? 'text-brand-100' : 'text-gray-400')}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {out && msg.status === 'read' && <CheckCheck size={12} className="inline ml-1" />}
        </p>
      </div>
    </div>
  )
}

export default function Inbox() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(50),
    refetchInterval: 30000,
  })

  const { data: threadData } = useQuery({
    queryKey: ['thread', activeId],
    queryFn: () => getMessages(activeId!),
    enabled: !!activeId,
    refetchInterval: false,
  })

  const activeConv = convData?.conversations.find(c => c.id === activeId)

  // SSE live updates
  useEffect(() => {
    const close = openStream((event) => {
      const e = event as { type: string; conversation_id?: string }
      if (e.type === 'new_message' || e.type === 'message_sent') {
        qc.invalidateQueries({ queryKey: ['conversations'] })
        if (e.conversation_id === activeId) {
          qc.invalidateQueries({ queryKey: ['thread', activeId] })
        }
      }
    })
    return close
  }, [activeId, qc])

  // Scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadData])

  async function handleSend() {
    if (!activeId || !draft.trim()) return
    setSending(true)
    try {
      await sendMessage(activeId, draft.trim())
      setDraft('')
      qc.invalidateQueries({ queryKey: ['thread', activeId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    } finally {
      setSending(false)
    }
  }

  async function handleToggleAI() {
    if (!activeId || !activeConv) return
    await toggleAI(activeId, !activeConv.ai_enabled)
    qc.invalidateQueries({ queryKey: ['conversations'] })
  }

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-sm text-gray-700">Conversations</h2>
          <p className="text-xs text-gray-400">{convData?.total ?? 0} total</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convData?.conversations.map(conv => (
            <ConvItem
              key={conv.id}
              conv={conv}
              active={conv.id === activeId}
              onClick={() => setActiveId(conv.id)}
            />
          ))}
          {!convData?.conversations.length && (
            <p className="text-sm text-gray-400 text-center py-12">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Thread */}
      {activeId && activeConv ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              <div>
                <p className="font-medium text-sm">{activeConv.contact_name || activeConv.contact_phone}</p>
                <p className="text-xs text-gray-400">{activeConv.contact_phone}</p>
              </div>
            </div>
            <button
              onClick={handleToggleAI}
              title={activeConv.ai_enabled ? 'Disable AI' : 'Enable AI'}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                activeConv.ai_enabled
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {activeConv.ai_enabled ? <Bot size={14} /> : <BotOff size={14} />}
              {activeConv.ai_enabled ? 'AI on' : 'AI off'}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {threadData?.messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              className="px-3 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a conversation
        </div>
      )}
    </div>
  )
}
