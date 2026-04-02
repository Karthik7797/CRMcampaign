import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white font-display">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['User Management', 'Roles & Permissions', 'Email Templates', 'Lead Sources', 'Pipeline Stages', 'Integrations'].map(s => (
          <div key={s} className="card hover:border-surface-600 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-surface-700 rounded-lg flex items-center justify-center">
                <SettingsIcon size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{s}</p>
                <p className="text-xs text-slate-500">Configure {s.toLowerCase()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
