import { useState, useCallback, useMemo } from 'react'
import { format, differenceInHours, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Calendar as CalendarIcon, Filter, Maximize, Minimize, ClipboardList, AlertTriangle, Clock, ChevronUp, ChevronDown } from 'lucide-react'
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
  const [showSummary, setShowSummary] = useState(true)
  const [hoveredCard, setHoveredCard] = useState(null)

  // Filtros
  const [filtroFuncionarios, setFiltroFuncionarios] = useState([])
  const [filtroTipos, setFiltroTipos] = useState([])
  const [showAgendaConteudo, setShowAgendaConteudo] = useState(true)

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
      pendentesTarefas: pendentes,
      proximas48h: proximas48h.length,
      proximas48hTarefas: proximas48h,
      atrasadas: atrasadas.length,
      atrasadasTarefas: atrasadas,
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
      <div className="mb-3">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer mb-2"
        >
          {showSummary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showSummary ? 'Ocultar resumo' : 'Ver resumo'}
        </button>
        {showSummary && (
          <div className="grid grid-cols-3 gap-3">
            {/* Total */}
            <div
              className="rounded-lg border border-gray-800 bg-surface px-3 py-2 flex items-center gap-3 relative cursor-pointer"
              onMouseEnter={() => setHoveredCard('total')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/15 shrink-0">
                <ClipboardList size={16} className="text-primary-light" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-white leading-tight">{deadlineStats.total} <span className="text-xs font-normal text-gray-500">tarefas · {deadlineStats.pendentes} pendentes</span></p>
              </div>
              {/* Tooltip pendentes */}
              {hoveredCard === 'total' && deadlineStats.pendentesTarefas.length > 0 && (
                <div className="absolute top-full left-0 mt-1 z-50 w-80 rounded-lg border border-gray-700 bg-surface-light shadow-xl p-2 space-y-1">
                  <p className="text-xs text-gray-500 px-2 pb-1 font-semibold">Tarefas pendentes</p>
                  {deadlineStats.pendentesTarefas.slice(0, 6).map(t => (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs bg-primary/10">
                      <div className="min-w-0">
                        <span className="text-white truncate block">{t.descricao}</span>
                        {t.clientes?.nome && <span className="text-gray-400 text-[10px]">{t.clientes.nome}</span>}
                      </div>
                      <span className="text-primary-light shrink-0">{format(new Date(t.data_prazo + 'T00:00:00'), 'dd/MM')}</span>
                    </div>
                  ))}
                  {deadlineStats.pendentesTarefas.length > 6 && (
                    <p className="text-xs text-gray-500 px-2">+{deadlineStats.pendentesTarefas.length - 6} mais</p>
                  )}
                </div>
              )}
            </div>
            {/* Próximos 48h */}
            <div
              className="rounded-lg border border-gray-800 bg-surface px-3 py-2 flex items-center gap-3 relative cursor-pointer"
              onMouseEnter={() => setHoveredCard('proximas')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-yellow-500/15 shrink-0">
                <Clock size={16} className="text-yellow-400" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-yellow-400 leading-tight">{deadlineStats.proximas48h} <span className="text-xs font-normal text-gray-500">deadlines nas próximas 48h</span></p>
              </div>
              {/* Tooltip */}
              {hoveredCard === 'proximas' && deadlineStats.proximas48hTarefas.length > 0 && (
                <div className="absolute top-full left-0 mt-1 z-50 w-80 rounded-lg border border-gray-700 bg-surface-light shadow-xl p-2 space-y-1">
                  <p className="text-xs text-gray-500 px-2 pb-1 font-semibold">Deadlines próximos</p>
                  {deadlineStats.proximas48hTarefas.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs bg-yellow-500/10">
                      <div className="min-w-0">
                        <span className="text-white truncate block">{t.descricao}</span>
                        {t.clientes?.nome && <span className="text-gray-400 text-[10px]">{t.clientes.nome}</span>}
                      </div>
                      <span className="text-yellow-400 shrink-0">{format(new Date(t.deadline_entrega), 'dd/MM HH:mm')}</span>
                    </div>
                  ))}
                  {deadlineStats.proximas48hTarefas.length > 5 && (
                    <p className="text-xs text-gray-500 px-2">+{deadlineStats.proximas48hTarefas.length - 5} mais</p>
                  )}
                </div>
              )}
            </div>
            {/* Atrasadas */}
            <div
              className="rounded-lg border border-gray-800 bg-surface px-3 py-2 flex items-center gap-3 relative cursor-pointer"
              onMouseEnter={() => setHoveredCard('atrasadas')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/15 shrink-0">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div className="min-w-0">
                <p className={`text-lg font-bold leading-tight ${deadlineStats.atrasadas > 0 ? 'text-red-400' : 'text-green-400'}`}>{deadlineStats.atrasadas} <span className="text-xs font-normal text-gray-500">{deadlineStats.atrasadas === 0 ? 'tudo em dia ✅' : 'entregas atrasadas'}</span></p>
              </div>
              {/* Tooltip */}
              {hoveredCard === 'atrasadas' && deadlineStats.atrasadasTarefas.length > 0 && (
                <div className="absolute top-full right-0 mt-1 z-50 w-80 rounded-lg border border-gray-700 bg-surface-light shadow-xl p-2 space-y-1">
                  <p className="text-xs text-gray-500 px-2 pb-1 font-semibold">Entregas atrasadas</p>
                  {deadlineStats.atrasadasTarefas.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs bg-red-500/10">
                      <div className="min-w-0">
                        <span className="text-white truncate block">{t.descricao}</span>
                        {t.clientes?.nome && <span className="text-gray-400 text-[10px]">{t.clientes.nome}</span>}
                      </div>
                      <span className="text-red-400 shrink-0">{format(new Date(t.deadline_entrega), 'dd/MM HH:mm')}</span>
                    </div>
                  ))}
                  {deadlineStats.atrasadasTarefas.length > 5 && (
                    <p className="text-xs text-gray-500 px-2">+{deadlineStats.atrasadasTarefas.length - 5} mais</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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
            showAgendaConteudo={showAgendaConteudo}
            setShowAgendaConteudo={setShowAgendaConteudo}
          />
        )}

        {/* Calendário */}
        <div className="flex-1 flex flex-col min-h-0">
          <Calendar
            tarefas={filteredTarefas}
            cronogramaPosts={showAgendaConteudo ? cronogramaPosts : []}
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
