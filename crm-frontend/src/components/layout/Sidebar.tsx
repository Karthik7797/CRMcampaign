import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, GitBranch, MessageSquare,
  CheckSquare, BarChart3, Settings, LogOut, Zap, X,
  UserCog, Shield, Megaphone, Radio, ChevronDown
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { usePermissions } from '../../hooks/usePermissions'
import { cn } from '../../lib/utils'
import { type NavItem } from '../../lib/permissions'

// Icon mapping for nav items
const iconMap: Record<string, any> = {
  '/dashboard': LayoutDashboard,
  '/leads': Users,
  '/influencer-leads': Megaphone,
  '/influencer-marketing': Radio,
  '/pipeline': GitBranch,
  '/communications': MessageSquare,
  '/tasks': CheckSquare,
  '/analytics': BarChart3,
  '/user-progression': BarChart3,
  '/users': UserCog,
  '/settings': Settings,
}

// Collapsible parent menu (e.g. Influencer Marketing → Campaign 1–12)
function NavGroup({ item }: { item: NavItem }) {
  const location = useLocation()
  const childActive = item.children?.some(c => location.pathname.startsWith(c.to))
  const [open, setOpen] = useState<boolean>(!!childActive)
  const Icon = iconMap[item.to] || Settings

  if (!item.children || item.children.length === 0) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          childActive
            ? 'text-brand-400'
            : 'text-slate-400 hover:text-slate-100 hover:bg-surface-700'
        )}
      >
        <Icon size={17} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown size={15} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-surface-700 space-y-0.5">
          {item.children.map(child => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) => cn(
                'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-700'
              )}
            >
              <span>{child.label}</span>
              {child.comingSoon && (
                <span className="text-[9px] uppercase tracking-wide text-slate-500 bg-surface-700 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
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
              <h1 className="text-sm font-bold text-slate-100 font-display">EduCRM</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">Enrollment Suite</p>
            </div>
          </div>
          <button type="button" aria-label="Close sidebar" onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Nav — filtered by role */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            if (item.children && item.children.length > 0) {
              return <NavGroup key={item.to} item={item} />
            }
            const Icon = iconMap[item.to] || Settings
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-surface-700'
                )}
              >
                <Icon size={17} />
                {item.label}
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
            type="button"
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
