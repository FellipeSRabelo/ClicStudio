import { useState } from 'react'
import { Plus, Users, Edit2, Trash2, Search } from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabase'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Table, LoadingSpinner, EmptyState } from '../components/ui/Card'
import { formatDate } from '../lib/utils'

export function ClientesPage() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: clientes, loading, refetch } = useSupabaseQuery('clientes', {
    orderBy: 'nome',
    ascending: true,
  })

  const { insert, update, remove, loading: mutating } = useSupabaseMutation('clientes')

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', empresa: '', notas: '' })

  const openNew = () => {
    setEditing(null)
    setForm({ nome: '', email: '', telefone: '', empresa: '', notas: '' })
    setShowModal(true)
  }

  const openEdit = (cliente) => {
    setEditing(cliente)
    setForm({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      empresa: cliente.empresa || '',
      notas: cliente.notas || '',
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

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.empresa?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Clientes</h1>
          <span className="text-sm text-gray-500">({clientes.length})</span>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} /> Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-surface-light pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description="Adicione seu primeiro cliente"
          action={<Button onClick={openNew}><Plus size={16} /> Novo Cliente</Button>}
        />
      ) : (
        <Table headers={['Nome', 'Email', 'Telefone', 'Empresa', 'Ações']}>
          {filtered.map((cliente) => (
            <tr key={cliente.id} className="hover:bg-surface-light/50 transition-colors">
              <td className="px-4 py-3 text-white font-medium">{cliente.nome}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{cliente.email || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{cliente.telefone || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{cliente.empresa || '—'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cliente)}
                    className="rounded p-1 text-gray-500 hover:text-white hover:bg-surface-lighter transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className={`rounded p-1 transition-colors cursor-pointer ${
                      confirmDelete === cliente.id
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome *"
            placeholder="Nome do cliente"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>
          <Input
            label="Empresa"
            placeholder="Nome da empresa"
            value={form.empresa}
            onChange={(e) => setForm({ ...form, empresa: e.target.value })}
          />
          <Textarea
            label="Notas"
            placeholder="Observações sobre o cliente..."
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={mutating}>{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
