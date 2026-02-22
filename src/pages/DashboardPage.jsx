import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '../components/calendar/Calendar'
import { useSupabaseQuery, useRealtimeSubscription } from '../hooks/useSupabase'
import { LoadingSpinner } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FilterSidebar } from '../components/filters/FilterSidebar'
import { TarefaModal } from '../components/tarefas/TarefaModal'
import { DayDetailModal } from '../components/calendar/DayDetailModal'

export function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayTarefas, setDayTarefas] = useState([])
  const [showTarefaModal, setShowTarefaModal] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  // Filtros
  const [filtroFuncionarios, setFiltroFuncionarios] = useState([])
  const [filtroTipos, setFiltroTipos] = useState([])

  const { data: tarefas, loading: loadingTarefas, refetch: refetchTarefas } = useSupabaseQuery('tarefas', {
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

  const { data: clientes } = useSupabaseQuery('clientes', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  // Realtime
  const handleRealtime = useCallback(() => {
    refetchTarefas()
  }, [refetchTarefas])

  useRealtimeSubscription('tarefas', handleRealtime)

  // Filtrar tarefas
  const filteredTarefas = tarefas.filter((t) => {
    if (filtroFuncionarios.length > 0 && !filtroFuncionarios.includes(t.funcionario_id)) return false
    if (filtroTipos.length > 0 && !filtroTipos.includes(t.tipo_tarefa_id)) return false
    return true
  })

  const handleDayClick = (day, tarefasDoDia) => {
    setSelectedDay(day)
    setDayTarefas(tarefasDoDia)
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

  if (loadingTarefas) return <LoadingSpinner />

  return (
    <div className="flex gap-4 h-full">
      {/* Sidebar Filtros */}
      <FilterSidebar
        funcionarios={funcionarios}
        tiposTarefa={tiposTarefa}
        filtroFuncionarios={filtroFuncionarios}
        setFiltroFuncionarios={setFiltroFuncionarios}
        filtroTipos={filtroTipos}
        setFiltroTipos={setFiltroTipos}
      />

      {/* Calendário */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary-light" />
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
          <Button onClick={() => handleNewTarefa(new Date())}>
            <Plus size={16} />
            Nova Tarefa
          </Button>
        </div>

        <Calendar
          tarefas={filteredTarefas}
          tiposTarefa={tiposTarefa}
          funcionarios={funcionarios}
          onDayClick={handleDayClick}
        />
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
        tiposTarefa={tiposTarefa}
        funcionarios={funcionarios}
        onEdit={handleEditTarefa}
        onNew={() => handleNewTarefa(selectedDay)}
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
    </div>
  )
}
