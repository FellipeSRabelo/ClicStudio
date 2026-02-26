import { useState, useCallback, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  getDay,
  nextSaturday,
  previousSaturday,
  isSaturday,
  isSunday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Sun, Clock, Camera, Video, Image, Film, Briefcase, Users, Package, Star, Heart, Instagram, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import { getDeadlineStatus, getProgressBar, DEADLINE_BADGE } from '../../lib/deadline'

const LUCIDE_ICONS = { Camera, Video, Image, Film, Briefcase, Users, Package, CalendarDays, Star, Heart }
const ICON_KEY_MAP = { camera: 'Camera', video: 'Video', image: 'Image', film: 'Film', briefcase: 'Briefcase', users: 'Users', package: 'Package', calendar: 'CalendarDays', star: 'Star', heart: 'Heart' }

const POST_STATUS_COLORS = {
  'Planejado': '#6366f1',
  'Em Produção': '#f59e0b',
  'Aprovado': '#22c55e',
  'Postado': '#06b6d4',
}

const VIEW_MODES = [
  { key: 'month', label: 'Mensal', icon: CalendarDays },
  { key: 'week', label: 'Semanal', icon: CalendarRange },
  { key: 'weekend', label: 'Fim de Semana', icon: Sun },
  { key: 'day', label: 'Diário', icon: Clock },
]

export function Calendar({ tarefas = [], cronogramaPosts = [], tiposTarefa = [], funcionarios = [], onDayClick, onPostClick, darkMode = false }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month')

  // Navigation functions per view mode
  const goBack = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else if (viewMode === 'weekend') {
      // Go to previous weekend (Saturday)
      const prevSat = previousSaturday(isSaturday(currentDate) ? subDays(currentDate, 1) : currentDate)
      setCurrentDate(prevSat)
    }
    else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1))
  }

  const goForward = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else if (viewMode === 'weekend') {
      // Go to next weekend (Saturday)
      const nxtSat = nextSaturday(isSaturday(currentDate) ? addDays(currentDate, 1) : currentDate)
      setCurrentDate(nxtSat)
    }
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1))
  }

  const goToday = () => setCurrentDate(new Date())

  // Compute days to show based on view mode
  const days = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
      const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
      return eachDayOfInterval({ start: calStart, end: calEnd })
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    }
    if (viewMode === 'weekend') {
      // Find the Saturday of the current week or the selected Saturday
      let sat
      if (isSaturday(currentDate)) {
        sat = currentDate
      } else if (isSunday(currentDate)) {
        sat = subDays(currentDate, 1)
      } else {
        sat = nextSaturday(currentDate)
      }
      const sun = addDays(sat, 1)
      return [sat, sun]
    }
    // day
    return [currentDate]
  }, [currentDate, viewMode])

  // Header title per view mode
  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: ptBR })
    }
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
      if (sameMonth) {
        return `${format(weekStart, 'd')} - ${format(weekEnd, "d 'de' MMMM yyyy", { locale: ptBR })}`
      }
      return `${format(weekStart, "d MMM", { locale: ptBR })} - ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`
    }
    if (viewMode === 'weekend') {
      const sat = days[0]
      const sun = days[1]
      return `${format(sat, "d", { locale: ptBR })} - ${format(sun, "d 'de' MMMM yyyy", { locale: ptBR })}`
    }
    return format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: ptBR })
  }, [currentDate, viewMode, days])

  const tarefasByDay = useMemo(() => {
    const map = {}
    tarefas.forEach((t) => {
      const key = t.data_prazo
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return map
  }, [tarefas])

  const postsByDay = useMemo(() => {
    const map = {}
    cronogramaPosts.forEach((p) => {
      const key = format(new Date(p.data_agendada), 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(p)
    })
    return map
  }, [cronogramaPosts])

  const getTypeColor = useCallback(
    (tipoId) => {
      const tipo = tiposTarefa.find((t) => t.id === tipoId)
      return tipo?.cor || '#5d109c'
    },
    [tiposTarefa]
  )

  const getTypeIcon = useCallback(
    (tipoId) => {
      const tipo = tiposTarefa.find((t) => t.id === tipoId)
      const iconName = ICON_KEY_MAP[tipo?.icone] || 'Camera'
      return LUCIDE_ICONS[iconName] || Camera
    },
    [tiposTarefa]
  )

  // Grid config per view
  const gridCols = viewMode === 'month' ? 7 : viewMode === 'week' ? 7 : viewMode === 'weekend' ? 2 : 1
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  // Expanded view = week, weekend, day (show more task details)
  const isExpandedView = viewMode !== 'month'

  // Max visible tasks
  const maxTasks = isExpandedView ? 20 : darkMode ? 4 : 3

  // Min height per day cell
  const cellMinHeight = isExpandedView
    ? (viewMode === 'day' ? 'min-h-[400px]' : 'min-h-[200px]')
    : darkMode ? 'min-h-[90px] lg:min-h-[120px]' : 'min-h-[80px] lg:min-h-[100px]'

  return (
    <div className={cn('flex flex-col h-full', darkMode && 'text-white')}>
      {/* View mode selector + navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-surface-light p-1">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                viewMode === mode.key
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-surface-lighter'
              )}
            >
              <mode.icon size={14} />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-surface-light transition-colors cursor-pointer"
          >
            Hoje
          </button>
          <button
            onClick={goBack}
            className="rounded-lg p-1.5 hover:bg-surface-light transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base sm:text-lg font-bold capitalize min-w-0 text-center">
            {headerTitle}
          </h2>
          <button
            onClick={goForward}
            className="rounded-lg p-1.5 hover:bg-surface-light transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Week days header (only for month and week views) */}
      {(viewMode === 'month' || viewMode === 'week') && (
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Weekend header */}
      {viewMode === 'weekend' && (
        <div className="grid grid-cols-2 gap-1 mb-1">
          {['Sábado', 'Domingo'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div
        className={cn('grid gap-1 flex-1')}
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayTarefas = (tarefasByDay[dateKey] || []).sort((a, b) =>
            (a.hora_inicio || '').localeCompare(b.hora_inicio || '')
          )
          const dayPosts = (postsByDay[dateKey] || []).sort((a, b) =>
            new Date(a.data_agendada) - new Date(b.data_agendada)
          )
          const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true
          const today = isToday(day)
          const hasTasks = dayTarefas.length > 0 || dayPosts.length > 0
          const dayColors = [...new Set(dayTarefas.map((t) => getTypeColor(t.tipo_tarefa_id)))]

          return (
            <div
              key={dateKey}
              onClick={() => onDayClick?.(day, dayTarefas, dayPosts)}
              className={cn(
                'calendar-day rounded-lg p-2 border border-transparent cursor-pointer transition-all overflow-y-auto',
                cellMinHeight,
                isCurrentMonth ? 'text-white' : 'text-gray-600',
                today && 'border-primary bg-primary/10',
                hasTasks && !today && 'border-gray-700',
              )}
              style={
                hasTasks && !today
                  ? { borderLeftColor: dayColors[0], borderLeftWidth: '3px' }
                  : {}
              }
            >
              {/* Day header */}
              <div className={cn(
                'font-medium mb-1',
                isExpandedView ? 'text-base' : 'text-sm',
                today && 'text-primary-light font-bold'
              )}>
                {viewMode === 'day'
                  ? format(day, "EEEE, d 'de' MMMM", { locale: ptBR })
                  : isExpandedView
                    ? format(day, "EEE d", { locale: ptBR })
                    : format(day, 'd')
                }
              </div>

              {/* Tasks list */}
              <div className={cn('space-y-0.5', isExpandedView && 'space-y-1')}>
                {dayTarefas.slice(0, maxTasks).map((tarefa) => {
                  const dl = getDeadlineStatus(tarefa.deadline_entrega, tarefa.realizado)
                  const bar = getProgressBar(tarefa.created_at, tarefa.deadline_entrega, tarefa.realizado)
                  const badgeStyle = dl.status === 'critical' ? DEADLINE_BADGE.critical : dl.status === 'urgent' ? DEADLINE_BADGE.urgent : null
                  return (
                  <div
                    key={tarefa.id}
                    className={cn(
                      'relative flex items-center gap-1 truncate rounded px-1.5 text-xs overflow-hidden',
                      isExpandedView ? 'py-1.5' : 'py-0.5',
                      tarefa.realizado && 'line-through opacity-60'
                    )}
                    style={{
                      backgroundColor: `${getTypeColor(tarefa.tipo_tarefa_id)}22`,
                      color: getTypeColor(tarefa.tipo_tarefa_id),
                    }}
                    title={tarefa.descricao}
                  >
                    {/* Barra de progresso deadline */}
                    {tarefa.deadline_entrega && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-black/20">
                        <div className={`h-full ${bar.colorClass}`} style={{ width: `${bar.percent}%` }} />
                      </div>
                    )}
                    {(() => { const Icon = getTypeIcon(tarefa.tipo_tarefa_id); return <Icon size={isExpandedView ? 14 : 12} className="shrink-0" /> })()}
                    {tarefa.hora_inicio && (
                      <span className="font-medium">{tarefa.hora_inicio?.slice(0, 5)} </span>
                    )}
                    <span className="truncate">{tarefa.descricao}</span>
                    {badgeStyle && (
                      <span className={`shrink-0 inline-flex items-center rounded-full px-1 py-0 text-[9px] font-bold ${badgeStyle.text} ${badgeStyle.pulse ? 'animate-pulse' : ''}`}>
                        <AlertTriangle size={9} />
                      </span>
                    )}
                    {tarefa.clientes?.nome && (
                      <span className="text-gray-400 ml-1 shrink-0">• {tarefa.clientes.nome}</span>
                    )}
                    {isExpandedView && tarefa.funcionarios?.nome && (
                      <span className="text-gray-500 ml-1 shrink-0">• {tarefa.funcionarios.nome}</span>
                    )}
                  </div>
                )})}
                {dayTarefas.length > maxTasks && !dayPosts.length && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayTarefas.length - maxTasks} mais
                  </div>
                )}

                {/* Cronograma Posts */}
                {dayPosts.slice(0, Math.max(1, maxTasks - dayTarefas.length)).map((post) => (
                  <div
                    key={`post-${post.id}`}
                    className={cn(
                      'flex items-center gap-1 truncate rounded px-1.5 text-xs border',
                      isExpandedView ? 'py-1.5' : 'py-0.5',
                      post.status === 'Planejado' ? 'border-dashed' : 'border-solid',
                    )}
                    style={{
                      backgroundColor: `${POST_STATUS_COLORS[post.status] || '#6366f1'}15`,
                      color: POST_STATUS_COLORS[post.status] || '#6366f1',
                      borderColor: `${POST_STATUS_COLORS[post.status] || '#6366f1'}40`,
                    }}
                    title={post.titulo || 'Post agendado'}
                    onClick={(e) => { e.stopPropagation(); onPostClick?.(post) }}
                  >
                    <Instagram size={isExpandedView ? 13 : 11} className="shrink-0" />
                    <span className="truncate">{post.titulo || post.rede_social?.[0] || 'Post'}</span>
                  </div>
                ))}
                {(dayTarefas.length + dayPosts.length) > maxTasks && (
                  <div className="text-xs text-gray-500 px-1">
                    +{(dayTarefas.length + dayPosts.length) - maxTasks} mais
                  </div>
                )}

                {isExpandedView && dayTarefas.length === 0 && dayPosts.length === 0 && (
                  <p className="text-xs text-gray-600 italic">Sem tarefas</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
