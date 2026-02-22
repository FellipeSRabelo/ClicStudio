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
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/Card'

export function Calendar({ tarefas = [], tiposTarefa = [], funcionarios = [], onDayClick, darkMode = false }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const tarefasByDay = useMemo(() => {
    const map = {}
    tarefas.forEach((t) => {
      const key = t.data_prazo
      if (!map[key]) map[key] = []
      map[key].push(t)
    })
    return map
  }, [tarefas])

  const getTypeColor = useCallback(
    (tipoId) => {
      const tipo = tiposTarefa.find((t) => t.id === tipoId)
      return tipo?.cor || '#5d109c'
    },
    [tiposTarefa]
  )

  const getFuncColor = useCallback(
    (funcId) => {
      const func = funcionarios.find((f) => f.id === funcId)
      return func?.cor || '#5d109c'
    },
    [funcionarios]
  )

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <div className={cn('flex flex-col h-full', darkMode && 'text-white')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="rounded-lg p-2 hover:bg-surface-light transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="rounded-lg p-2 hover:bg-surface-light transition-colors cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayTarefas = tarefasByDay[dateKey] || []
          const isCurrentMonth = isSameMonth(day, currentDate)
          const today = isToday(day)
          const hasTasks = dayTarefas.length > 0

          // Determine day background color based on tasks
          const dayColors = [...new Set(dayTarefas.map((t) => getTypeColor(t.tipo_tarefa_id)))]

          return (
            <div
              key={dateKey}
              onClick={() => onDayClick?.(day, dayTarefas)}
              className={cn(
                'calendar-day rounded-lg p-1.5 min-h-[80px] lg:min-h-[100px] border border-transparent cursor-pointer transition-all',
                isCurrentMonth ? 'text-white' : 'text-gray-600',
                today && 'border-primary bg-primary/10',
                hasTasks && !today && 'border-gray-700',
                darkMode && 'min-h-[90px] lg:min-h-[120px]'
              )}
              style={
                hasTasks && !today
                  ? { borderLeftColor: dayColors[0], borderLeftWidth: '3px' }
                  : {}
              }
            >
              <div
                className={cn(
                  'text-sm font-medium mb-1',
                  today && 'text-primary-light font-bold'
                )}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayTarefas.slice(0, darkMode ? 4 : 3).map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className={cn(
                      'truncate rounded px-1 py-0.5 text-xs',
                      tarefa.realizado && 'line-through opacity-60'
                    )}
                    style={{
                      backgroundColor: `${getTypeColor(tarefa.tipo_tarefa_id)}22`,
                      color: getTypeColor(tarefa.tipo_tarefa_id),
                    }}
                    title={tarefa.descricao}
                  >
                    {tarefa.hora_inicio && (
                      <span className="font-medium">{tarefa.hora_inicio?.slice(0, 5)} </span>
                    )}
                    {tarefa.descricao}
                  </div>
                ))}
                {dayTarefas.length > (darkMode ? 4 : 3) && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayTarefas.length - (darkMode ? 4 : 3)} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
