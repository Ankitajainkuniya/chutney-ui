import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inbox from './pages/Inbox'
import AgentConfig from './pages/AgentConfig'
import Billing from './pages/Billing'
import Credits from './pages/Credits'
import ApiKeys from './pages/ApiKeys'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth(s => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/inbox" replace />} />
        <Route path="/inbox"   element={<Inbox />} />
        <Route path="/agent"   element={<AgentConfig />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/keys"    element={<ApiKeys />} />
      </Route>
      <Route path="*" element={<Navigate to="/inbox" replace />} />
    </Routes>
  )
}
