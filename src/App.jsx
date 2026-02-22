import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TvDashboardPage } from './pages/TvDashboardPage'
import { TarefasPage } from './pages/TarefasPage'
import { ClientesPage } from './pages/ClientesPage'
import { FuncionariosPage } from './pages/FuncionariosPage'
import { TiposTarefaPage } from './pages/TiposTarefaPage'
import { LoadingSpinner } from './components/ui/Card'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tv" element={<TvDashboardPage />} />
          <Route path="tarefas" element={<TarefasPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="funcionarios" element={<FuncionariosPage />} />
          <Route path="tipos-tarefa" element={<TiposTarefaPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
