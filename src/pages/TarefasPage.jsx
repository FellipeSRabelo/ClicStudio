import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval, addDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  ClipboardList,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  X,
  CalendarDays,
  CalendarRange,
  Clock,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation, useRealtimeSubscription } from '../hooks/useSupabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Table, LoadingSpinner, EmptyState, Badge } from '../components/ui/Card'
import { TarefaModal } from '../components/tarefas/TarefaModal'
import { supabase } from '../lib/supabase'
import { getDeadlineStatus, getDeadlineText, getProgressBar, DEADLINE_BADGE } from '../lib/deadline'

const QUICK_PERIODS = [
  { key: 'today', label: 'Hoje', icon: Clock },
  { key: 'tomorrow', label: 'Amanhã', icon: CalendarDays },
  { key: 'week', label: 'Esta Semana', icon: CalendarRange },
]

export function TarefasPage() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filtros
  const [quickPeriod, setQuickPeriod] = useState(null) // 'today' | 'tomorrow' | 'week' | null
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filtroClientes, setFiltroClientes] = useState([])
  const [filtroTipos, setFiltroTipos] = useState([])

  const { data: tarefas, loading, refetch } = useSupabaseQuery('tarefas', {
    select: '*, clientes(nome, telefone), tipos_tarefa(nome, cor, icone), funcionarios(nome, cor, telefone)',
    orderBy: 'data_prazo',
    ascending: true,
  })

  const { data: clientes } = useSupabaseQuery('clientes', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
    orderBy: 'nome',
    ascending: true,
  })
  const { data: funcionarios } = useSupabaseQuery('funcionarios', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })
  const { data: tiposTarefa } = useSupabaseQuery('tipos_tarefa', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
    orderBy: 'nome',
    ascending: true,
  })

  const handleRealtime = useCallback(() => refetch(), [refetch])
  useRealtimeSubscription('tarefas', handleRealtime)

  const toggleRealizado = async (tarefa) => {
    await supabase.from('tarefas').update({ realizado: !tarefa.realizado }).eq('id', tarefa.id)
    refetch()
  }

  // Selecionar período rápido (sobrescreve intervalo customizado)
  const selectQuickPeriod = (key) => {
    if (quickPeriod === key) {
      setQuickPeriod(null)
    } else {
      setQuickPeriod(key)
      setDateFrom('')
      setDateTo('')
    }
  }

  // Quando define intervalo customizado, limpa período rápido
  const handleDateFrom = (v) => {
    setDateFrom(v)
    setQuickPeriod(null)
  }
  const handleDateTo = (v) => {
    setDateTo(v)
    setQuickPeriod(null)
  }

  const [showClienteDropdown, setShowClienteDropdown] = useState(false)
  const clienteDropdownRef = useRef(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (clienteDropdownRef.current && !clienteDropdownRef.current.contains(e.target)) {
        setShowClienteDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleCliente = (id) => {
    setFiltroClientes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleTipo = (id) => {
    setFiltroTipos((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const clearAllFilters = () => {
    setQuickPeriod(null)
    setDateFrom('')
    setDateTo('')
    setFiltroClientes([])
    setFiltroTipos([])
    setSearch('')
  }

  // Filtros combinados
  const filteredTarefas = useMemo(() => {
    const filtered = tarefas.filter((t) => {
      // Busca texto
      if (search) {
        const s = search.toLowerCase()
        const match =
          t.descricao.toLowerCase().includes(s) ||
          t.clientes?.nome?.toLowerCase().includes(s) ||
          t.funcionarios?.nome?.toLowerCase().includes(s) ||
          t.local?.toLowerCase().includes(s)
        if (!match) return false
      }

      // Filtro por data (período rápido ou intervalo customizado)
      if (quickPeriod) {
        const d = parseISO(t.data_prazo)
        if (quickPeriod === 'today' && !isToday(d)) return false
        if (quickPeriod === 'tomorrow' && !isTomorrow(d)) return false
        if (quickPeriod === 'week') {
          const now = new Date()
          const ws = startOfWeek(now, { weekStartsOn: 1 })
          const we = endOfWeek(now, { weekStartsOn: 1 })
          if (!isWithinInterval(d, { start: ws, end: we })) return false
        }
      } else {
        if (dateFrom && t.data_prazo < dateFrom) return false
        if (dateTo && t.data_prazo > dateTo) return false
      }

      // Filtro por cliente
      if (filtroClientes.length > 0 && !filtroClientes.includes(t.cliente_id)) return false

      // Filtro por tipo
      if (filtroTipos.length > 0 && !filtroTipos.includes(t.tipo_tarefa_id)) return false

      return true
    })

    // Ordenar: tarefas com deadline mais próximo primeiro, sem deadline por último
    return filtered.sort((a, b) => {
      const aHasDeadline = !!a.deadline_entrega
      const bHasDeadline = !!b.deadline_entrega
      if (aHasDeadline && bHasDeadline) {
        return new Date(a.deadline_entrega) - new Date(b.deadline_entrega)
      }
      if (aHasDeadline) return -1
      if (bHasDeadline) return 1
      return (a.data_prazo || '').localeCompare(b.data_prazo || '')
    })
  }, [tarefas, search, quickPeriod, dateFrom, dateTo, filtroClientes, filtroTipos])

  const activeFiltersCount =
    (quickPeriod ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    filtroClientes.length +
    filtroTipos.length

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Tarefas</h1>
          <span className="text-sm text-gray-500">({filteredTarefas.length}/{tarefas.length})</span>
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
          <Button onClick={() => { setEditing(null); setShowModal(true) }}>
            <Plus size={16} /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar tarefas, clientes, responsáveis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-surface-light pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="rounded-xl border border-gray-800 bg-surface p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
              <Filter size={14} /> Filtros Avançados
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary-light hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <X size={12} /> Limpar tudo
              </button>
            )}
          </div>

          {/* Período rápido */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Período Rápido
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => selectQuickPeriod(p.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    quickPeriod === p.key
                      ? 'bg-primary text-white'
                      : 'bg-surface-light text-gray-400 hover:text-white hover:bg-surface-lighter'
                  }`}
                >
                  <p.icon size={13} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Intervalo customizado */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Intervalo Customizado
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFrom(e.target.value)}
                className="rounded-lg border border-gray-700 bg-surface-light px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
              />
              <span className="text-xs text-gray-500">até</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateTo(e.target.value)}
                className="rounded-lg border border-gray-700 bg-surface-light px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Filtro por Cliente e Tipo lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cliente - Dropdown multiselect */}
            <div ref={clienteDropdownRef} className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Cliente
              </label>
              <button
                type="button"
                onClick={() => setShowClienteDropdown(!showClienteDropdown)}
                className="w-full flex items-center justify-between rounded-lg border border-gray-700 bg-surface-light px-3 py-2 text-xs text-left cursor-pointer hover:border-gray-600 transition-colors"
              >
                <span className={filtroClientes.length > 0 ? 'text-white' : 'text-gray-500'}>
                  {filtroClientes.length > 0
                    ? `${filtroClientes.length} cliente${filtroClientes.length > 1 ? 's' : ''} selecionado${filtroClientes.length > 1 ? 's' : ''}`
                    : 'Todos os clientes'}
                </span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${showClienteDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showClienteDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-700 bg-surface-light shadow-xl max-h-48 overflow-y-auto">
                  {filtroClientes.length > 0 && (
                    <button
                      onClick={() => setFiltroClientes([])}
                      className="w-full text-left px-3 py-1.5 text-xs text-primary-light hover:bg-surface-lighter transition-colors cursor-pointer border-b border-gray-700"
                    >
                      Limpar seleção
                    </button>
                  )}
                  {clientes.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-surface-lighter hover:text-white cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filtroClientes.includes(c.id)}
                        onChange={() => toggleCliente(c.id)}
                        className="w-3.5 h-3.5 rounded border-gray-600 cursor-pointer accent-primary"
                      />
                      <span className="truncate">{c.nome}</span>
                    </label>
                  ))}
                  {clientes.length === 0 && (
                    <p className="text-xs text-gray-600 px-3 py-2">Nenhum cliente</p>
                  )}
                </div>
              )}
            </div>

            {/* Tipo de Tarefa */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tipo de Tarefa
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {tiposTarefa.map((tipo) => (
                  <label
                    key={tipo.id}
                    className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filtroTipos.includes(tipo.id)}
                      onChange={() => toggleTipo(tipo.id)}
                      className="w-3.5 h-3.5 rounded border-gray-600 cursor-pointer accent-primary"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tipo.cor }}
                    />
                    <span className="truncate">{tipo.nome}</span>
                  </label>
                ))}
                {tiposTarefa.length === 0 && (
                  <p className="text-xs text-gray-600">Nenhum tipo</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredTarefas.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma tarefa encontrada"
          description={activeFiltersCount > 0 ? "Tente ajustar os filtros" : "Crie sua primeira tarefa"}
          action={
            activeFiltersCount > 0 ? (
              <Button variant="secondary" onClick={clearAllFilters}>
                <X size={16} /> Limpar Filtros
              </Button>
            ) : (
              <Button onClick={() => { setEditing(null); setShowModal(true) }}>
                <Plus size={16} /> Nova Tarefa
              </Button>
            )
          }
        />
      ) : (
        <Table headers={['Status', 'Descrição', 'Tipo', 'Data', 'Deadline', 'Responsável', 'Ações']}>
          {filteredTarefas.map((tarefa) => {
            const dl = getDeadlineStatus(tarefa.deadline_entrega, tarefa.realizado)
            const dlText = getDeadlineText(tarefa.deadline_entrega)
            const bar = getProgressBar(tarefa.deadline_entrega, tarefa.realizado, tarefa.janela_alerta_horas)
            const badgeStyle = dl.status === 'critical' ? DEADLINE_BADGE.critical : dl.status === 'urgent' ? DEADLINE_BADGE.urgent : null
            return (
            <React.Fragment key={tarefa.id}>
              {/* Barra de progresso temporal - row separada */}
              {tarefa.deadline_entrega && (
                <tr className="h-0">
                  <td colSpan={7} className="p-0 border-0">
                    <div className="h-[3px] bg-gray-800/40 w-full">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${bar.percent}%`, backgroundColor: bar.color }}
                      />
                    </div>
                  </td>
                </tr>
              )}
              <tr className="hover:bg-surface-light/50 transition-colors">
              <td className="px-4 py-3">
                <button onClick={() => toggleRealizado(tarefa)} className="cursor-pointer">
                  {tarefa.realizado ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <Circle size={18} className="text-gray-600" />
                  )}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={tarefa.realizado ? 'line-through text-gray-500' : 'text-white'}>
                    {tarefa.descricao}
                  </div>
                  {badgeStyle && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} ${badgeStyle.pulse ? 'animate-pulse' : ''}`}>
                      <AlertTriangle size={11} />
                      {dl.status === 'critical' ? (dl.hoursLeft < 0 ? 'Atrasado' : 'Crítico') : dl.label}
                    </span>
                  )}
                </div>
                {tarefa.clientes?.nome && (
                  <div className="text-xs text-gray-500">{tarefa.clientes.nome}</div>
                )}
              </td>
              <td className="px-4 py-3">
                {tarefa.tipos_tarefa && (
                  <Badge color={tarefa.tipos_tarefa.cor}>{tarefa.tipos_tarefa.nome}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {format(new Date(tarefa.data_prazo + 'T00:00:00'), 'dd/MM/yyyy')}
                {tarefa.hora_inicio && (
                  <div className="text-xs">{tarefa.hora_inicio.slice(0, 5)}</div>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                {tarefa.deadline_entrega ? (
                  <div>
                    <div className="text-gray-400">{format(new Date(tarefa.deadline_entrega), 'dd/MM HH:mm')}</div>
                    {dlText && !tarefa.realizado && (
                      <div className={`text-xs mt-0.5 ${dl.status === 'critical' ? 'text-red-400' : dl.status === 'urgent' ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {dlText}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {tarefa.funcionarios?.nome || '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(tarefa); setShowModal(true) }}
                    className="rounded p-1 text-gray-500 hover:text-white hover:bg-surface-lighter transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
            </React.Fragment>
          )})}  
        </Table>
      )}

      <TarefaModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null) }}
        tarefa={editing}
        clientes={clientes}
        funcionarios={funcionarios}
        tiposTarefa={tiposTarefa}
        onSaved={() => { refetch(); setShowModal(false); setEditing(null) }}
      />
    </div>
  )
}
