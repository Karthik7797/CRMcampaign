import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { hasPermission } from './lib/permissions'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Pipeline from './pages/Pipeline'
import Communications from './pages/Communications'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import UserProgression from './pages/UserProgression'
import Settings from './pages/Settings'
import LeadDetails from './pages/LeadDetails'
import UserManagement from './pages/UserManagement'
import RolesPermissions from './pages/RolesPermissions'
import Unauthorized from './pages/Unauthorized'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

/**
 * Role-gated route wrapper.
 * Checks the user's role against the required permission.
 * Redirects to /unauthorized if the user doesn't have access.
 */
function RoleRoute({
  children,
  permission,
}: {
  children: React.ReactNode
  permission: string
}) {
  const user = useStore((s) => s.user)
  if (!hasPermission(user?.role, permission)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <>{children}</>
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

          {/* Role-protected routes */}
          <Route path="tasks" element={
            <RoleRoute permission="nav:tasks"><Tasks /></RoleRoute>
          } />
          <Route path="analytics" element={
            <RoleRoute permission="nav:analytics"><Analytics /></RoleRoute>
          } />
          <Route path="user-progression" element={
            <RoleRoute permission="nav:analytics"><UserProgression /></RoleRoute>
          } />
          <Route path="settings" element={
            <RoleRoute permission="nav:settings"><Settings /></RoleRoute>
          } />
          <Route path="users" element={
            <RoleRoute permission="nav:users"><UserManagement /></RoleRoute>
          } />
          <Route path="roles" element={
            <RoleRoute permission="nav:settings"><RolesPermissions /></RoleRoute>
          } />

          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
