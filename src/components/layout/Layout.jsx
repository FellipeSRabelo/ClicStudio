import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  UserCircle,
  Tag,
  ClipboardList,
  Tv,
  LogOut,
  Menu,
  X,
  Camera,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/', icon: Calendar, label: 'Dashboard' },
  { to: '/tv', icon: Tv, label: 'Dashboard TV' },
  { to: '/tarefas', icon: ClipboardList, label: 'Tarefas' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/funcionarios', icon: UserCircle, label: 'Funcionários' },
  { to: '/tipos-tarefa', icon: Tag, label: 'Tipos de Tarefa' },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-gray-800 transform transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ClicStudio</h1>
            <p className="text-xs text-gray-500">Gestão de Agenda</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary-light'
                    : 'text-gray-400 hover:bg-surface-light hover:text-white'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-surface-light hover:text-white transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar mobile */}
        <header className="flex items-center gap-4 border-b border-gray-800 bg-surface px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1 text-gray-400 hover:text-white cursor-pointer"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">ClicStudio</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
