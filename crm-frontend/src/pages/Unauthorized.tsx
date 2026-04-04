import { ShieldX, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'

export default function Unauthorized() {
  const navigate = useNavigate()
  const { roleName } = usePermissions()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Icon with animated glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 w-20 h-20 bg-red-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20
                        border border-red-500/30 flex items-center justify-center">
          <ShieldX size={32} className="text-red-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white font-display mb-2">Access Denied</h2>
      <p className="text-slate-400 text-sm max-w-md mb-2">
        Your role (<span className="text-slate-200 font-semibold">{roleName}</span>) doesn't have
        permission to access this page.
      </p>
      <p className="text-slate-500 text-xs max-w-sm mb-8">
        Contact your Super Admin if you believe this is a mistake.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary flex items-center gap-2 h-10"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  )
}
