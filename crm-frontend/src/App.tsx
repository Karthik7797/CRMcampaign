import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Pipeline from './pages/Pipeline'
import Communications from './pages/Communications'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import LeadDetails from './pages/LeadDetails'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="communications" element={<Communications />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
