import { useState } from 'react'
import { Plus, Tag, Edit2, Trash2 } from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Table, LoadingSpinner, EmptyState, Badge } from '../components/ui/Card'

const ICON_OPTIONS = [
  { value: 'camera', label: 'Câmera' },
  { value: 'video', label: 'Vídeo' },
  { value: 'image', label: 'Imagem' },
  { value: 'film', label: 'Filme' },
  { value: 'briefcase', label: 'Pasta' },
  { value: 'users', label: 'Pessoas' },
  { value: 'package', label: 'Pacote' },
  { value: 'calendar', label: 'Calendário' },
  { value: 'star', label: 'Estrela' },
  { value: 'heart', label: 'Coração' },
]

export function TiposTarefaPage() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: tipos, loading, refetch } = useSupabaseQuery('tipos_tarefa', {
    orderBy: 'nome',
    ascending: true,
  })

  const { insert, update, remove, loading: mutating } = useSupabaseMutation('tipos_tarefa')

  const [form, setForm] = useState({ nome: '', cor: '#5d109c', icone: 'camera' })

  const openNew = () => {
    setEditing(null)
    setForm({ nome: '', cor: '#5d109c', icone: 'camera' })
    setShowModal(true)
  }

  const openEdit = (tipo) => {
    setEditing(tipo)
    setForm({
      nome: tipo.nome,
      cor: tipo.cor || '#5d109c',
      icone: tipo.icone || 'camera',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await update(editing.id, form)
    } else {
      await insert(form)
    }
    setShowModal(false)
    refetch()
  }

  const handleDelete = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    await remove(id)
    setConfirmDelete(null)
    refetch()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Tipos de Tarefa</h1>
          <span className="text-sm text-gray-500">({tipos.length})</span>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} /> Novo Tipo
        </Button>
      </div>

      {tipos.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Nenhum tipo de tarefa"
          description="Crie seu primeiro tipo de tarefa"
          action={<Button onClick={openNew}><Plus size={16} /> Novo Tipo</Button>}
        />
      ) : (
        <Table headers={['', 'Nome', 'Ícone', 'Status', 'Ações']}>
          {tipos.map((tipo) => (
            <tr key={tipo.id} className="hover:bg-surface-light/50 transition-colors">
              <td className="px-4 py-3">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: tipo.cor }}
                />
              </td>
              <td className="px-4 py-3">
                <Badge color={tipo.cor}>{tipo.nome}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {ICON_OPTIONS.find((i) => i.value === tipo.icone)?.label || tipo.icone}
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs ${tipo.ativo ? 'text-green-400' : 'text-gray-500'}`}>
                  {tipo.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(tipo)}
                    className="rounded p-1 text-gray-500 hover:text-white hover:bg-surface-lighter transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(tipo.id)}
                    className={`rounded p-1 transition-colors cursor-pointer ${
                      confirmDelete === tipo.id
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-gray-500 hover:text-red-400 hover:bg-surface-lighter'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Tipo' : 'Novo Tipo de Tarefa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome *"
            placeholder="Ex: Ensaio Fotográfico"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Cor</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.cor}
                  onChange={(e) => setForm({ ...form, cor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-sm text-gray-400">{form.cor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">Ícone</label>
              <select
                value={form.icone}
                onChange={(e) => setForm({ ...form, icone: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-surface-light px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={mutating}>{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
