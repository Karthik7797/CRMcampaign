import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

export default function Layout() {
  const sidebarOpen = useStore((s) => s.sidebarOpen)

  return (
    <div className="min-h-screen bg-surface-900 flex">
      <Sidebar />
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        'lg:ml-[260px]'
      )}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
