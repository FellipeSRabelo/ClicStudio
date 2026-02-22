import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Edit2, Clock, MapPin, User, CheckCircle2, Circle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Card'

export function DayDetailModal({ isOpen, onClose, day, tarefas = [], tiposTarefa = [], funcionarios = [], onEdit, onNew }) {
  if (!day) return null

  const getTypeName = (id) => tiposTarefa.find((t) => t.id === id)?.nome || 'Sem tipo'
  const getTypeColor = (id) => tiposTarefa.find((t) => t.id === id)?.cor || '#5d109c'
  const getFuncName = (id) => funcionarios.find((f) => f.id === id)?.nome || 'Sem responsável'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
      size="md"
    >
      <div className="space-y-3">
        {tarefas.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Nenhuma tarefa neste dia</p>
        ) : (
          tarefas
            .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
            .map((tarefa) => (
              <div
                key={tarefa.id}
                className="rounded-lg border border-gray-800 p-3 hover:border-gray-700 transition-colors group"
                style={{ borderLeftColor: getTypeColor(tarefa.tipo_tarefa_id), borderLeftWidth: '3px' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {tarefa.realizado ? (
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-gray-600 shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${tarefa.realizado ? 'line-through text-gray-500' : 'text-white'}`}>
                        {tarefa.descricao}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 ml-6 text-xs text-gray-400">
                      <Badge color={getTypeColor(tarefa.tipo_tarefa_id)}>
                        {getTypeName(tarefa.tipo_tarefa_id)}
                      </Badge>
                      {tarefa.hora_inicio && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {tarefa.hora_inicio?.slice(0, 5)}
                          {tarefa.hora_fim && ` - ${tarefa.hora_fim?.slice(0, 5)}`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {getFuncName(tarefa.funcionario_id)}
                      </span>
                      {tarefa.local && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {tarefa.local}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onEdit(tarefa)}
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-500 hover:text-white hover:bg-surface-light transition-all cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <Button onClick={onNew} variant="outline" className="w-full">
          <Plus size={16} />
          Nova tarefa neste dia
        </Button>
      </div>
    </Modal>
  )
}
