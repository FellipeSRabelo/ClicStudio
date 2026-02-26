import { useState, useCallback, useMemo } from 'react'
import { format, differenceInHours, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Calendar as CalendarIcon, Filter, Maximize, Minimize, ClipboardList, AlertTriangle, Clock } from 'lucide-react'
import { Calendar } from '../components/calendar/Calendar'
import { useSupabaseQuery, useRealtimeSubscription } from '../hooks/useSupabase'
import { LoadingSpinner } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FilterSidebar } from '../components/filters/FilterSidebar'
import { TarefaModal } from '../components/tarefas/TarefaModal'
import { DayDetailModal } from '../components/calendar/DayDetailModal'
import { PostEditModalInline } from '../components/calendar/PostEditModalInline'

export function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayTarefas, setDayTarefas] = useState([])
  const [showTarefaModal, setShowTarefaModal] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [dayPosts, setDayPosts] = useState([])

  // Filtros
  const [filtroFuncionarios, setFiltroFuncionarios] = useState([])
  const [filtroTipos, setFiltroTipos] = useState([])

  const { data: tarefas, loading: loadingTarefas, refetch: refetchTarefas } = useSupabaseQuery('tarefas', {
    select: '*, clientes(nome, telefone), tipos_tarefa(nome, cor, icone), funcionarios(nome, cor, telefone)',
    orderBy: 'data_prazo',
    ascending: true,
  })

  const { data: tiposTarefa } = useSupabaseQuery('tipos_tarefa', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  const { data: funcionarios } = useSupabaseQuery('funcionarios', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  const { data: clientes } = useSupabaseQuery('clientes', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  // Cronograma posts
  const { data: cronogramaPosts, refetch: refetchPosts } = useSupabaseQuery('cronograma_posts', {
    select: '*, clientes(nome), funcionarios(nome)',
    orderBy: 'data_agendada',
    ascending: true,
  })

  // Realtime
  const handleRealtime = useCallback(() => {
    refetchTarefas()
    refetchPosts()
  }, [refetchTarefas, refetchPosts])

  useRealtimeSubscription('tarefas', handleRealtime)
  useRealtimeSubscription('cronograma_posts', handleRealtime)

  // Filtrar tarefas
  const filteredTarefas = tarefas.filter((t) => {
    if (filtroFuncionarios.length > 0 && !filtroFuncionarios.includes(t.funcionario_id)) return false
    if (filtroTipos.length > 0 && !filtroTipos.includes(t.tipo_tarefa_id)) return false
    return true
  })

  const handleDayClick = (day, tarefasDoDia, postsDoDia = []) => {
    setSelectedDay(day)
    setDayTarefas(tarefasDoDia)
    setDayPosts(postsDoDia)
  }

  const handlePostClick = (post) => {
    setEditingPost(post)
  }

  const handleNewTarefa = (date) => {
    setEditingTarefa(null)
    setSelectedDate(date)
    setShowTarefaModal(true)
  }

  const handleEditTarefa = (tarefa) => {
    setEditingTarefa(tarefa)
    setSelectedDate(null)
    setShowTarefaModal(true)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const activeFiltersCount = filtroFuncionarios.length + filtroTipos.length

  // Deadline summary stats
  const deadlineStats = useMemo(() => {
    const now = new Date()
    const pendentes = tarefas.filter(t => !t.realizado)
    const comDeadline = pendentes.filter(t => t.deadline_entrega)
    const atrasadas = comDeadline.filter(t => isPast(new Date(t.deadline_entrega)))
    const proximas48h = comDeadline.filter(t => {
      const dl = new Date(t.deadline_entrega)
      const hours = differenceInHours(dl, now)
      return hours >= 0 && hours <= 48
    })
    return {
      total: tarefas.length,
      pendentes: pendentes.length,
      proximas48h: proximas48h.length,
      atrasadas: atrasadas.length,
    }
  }, [tarefas])

  if (loadingTarefas) return <LoadingSpinner />

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <span className="text-xs text-gray-500 ml-1">• Tempo real</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer ${
              showFilters || activeFiltersCount > 0
                ? 'bg-primary/15 text-primary-light'
                : 'text-gray-400 hover:text-white hover:bg-surface-light'
            }`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-surface-light transition-colors cursor-pointer"
            title="Tela cheia (F11)"
          >
            <Maximize size={18} />
          </button>
          <Button onClick={() => handleNewTarefa(new Date())} size="sm">
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-gray-800 bg-surface p-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15">
            <ClipboardList size={20} className="text-primary-light" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total de Tarefas</p>
            <p className="text-xl font-bold text-white">{deadlineStats.total}</p>
            <p className="text-xs text-gray-500">{deadlineStats.pendentes} pendentes</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-surface p-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/15">
            <Clock size={20} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Próximos Deadlines</p>
            <p className="text-xl font-bold text-yellow-400">{deadlineStats.proximas48h}</p>
            <p className="text-xs text-gray-500">nas próximas 48h</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-surface p-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/15">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Entregas Atrasadas</p>
            <p className={`text-xl font-bold ${deadlineStats.atrasadas > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>{deadlineStats.atrasadas}</p>
            <p className="text-xs text-gray-500">{deadlineStats.atrasadas === 0 ? 'tudo em dia ✅' : 'atenção!'}</p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar Filtros (toggle) */}
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

        {/* Calendário */}
        <div className="flex-1 flex flex-col min-h-0">
          <Calendar
            tarefas={filteredTarefas}
            cronogramaPosts={cronogramaPosts}
            tiposTarefa={tiposTarefa}
            funcionarios={funcionarios}
            onDayClick={handleDayClick}
            onPostClick={handlePostClick}
          />
        </div>
      </div>

      {/* Modal detalhe do dia */}
      <DayDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        day={selectedDay}
        tarefas={dayTarefas.filter((t) => {
          if (filtroFuncionarios.length > 0 && !filtroFuncionarios.includes(t.funcionario_id)) return false
          if (filtroTipos.length > 0 && !filtroTipos.includes(t.tipo_tarefa_id)) return false
          return true
        })}
        cronogramaPosts={dayPosts}
        tiposTarefa={tiposTarefa}
        funcionarios={funcionarios}
        onEdit={handleEditTarefa}
        onNew={() => handleNewTarefa(selectedDay)}
        onEditPost={(post) => { setSelectedDay(null); setEditingPost(post) }}
      />

      {/* Modal criar/editar tarefa */}
      <TarefaModal
        isOpen={showTarefaModal}
        onClose={() => {
          setShowTarefaModal(false)
          setEditingTarefa(null)
        }}
        tarefa={editingTarefa}
        defaultDate={selectedDate}
        clientes={clientes}
        funcionarios={funcionarios}
        tiposTarefa={tiposTarefa}
        onSaved={() => {
          refetchTarefas()
          setShowTarefaModal(false)
          setEditingTarefa(null)
        }}
      />

      {/* Modal editar post de cronograma */}
      {editingPost && (
        <PostEditModalInline
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            refetchPosts()
            setEditingPost(null)
          }}
        />
      )}
    </div>
  )
}
