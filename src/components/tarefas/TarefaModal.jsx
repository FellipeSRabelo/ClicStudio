import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Save, Trash2, Loader2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input, Select, Textarea, Checkbox } from '../ui/Input'
import { useSupabaseMutation } from '../../hooks/useSupabase'

export function TarefaModal({
  isOpen,
  onClose,
  tarefa,
  defaultDate,
  clientes = [],
  funcionarios = [],
  tiposTarefa = [],
  onSaved,
}) {
  const { insert, update, remove, loading } = useSupabaseMutation('tarefas')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [form, setForm] = useState({
    descricao: '',
    cliente_id: '',
    tipo_tarefa_id: '',
    funcionario_id: '',
    data_prazo: '',
    hora_inicio: '',
    hora_fim: '',
    local: '',
    link_galeria: '',
    deadline_entrega: '',
    realizado: false,
    observacoes: '',
  })

  useEffect(() => {
    if (tarefa) {
      setForm({
        descricao: tarefa.descricao || '',
        cliente_id: tarefa.cliente_id || '',
        tipo_tarefa_id: tarefa.tipo_tarefa_id || '',
        funcionario_id: tarefa.funcionario_id || '',
        data_prazo: tarefa.data_prazo || '',
        hora_inicio: tarefa.hora_inicio?.slice(0, 5) || '',
        hora_fim: tarefa.hora_fim?.slice(0, 5) || '',
        local: tarefa.local || '',
        link_galeria: tarefa.link_galeria || '',
        deadline_entrega: tarefa.deadline_entrega ? tarefa.deadline_entrega.slice(0, 16) : '',
        realizado: tarefa.realizado || false,
        observacoes: tarefa.observacoes || '',
      })
    } else {
      setForm({
        descricao: '',
        cliente_id: '',
        tipo_tarefa_id: '',
        funcionario_id: '',
        data_prazo: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '',
        hora_inicio: '',
        hora_fim: '',
        local: '',
        link_galeria: '',
        deadline_entrega: '',
        realizado: false,
        observacoes: '',
      })
    }
    setConfirmDelete(false)
  }, [tarefa, defaultDate, isOpen])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...form,
      cliente_id: form.cliente_id || null,
      tipo_tarefa_id: form.tipo_tarefa_id || null,
      funcionario_id: form.funcionario_id || null,
      hora_inicio: form.hora_inicio || null,
      hora_fim: form.hora_fim || null,
      link_galeria: form.link_galeria || null,
      deadline_entrega: form.deadline_entrega ? new Date(form.deadline_entrega).toISOString() : null,
    }

    if (tarefa) {
      await update(tarefa.id, data)
    } else {
      await insert(data)
    }
    onSaved()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await remove(tarefa.id)
    onSaved()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Descrição *"
          placeholder="Ex: Ensaio fotográfico de casamento"
          value={form.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Cliente"
            value={form.cliente_id}
            onChange={(e) => handleChange('cliente_id', e.target.value)}
          >
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </Select>

          <Select
            label="Tipo de Tarefa"
            value={form.tipo_tarefa_id}
            onChange={(e) => handleChange('tipo_tarefa_id', e.target.value)}
          >
            <option value="">Selecione...</option>
            {tiposTarefa.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Responsável"
            value={form.funcionario_id}
            onChange={(e) => handleChange('funcionario_id', e.target.value)}
          >
            <option value="">Selecione...</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </Select>

          <Input
            label="Data *"
            type="date"
            value={form.data_prazo}
            onChange={(e) => handleChange('data_prazo', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Hora Início"
            type="time"
            value={form.hora_inicio}
            onChange={(e) => handleChange('hora_inicio', e.target.value)}
          />
          <Input
            label="Hora Fim"
            type="time"
            value={form.hora_fim}
            onChange={(e) => handleChange('hora_fim', e.target.value)}
          />
          <Input
            label="Local"
            placeholder="Ex: Estúdio A"
            value={form.local}
            onChange={(e) => handleChange('local', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Link da Galeria / Entrega"
            placeholder="https://drive.google.com/..."
            value={form.link_galeria}
            onChange={(e) => handleChange('link_galeria', e.target.value)}
          />
          <Input
            label="Deadline de Entrega"
            type="datetime-local"
            value={form.deadline_entrega}
            onChange={(e) => handleChange('deadline_entrega', e.target.value)}
          />
        </div>

        <Textarea
          label="Observações"
          placeholder="Notas adicionais..."
          value={form.observacoes}
          onChange={(e) => handleChange('observacoes', e.target.value)}
        />

        <Checkbox
          label="Tarefa realizada"
          checked={form.realizado}
          onChange={(e) => handleChange('realizado', e.target.checked)}
        />

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div>
            {tarefa && (
              <Button
                type="button"
                variant={confirmDelete ? 'danger' : 'ghost'}
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 size={16} />
                {confirmDelete ? 'Confirmar exclusão' : 'Excluir'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {tarefa ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
