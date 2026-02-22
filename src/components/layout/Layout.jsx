import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  UserCircle,
  Tag,
  ClipboardList,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useInstallPWA } from '../../hooks/useInstallPWA'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/', icon: Calendar, label: 'Dashboard' },
  { to: '/tarefas', icon: ClipboardList, label: 'Tarefas' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/funcionarios', icon: UserCircle, label: 'Funcionários' },
  { to: '/tipos-tarefa', icon: Tag, label: 'Tipos de Tarefa' },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { signOut } = useAuth()
  const { canInstall, install } = useInstallPWA()
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
          'fixed inset-y-0 left-0 z-30 bg-surface border-r border-gray-800 transform transition-all duration-200 lg:relative lg:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center border-b border-gray-800',
          collapsed ? 'justify-center px-2 py-5' : 'gap-3 px-6 py-5'
        )}>
          <img src="/icons/icone192.png" alt="ClicStudio" className="h-9 w-9 rounded-lg shrink-0 object-cover" />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white">ClicStudio</h1>
              <p className="text-xs text-gray-500">Gestão de Agenda</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  isActive
                    ? 'bg-primary/15 text-primary-light'
                    : 'text-gray-400 hover:bg-surface-light hover:text-white'
                )
              }
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-800 p-2 space-y-1">
          {/* Instalar App PWA */}
          {canInstall && (
            <button
              onClick={install}
              title={collapsed ? 'Instalar App' : undefined}
              className={cn(
                'flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-primary-light hover:bg-primary/10 transition-colors cursor-pointer',
                collapsed ? 'justify-center px-2' : 'gap-3 px-3'
              )}
            >
              <Download size={18} className="shrink-0" />
              {!collapsed && <span>Instalar App</span>}
            </button>
          )}

          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'hidden lg:flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-gray-400 hover:bg-surface-light hover:text-white transition-colors cursor-pointer',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            )}
            title={collapsed ? 'Expandir menu' : 'Minimizar menu'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Minimizar</span>}
          </button>

          <button
            onClick={handleSignOut}
            title={collapsed ? 'Sair' : undefined}
            className={cn(
              'flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-gray-400 hover:bg-surface-light hover:text-white transition-colors cursor-pointer',
              collapsed ? 'justify-center px-2' : 'gap-3 px-3'
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sair</span>}
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
