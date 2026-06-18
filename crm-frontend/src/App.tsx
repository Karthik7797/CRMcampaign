import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useTheme } from './hooks/useTheme'
import { hasPermission } from './lib/permissions'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import InfluencerLeads from './pages/InfluencerLeads'
import Pipeline from './pages/Pipeline'
import Communications from './pages/Communications'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import UserProgression from './pages/UserProgression'
import Settings from './pages/Settings'
import LeadDetails from './pages/LeadDetails'
import InfluencerLeadDetails from './pages/InfluencerLeadDetails'
import UserManagement from './pages/UserManagement'
import RolesPermissions from './pages/RolesPermissions'
import Unauthorized from './pages/Unauthorized'
import Campaign1Leads from './pages/Campaign1Leads'
import Campaign1LeadDetails from './pages/Campaign1LeadDetails'
import Campaign2Leads from './pages/Campaign2Leads'
import Campaign2LeadDetails from './pages/Campaign2LeadDetails'
import CampaignComingSoon from './pages/CampaignComingSoon'

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
  useTheme()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="influencer-leads" element={
            <RoleRoute permission="nav:influencer_leads"><InfluencerLeads /></RoleRoute>
          } />
          <Route path="influencer-leads/:id" element={
            <RoleRoute permission="nav:influencer_leads"><InfluencerLeadDetails /></RoleRoute>
          } />
          {/* Influencer Marketing — Campaign sub-pages */}
          <Route path="campaigns/1" element={
            <RoleRoute permission="nav:campaign_1"><Campaign1Leads /></RoleRoute>
          } />
          <Route path="campaigns/1/:id" element={
            <RoleRoute permission="nav:campaign_1"><Campaign1LeadDetails /></RoleRoute>
          } />
          <Route path="campaigns/2" element={
            <RoleRoute permission="nav:campaign_2"><Campaign2Leads /></RoleRoute>
          } />
          <Route path="campaigns/2/:id" element={
            <RoleRoute permission="nav:campaign_2"><Campaign2LeadDetails /></RoleRoute>
          } />
          {/* Campaigns 3–12: Coming Soon — :n must come after specific numbers above */}
          <Route path="campaigns/:n" element={<CampaignComingSoon />} />

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
