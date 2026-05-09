import { NavLink, Outlet } from 'react-router-dom'
import {
  MessageSquare, Bot, CreditCard, Coins, Key, LogOut
} from 'lucide-react'
import { useAuth } from '../store/auth'
import clsx from 'clsx'

const nav = [
  { to: '/inbox',  label: 'Inbox',        icon: MessageSquare },
  { to: '/agent',  label: 'Agent',         icon: Bot },
  { to: '/billing',label: 'Billing',       icon: CreditCard },
  { to: '/credits',label: 'Credits',       icon: Coins },
  { to: '/keys',   label: 'API Keys',      icon: Key },
]

export default function Layout() {
  const logout = useAuth(s => s.logout)

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col bg-white border-r border-gray-200 shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-lg font-bold text-brand-700">Chutney</span>
        </div>

        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
