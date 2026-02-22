import { useState, useCallback } from 'react'
import { Calendar } from '../components/calendar/Calendar'
import { useSupabaseQuery, useRealtimeSubscription } from '../hooks/useSupabase'
import { LoadingSpinner } from '../components/ui/Card'
import { FilterSidebar } from '../components/filters/FilterSidebar'
import { Tv, Maximize } from 'lucide-react'

export function TvDashboardPage() {
  const [filtroFuncionarios, setFiltroFuncionarios] = useState([])
  const [filtroTipos, setFiltroTipos] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const { data: tarefas, loading, refetch } = useSupabaseQuery('tarefas', {
    select: '*, clientes(nome), tipos_tarefa(nome, cor, icone), funcionarios(nome, cor)',
    orderBy: 'data_prazo',
    ascending: true,
  })

  const { data: tiposTarefa } = useSupabaseQuery('tipos_tarefa', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  const { data: funcionarios } = useSupabaseQuery('funcionarios', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  // Realtime - atualiza sozinho quando uma tarefa é criada/editada
  const handleRealtime = useCallback(() => {
    refetch()
  }, [refetch])

  useRealtimeSubscription('tarefas', handleRealtime)

  const filteredTarefas = tarefas.filter((t) => {
    if (filtroFuncionarios.length > 0 && !filtroFuncionarios.includes(t.funcionario_id)) return false
    if (filtroTipos.length > 0 && !filtroTipos.includes(t.tipo_tarefa_id)) return false
    return true
  })

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tv size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Dashboard TV</h1>
          <span className="text-xs text-gray-500 ml-2">• Atualização em tempo real</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer px-3 py-1 rounded-lg hover:bg-surface-light"
          >
            {showFilters ? 'Ocultar Filtros' : 'Filtros'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-surface-light transition-colors cursor-pointer"
            title="Tela cheia"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {showFilters && (
          <FilterSidebar
            funcionarios={funcionarios}
            tiposTarefa={tiposTarefa}
            filtroFuncionarios={filtroFuncionarios}
            setFiltroFuncionarios={setFiltroFuncionarios}
            filtroTipos={filtroTipos}
            setFiltroTipos={setFiltroTipos}
          />
        )}

        <div className="flex-1">
          <Calendar
            tarefas={filteredTarefas}
            tiposTarefa={tiposTarefa}
            funcionarios={funcionarios}
            darkMode
          />
        </div>
      </div>
    </div>
  )
}
