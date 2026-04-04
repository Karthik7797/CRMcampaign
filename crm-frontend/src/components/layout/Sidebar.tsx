import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, GitBranch, MessageSquare,
  CheckSquare, BarChart3, Settings, LogOut, Zap, X,
  UserCog, Shield
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { usePermissions } from '../../hooks/usePermissions'
import { cn } from '../../lib/utils'
import { roleDisplayName, getRoleColor } from '../../lib/permissions'

// Icon mapping for nav items
const iconMap: Record<string, any> = {
  '/dashboard': LayoutDashboard,
  '/leads': Users,
  '/pipeline': GitBranch,
  '/communications': MessageSquare,
  '/tasks': CheckSquare,
  '/analytics': BarChart3,
  '/users': UserCog,
  '/settings': Settings,
}

export default function Sidebar() {
  const { user, logout, sidebarOpen, toggleSidebar } = useStore()
  const { navItems, roleName, roleColor } = usePermissions()

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full z-30 flex flex-col',
        'bg-surface-900 border-r border-surface-700',
        'transition-transform duration-300',
        'w-[260px]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white font-display">EduCRM</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">Enrollment Suite</p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav — filtered by role */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label }) => {
            const Icon = iconMap[to] || Settings
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-700'
                )}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* User + Role Badge */}
        <div className="p-4 border-t border-surface-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <span className={cn(
                'inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border mt-0.5',
                roleColor.bg, roleColor.text, roleColor.border
              )}>
                <Shield size={9} />
                {roleName}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
