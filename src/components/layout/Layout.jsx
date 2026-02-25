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
  Share,
  Plus,
  X,
  Share2,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useInstallPWA } from '../../hooks/useInstallPWA'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/', icon: Calendar, label: 'Dashboard' },
  { to: '/tarefas', icon: ClipboardList, label: 'Tarefas' },
  { to: '/agenda-conteudo', icon: Share2, label: 'Agenda de Conteúdo' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/funcionarios', icon: UserCircle, label: 'Funcionários' },
  { to: '/tipos-tarefa', icon: Tag, label: 'Tipos de Tarefa' },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { signOut } = useAuth()
  const { canInstall, canInstallIOS, install } = useInstallPWA()
  const [showIOSModal, setShowIOSModal] = useState(false)
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
          collapsed ? 'justify-center px-2 py-5' : 'px-4 py-4'
        )}>
          {collapsed ? (
            <img src="/icons/icone192.png" alt="ClicStudio" className="h-9 w-9 rounded-lg shrink-0 object-cover" />
          ) : (
            <img src="/icons/semfundo_horizontal.png" alt="ClicStudio" className="h-10 w-auto object-contain" />
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
              onClick={() => {
                if (canInstallIOS) {
                  setShowIOSModal(true)
                } else {
                  install()
                }
              }}
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

      {/* Modal de instruções iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-surface border border-gray-800 rounded-2xl p-6 shadow-xl">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <Download size={28} className="text-primary-light" />
              </div>
              <h3 className="text-lg font-bold text-white">Instalar ClicStudio</h3>
              <p className="text-sm text-gray-400 mt-1">Siga os passos abaixo para instalar o app no seu iPhone</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-light">1</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Toque no botão Compartilhar</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    O ícone <Share size={14} className="inline text-primary-light" /> na barra do Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-light">2</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Toque em "Adicionar à Tela de Início"</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    O ícone <Plus size={14} className="inline text-primary-light" /> no menu que aparecer
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-light">3</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Confirme tocando em "Adicionar"</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pronto! O ClicStudio aparecerá na sua tela inicial</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
