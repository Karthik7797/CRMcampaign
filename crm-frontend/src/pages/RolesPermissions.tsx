import { Shield, Check, X, Users, Database, LayoutDashboard, MessageSquare } from 'lucide-react'
import { getRoleColor, ROLE_DISPLAY } from '../lib/permissions'
import { cn } from '../lib/utils'

const modules = [
  {
    name: 'Leads & Pipeline',
    icon: Database,
    permissions: [
      { name: 'View Own Leads', roles: ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR', 'INFLUENCER'] },
      { name: 'View All Leads', roles: ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER'] },
      { name: 'Create Leads', roles: ['ADMIN', 'MANAGER', 'COUNSELLOR'] },
      { name: 'Edit All Leads', roles: ['ADMIN', 'MANAGER'] },
      { name: 'Delete Leads', roles: ['ADMIN'] },
      { name: 'Assign Leads', roles: ['ADMIN', 'MANAGER'] },
      { name: 'Move Pipeline Stages', roles: ['ADMIN', 'MANAGER', 'COUNSELLOR'] },
    ]
  },
  {
    name: 'Tasks',
    icon: LayoutDashboard,
    permissions: [
      { name: 'View & Edit Own Tasks', roles: ['ADMIN', 'MANAGER', 'COUNSELLOR'] },
      { name: 'View All Tasks', roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    name: 'Communications',
    icon: MessageSquare,
    permissions: [
      { name: 'Send Emails/Calls', roles: ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR'] },
      { name: 'Delete Comm History', roles: ['ADMIN', 'MANAGER'] },
    ]
  },
  {
    name: 'Administration',
    icon: Users,
    permissions: [
      { name: 'View Analytics', roles: ['ADMIN', 'MANAGER', 'MARKETING', 'INFLUENCER'] },
      { name: 'User Management', roles: ['ADMIN'] },
      { name: 'System Settings', roles: ['ADMIN'] },
    ]
  }
]

const ROLES = ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR', 'INFLUENCER'] as const

export default function RolesPermissions() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
          <Shield size={22} className="text-brand-400" /> Roles & Permissions Matrix
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Review the capabilities assigned to each role hierarchy. Roles are fixed in the current tier.
          To assign a role to a team member, visit User Management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {ROLES.map(role => {
          const colors = getRoleColor(role)
          return (
            <div key={role} className="card p-4 flex flex-col items-center text-center">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3 border', colors.bg, colors.border)}>
                <Shield size={20} className={colors.text} />
              </div>
              <h3 className="font-bold text-white text-sm">{ROLE_DISPLAY[role]}</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {role === 'ADMIN' && 'Full system access & control'}
                {role === 'MANAGER' && 'Team & daily operations overview'}
                {role === 'MARKETING' && 'Campaigns & analytics tracking'}
                {role === 'COUNSELLOR' && 'Individual lead & task management'}
                {role === 'INFLUENCER' && 'Readonly dashboard and leads access'}
              </p>
            </div>
          )
        })}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-800/50 border-b border-surface-700">
                <th className="text-left px-5 py-4 font-medium text-slate-300 min-w-[200px]">Permission</th>
                {ROLES.map(role => (
                   <th key={role} className="px-4 py-4 font-medium text-slate-400 text-center text-xs">
                     {ROLE_DISPLAY[role]}
                   </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {modules.map((mod, idx) => (
                <optgroup key={idx} className="contents">
                  <tr>
                    <td colSpan={5} className="bg-surface-800/30 px-5 py-3 text-xs font-semibold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                      <mod.icon size={14} /> {mod.name}
                    </td>
                  </tr>
                  {mod.permissions.map((perm, pIdx) => (
                    <tr key={pIdx} className="hover:bg-surface-800/20 transition-colors">
                      <td className="px-5 py-3.5 text-slate-300 text-[13px]">{perm.name}</td>
                      {ROLES.map(role => {
                        const hasAccess = perm.roles.includes(role)
                        return (
                          <td key={role} className="px-4 py-3.5 text-center">
                            {hasAccess ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                                <Check size={12} className="text-emerald-400" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 flex items-center justify-center mx-auto">
                                <X size={14} className="text-surface-600" />
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </optgroup>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
