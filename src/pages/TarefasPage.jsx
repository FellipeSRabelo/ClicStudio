import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  ClipboardList,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Search,
} from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation, useRealtimeSubscription } from '../hooks/useSupabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Table, LoadingSpinner, EmptyState, Badge } from '../components/ui/Card'
import { TarefaModal } from '../components/tarefas/TarefaModal'
import { supabase } from '../lib/supabase'

export function TarefasPage() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const { data: tarefas, loading, refetch } = useSupabaseQuery('tarefas', {
    select: '*, clientes(nome), tipos_tarefa(nome, cor), funcionarios(nome, cor)',
    orderBy: 'data_prazo',
    ascending: true,
  })

  const { data: clientes } = useSupabaseQuery('clientes', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })
  const { data: funcionarios } = useSupabaseQuery('funcionarios', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })
  const { data: tiposTarefa } = useSupabaseQuery('tipos_tarefa', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  const handleRealtime = useCallback(() => refetch(), [refetch])
  useRealtimeSubscription('tarefas', handleRealtime)

  const toggleRealizado = async (tarefa) => {
    await supabase.from('tarefas').update({ realizado: !tarefa.realizado }).eq('id', tarefa.id)
    refetch()
  }

  const filteredTarefas = tarefas.filter((t) =>
    t.descricao.toLowerCase().includes(search.toLowerCase()) ||
    t.clientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
    t.funcionarios?.nome?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Tarefas</h1>
          <span className="text-sm text-gray-500">({tarefas.length})</span>
        </div>
        <Button onClick={() => { setEditing(null); setShowModal(true) }}>
          <Plus size={16} /> Nova Tarefa
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-surface-light pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
        />
      </div>

      {filteredTarefas.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma tarefa encontrada"
          description="Crie sua primeira tarefa"
          action={
            <Button onClick={() => { setEditing(null); setShowModal(true) }}>
              <Plus size={16} /> Nova Tarefa
            </Button>
          }
        />
      ) : (
        <Table headers={['Status', 'Descrição', 'Tipo', 'Data', 'Responsável', 'Local', 'Ações']}>
          {filteredTarefas.map((tarefa) => (
            <tr key={tarefa.id} className="hover:bg-surface-light/50 transition-colors">
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
                <div className={tarefa.realizado ? 'line-through text-gray-500' : 'text-white'}>
                  {tarefa.descricao}
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
              <td className="px-4 py-3 text-sm text-gray-400">
                {tarefa.funcionarios?.nome || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {tarefa.local || '—'}
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
          ))}
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
