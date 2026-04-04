import { Menu, Bell, Search, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { usePermissions } from '../../hooks/usePermissions'
import { useState } from 'react'

export default function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const { canCreateLeads } = usePermissions()
  const [search, setSearch] = useState('')

  return (
    <header className="h-14 border-b border-surface-700 bg-surface-900/80 backdrop-blur-sm
                       flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
        >
          <Menu size={18} />
        </button>
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads, tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-64 h-9 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canCreateLeads && (
          <button className="btn-primary flex items-center gap-1.5 h-9">
            <Plus size={15} /> New Lead
          </button>
        )}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
