import { useState } from 'react'
import { Plus, UserCircle, Edit2, Trash2, Search, KeyRound, Loader2 } from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabase'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Table, LoadingSpinner, EmptyState } from '../components/ui/Card'

export function FuncionariosPage() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [criarAcesso, setCriarAcesso] = useState(false)

  const { data: funcionarios, loading, refetch } = useSupabaseQuery('funcionarios', {
    orderBy: 'nome',
    ascending: true,
  })

  const { insert, update, remove, loading: mutating } = useSupabaseMutation('funcionarios')

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cargo: '', cor: '#5d109c', senha: '' })

  const openNew = () => {
    setEditing(null)
    setCriarAcesso(true)
    setAuthError('')
    setForm({ nome: '', email: '', telefone: '', cargo: '', cor: '#5d109c', senha: '' })
    setShowModal(true)
  }

  const openEdit = (func) => {
    setEditing(func)
    setCriarAcesso(false)
    setAuthError('')
    setForm({
      nome: func.nome,
      email: func.email || '',
      telefone: func.telefone || '',
      cargo: func.cargo || '',
      cor: func.cor || '#5d109c',
      senha: '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const { senha, ...funcData } = form

      if (editing) {
        await update(editing.id, funcData)
      } else {
        // Se marcou para criar acesso, cria o usuário no Supabase Auth
        if (criarAcesso && form.email && senha) {
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: senha,
            options: {
              data: { nome: form.nome, cargo: form.cargo },
            },
          })

          if (signUpError) {
            setAuthError(signUpError.message)
            setAuthLoading(false)
            return
          }

          // Inserir funcionário com o auth_user_id vinculado
          await insert({ ...funcData, auth_user_id: authData.user?.id || null })
        } else {
          await insert(funcData)
        }
      }

      setShowModal(false)
      refetch()
    } catch (err) {
      setAuthError(err.message || 'Erro ao salvar')
    } finally {
      setAuthLoading(false)
    }
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

  const filtered = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(search.toLowerCase()) ||
    f.cargo?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircle size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Funcionários</h1>
          <span className="text-sm text-gray-500">({funcionarios.length})</span>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} /> Novo Funcionário
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar funcionários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-surface-light pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="Nenhum funcionário encontrado"
          description="Adicione seu primeiro funcionário"
          action={<Button onClick={openNew}><Plus size={16} /> Novo Funcionário</Button>}
        />
      ) : (
        <Table headers={['', 'Nome', 'Email', 'Telefone', 'Cargo', 'Ações']}>
          {filtered.map((func) => (
            <tr key={func.id} className="hover:bg-surface-light/50 transition-colors">
              <td className="px-4 py-3">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: func.cor }}
                />
              </td>
              <td className="px-4 py-3 text-white font-medium">{func.nome}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{func.email || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{func.telefone || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{func.cargo || '—'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(func)}
                    className="rounded p-1 text-gray-500 hover:text-white hover:bg-surface-lighter transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(func.id)}
                    className={`rounded p-1 transition-colors cursor-pointer ${
                      confirmDelete === func.id
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Funcionário' : 'Novo Funcionário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome *"
            placeholder="Nome do funcionário"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cargo"
              placeholder="Ex: Fotógrafo"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            />
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
          </div>

          {/* Criar acesso (apenas para novos funcionários) */}
          {!editing && (
            <div className="rounded-lg border border-gray-700 p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criarAcesso}
                  onChange={(e) => setCriarAcesso(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 cursor-pointer accent-primary"
                />
                <KeyRound size={16} className="text-primary-light" />
                <span className="text-sm font-medium text-gray-300">Criar acesso ao sistema</span>
              </label>
              {criarAcesso && (
                <div className="space-y-2 pl-6">
                  <p className="text-xs text-gray-500">
                    O funcionário poderá logar no ClicStudio com o email acima e a senha definida abaixo.
                  </p>
                  <Input
                    label="Senha de acesso *"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    required={criarAcesso}
                  />
                </div>
              )}
            </div>
          )}

          {authError && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{authError}</p>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={mutating || authLoading}>
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
