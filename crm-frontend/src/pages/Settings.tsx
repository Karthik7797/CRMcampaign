import { Settings as SettingsIcon, Shield, Users, Mail, Database, GitBranch, Link } from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'
import { useNavigate } from 'react-router-dom'

const settingsCards = [
  { label: 'User Management', desc: 'Manage team members and roles', icon: Users, link: '/users' },
  { label: 'Roles & Permissions', desc: 'Configure access control', icon: Shield },
  { label: 'Email Templates', desc: 'Manage automated emails', icon: Mail },
  { label: 'Lead Sources', desc: 'Configure lead sources', icon: Database },
  { label: 'Pipeline Stages', desc: 'Customize pipeline workflow', icon: GitBranch },
  { label: 'Integrations', desc: 'Connect external services', icon: Link },
]

export default function Settings() {
  const { canManageUsers } = usePermissions()
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
          <SettingsIcon size={20} /> Settings
        </h2>
        <p className="text-sm text-slate-400 mt-1">System configuration and preferences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsCards.map(s => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              onClick={() => s.link && canManageUsers && navigate(s.link)}
              className="card hover:border-surface-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-700 rounded-xl flex items-center justify-center">
                  <Icon size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{s.label}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
