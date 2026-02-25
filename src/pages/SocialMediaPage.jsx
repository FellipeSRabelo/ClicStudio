import { useState, useCallback, useMemo } from 'react'
import { format, eachDayOfInterval, getDay, parseISO, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Share2,
  Instagram,
  Loader2,
  Trash2,
  Edit2,
  ExternalLink,
  Calendar as CalendarIcon,
  Filter,
  Eye,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSupabaseQuery, useRealtimeSubscription } from '../hooks/useSupabase'
import { LoadingSpinner, Badge } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { cn } from '../lib/utils'

/* ─── Constantes ─── */
const REDES_SOCIAIS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'X (Twitter)']
const TIPOS_POST = ['Reel', 'Carrossel', 'Foto']
const STATUS_LIST = ['Planejado', 'Em Produção', 'Aprovado', 'Postado']
const DIAS_SEMANA = [
  { key: 1, label: 'Seg' },
  { key: 2, label: 'Ter' },
  { key: 3, label: 'Qua' },
  { key: 4, label: 'Qui' },
  { key: 5, label: 'Sex' },
  { key: 6, label: 'Sáb' },
  { key: 0, label: 'Dom' },
]

const STATUS_COLORS = {
  'Planejado': '#6366f1',
  'Em Produção': '#f59e0b',
  'Aprovado': '#22c55e',
  'Postado': '#06b6d4',
}

/* ═════════════════════════════════════════ */
export function SocialMediaPage() {
  const [showForm, setShowForm] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCliente, setFilterCliente] = useState('')

  // ─── Form state (Bulk) ───
  const [formClienteId, setFormClienteId] = useState('')
  const [formRedes, setFormRedes] = useState([])
  const [formTipoPost, setFormTipoPost] = useState('Reel')
  const [formResponsavelId, setFormResponsavelId] = useState('')
  const [formHorario, setFormHorario] = useState('10:00')
  const [formDataInicio, setFormDataInicio] = useState('')
  const [formDataFim, setFormDataFim] = useState('')
  const [formDiasSemana, setFormDiasSemana] = useState([1, 3, 5]) // Seg, Qua, Sex

  // ─── Data queries ───
  const { data: posts, loading: loadingPosts, refetch: refetchPosts } = useSupabaseQuery('cronograma_posts', {
    select: '*, clientes(nome), funcionarios(nome)',
    orderBy: 'data_agendada',
    ascending: true,
  })

  const { data: clientes } = useSupabaseQuery('clientes', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  const { data: funcionarios } = useSupabaseQuery('funcionarios', {
    filters: [{ column: 'ativo', operator: 'eq', value: true }],
  })

  // Realtime
  const handleRealtime = useCallback(() => {
    refetchPosts()
  }, [refetchPosts])
  useRealtimeSubscription('cronograma_posts', handleRealtime)

  // ─── Filtros ───
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (filterStatus && p.status !== filterStatus) return false
      if (filterCliente && p.cliente_id !== filterCliente) return false
      return true
    })
  }, [posts, filterStatus, filterCliente])

  // Agrupar por mês
  const postsByMonth = useMemo(() => {
    const grouped = {}
    filteredPosts.forEach((p) => {
      const key = format(parseISO(p.data_agendada), 'yyyy-MM')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(p)
    })
    return grouped
  }, [filteredPosts])

  // ─── Bulk create ───
  const handleBulkCreate = async () => {
    if (!formClienteId || !formDataInicio || !formDataFim || formRedes.length === 0 || formDiasSemana.length === 0) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    setBulkLoading(true)
    try {
      const clienteNome = clientes.find((c) => c.id === formClienteId)?.nome || ''
      const start = parseISO(formDataInicio)
      const end = parseISO(formDataFim)

      if (start > end) {
        alert('A Data de Início deve ser anterior à Data Fim.')
        setBulkLoading(false)
        return
      }

      const allDays = eachDayOfInterval({ start, end })
      const selectedDays = allDays.filter((d) => formDiasSemana.includes(getDay(d)))

      if (selectedDays.length === 0) {
        alert('Nenhum dia corresponde à seleção de dias da semana no período escolhido.')
        setBulkLoading(false)
        return
      }

      const records = []
      selectedDays.forEach((day) => {
        formRedes.forEach((rede) => {
          const [hours, mins] = formHorario.split(':')
          const dataAgendada = new Date(day)
          dataAgendada.setHours(parseInt(hours), parseInt(mins), 0, 0)

          records.push({
            cliente_id: formClienteId,
            tipo_post: formTipoPost,
            rede_social: [rede],
            data_agendada: dataAgendada.toISOString(),
            responsavel_id: formResponsavelId || null,
            status: 'Planejado',
            titulo: `[${rede}] ${formTipoPost} - ${clienteNome}`,
            legenda: null,
            link_midia: null,
          })
        })
      })

      const { error } = await supabase.from('cronograma_posts').insert(records)
      if (error) throw error

      // Reset form
      setFormClienteId('')
      setFormRedes([])
      setFormTipoPost('Reel')
      setFormResponsavelId('')
      setFormHorario('10:00')
      setFormDataInicio('')
      setFormDataFim('')
      setFormDiasSemana([1, 3, 5])
      setShowForm(false)
      refetchPosts()
    } catch (err) {
      alert('Erro ao criar planejamento: ' + err.message)
    } finally {
      setBulkLoading(false)
    }
  }

  // ─── Delete post ───
  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir esta postagem?')) return
    const { error } = await supabase.from('cronograma_posts').delete().eq('id', id)
    if (error) alert('Erro ao excluir: ' + error.message)
    else refetchPosts()
  }

  // ─── Toggle rede social ───
  const toggleRede = (rede) => {
    setFormRedes((prev) =>
      prev.includes(rede) ? prev.filter((r) => r !== rede) : [...prev, rede]
    )
  }

  // ─── Toggle dia da semana ───
  const toggleDia = (dia) => {
    setFormDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    )
  }

  if (loadingPosts) return <LoadingSpinner />

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Share2 size={20} className="text-primary-light" />
          <h1 className="text-xl font-bold text-white">Agenda de Conteúdo</h1>
          <span className="text-xs text-gray-500 ml-1">• {filteredPosts.length} posts</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-700 bg-surface-light px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
          >
            <option value="">Todos os status</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {/* Filtro Cliente */}
          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="rounded-lg border border-gray-700 bg-surface-light px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
          >
            <option value="">Todos os clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
            <span className="hidden sm:inline">{showForm ? 'Fechar' : 'Novo Planejamento Mensal'}</span>
          </Button>
        </div>
      </div>

      {/* ─── Formulário Expansível (Bulk) ─── */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          showForm ? 'max-h-[800px] opacity-100 mb-6' : 'max-h-0 opacity-0'
        )}
      >
        <div className="rounded-xl border border-gray-800 bg-surface p-6">
          <h3 className="text-base font-semibold text-white mb-4">+ Novo Planejamento Mensal</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cliente */}
            <Select
              label="Cliente *"
              value={formClienteId}
              onChange={(e) => setFormClienteId(e.target.value)}
            >
              <option value="">Selecionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </Select>

            {/* Tipo de Post */}
            <Select
              label="Tipo de Post"
              value={formTipoPost}
              onChange={(e) => setFormTipoPost(e.target.value)}
            >
              {TIPOS_POST.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>

            {/* Responsável */}
            <Select
              label="Responsável"
              value={formResponsavelId}
              onChange={(e) => setFormResponsavelId(e.target.value)}
            >
              <option value="">Selecionar...</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </Select>

            {/* Horário Padrão */}
            <Input
              label="Horário Padrão"
              type="time"
              value={formHorario}
              onChange={(e) => setFormHorario(e.target.value)}
            />

            {/* Data Início */}
            <Input
              label="Data Início *"
              type="date"
              value={formDataInicio}
              onChange={(e) => setFormDataInicio(e.target.value)}
            />

            {/* Data Fim */}
            <Input
              label="Data Fim *"
              type="date"
              value={formDataFim}
              onChange={(e) => setFormDataFim(e.target.value)}
            />
          </div>

          {/* Redes Sociais */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Redes Sociais *</label>
            <div className="flex flex-wrap gap-2">
              {REDES_SOCIAIS.map((rede) => (
                <button
                  key={rede}
                  type="button"
                  onClick={() => toggleRede(rede)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                    formRedes.includes(rede)
                      ? 'bg-primary/20 border-primary text-primary-light'
                      : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  )}
                >
                  {rede}
                </button>
              ))}
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Dias da Semana *</label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.key}
                  type="button"
                  onClick={() => toggleDia(dia.key)}
                  className={cn(
                    'w-11 h-11 rounded-lg text-xs font-semibold border transition-colors cursor-pointer',
                    formDiasSemana.includes(dia.key)
                      ? 'bg-primary/20 border-primary text-primary-light'
                      : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  )}
                >
                  {dia.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview + Ações */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-4 border-t border-gray-800 gap-4">
            <div className="text-xs text-gray-500">
              {formDataInicio && formDataFim && formDiasSemana.length > 0 && formRedes.length > 0 ? (
                (() => {
                  try {
                    const start = parseISO(formDataInicio)
                    const end = parseISO(formDataFim)
                    if (start > end) return 'Datas inválidas'
                    const allDays = eachDayOfInterval({ start, end })
                    const count = allDays.filter((d) => formDiasSemana.includes(getDay(d))).length
                    return `Serão criados ${count * formRedes.length} posts (${count} dias × ${formRedes.length} rede${formRedes.length > 1 ? 's' : ''})`
                  } catch {
                    return ''
                  }
                })()
              ) : (
                'Preencha os campos para ver o preview'
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)} size="sm">
                Cancelar
              </Button>
              <Button onClick={handleBulkCreate} disabled={bulkLoading} size="sm">
                {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {bulkLoading ? 'Criando...' : 'Gerar Planejamento'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Lista de Posts agrupada por mês ─── */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {Object.keys(postsByMonth).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Share2 size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400">Nenhuma postagem agendada</h3>
            <p className="text-sm text-gray-500 mt-1">Crie um planejamento mensal para começar</p>
          </div>
        ) : (
          Object.entries(postsByMonth).map(([monthKey, monthPosts]) => (
            <div key={monthKey}>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-gray-950 py-1 z-10">
                {format(parseISO(monthKey + '-01'), 'MMMM yyyy', { locale: ptBR })}
                <span className="text-gray-600 ml-2">({monthPosts.length})</span>
              </h3>
              <div className="grid gap-2">
                {monthPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onEdit={() => setEditingPost(post)}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Modal Edição Individual ─── */}
      {editingPost && (
        <PostEditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            refetchPosts()
            setEditingPost(null)
          }}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   POST CARD
   ───────────────────────────────────────── */
function PostCard({ post, onEdit, onDelete }) {
  const dataFormatada = format(parseISO(post.data_agendada), "EEE, dd/MM 'às' HH:mm", { locale: ptBR })
  const statusColor = STATUS_COLORS[post.status] || '#6366f1'
  const redeSocial = post.rede_social?.[0] || ''

  return (
    <div
      className={cn(
        'group rounded-lg border p-3 transition-all hover:border-gray-600 cursor-pointer',
        post.status === 'Planejado'
          ? 'border-dashed border-gray-700 bg-surface'
          : 'border-gray-800 bg-surface'
      )}
      style={post.status !== 'Planejado' ? { borderLeftColor: statusColor, borderLeftWidth: '3px' } : {}}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Título */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white truncate">
              {post.titulo || `[${redeSocial}] Post`}
            </span>
          </div>

          {/* Cliente em destaque */}
          {post.clientes?.nome && (
            <p className="text-xs font-semibold text-primary-light mb-1.5">
              {post.clientes.nome}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="capitalize">{dataFormatada}</span>
            <Badge color={statusColor}>{post.status}</Badge>
            {redeSocial && (
              <Badge color="#e1306c">
                {redeSocial}
              </Badge>
            )}
            <Badge color="#8b5cf6">{post.tipo_post}</Badge>
            {post.funcionarios?.nome && (
              <span className="text-gray-500">• {post.funcionarios.nome}</span>
            )}
          </div>

          {/* Legenda preview */}
          {post.legenda && (
            <p className="text-xs text-gray-500 mt-1.5 truncate italic">
              {post.legenda}
            </p>
          )}

          {/* Link de mídia */}
          {post.link_midia && (
            <a
              href={post.link_midia}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-light hover:text-primary mt-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} />
              Ver mídia
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="rounded p-1.5 text-gray-500 hover:text-white hover:bg-surface-light transition-colors cursor-pointer"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="rounded p-1.5 text-gray-500 hover:text-red-400 hover:bg-surface-light transition-colors cursor-pointer"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   POST EDIT MODAL
   ───────────────────────────────────────── */
function PostEditModal({ post, onClose, onSaved }) {
  const [legenda, setLegenda] = useState(post.legenda || '')
  const [linkMidia, setLinkMidia] = useState(post.link_midia || '')
  const [status, setStatus] = useState(post.status || 'Planejado')
  const [tipoPost, setTipoPost] = useState(post.tipo_post || 'Reel')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('cronograma_posts')
        .update({
          legenda,
          link_midia: linkMidia || null,
          status,
          tipo_post: tipoPost,
        })
        .eq('id', post.id)

      if (error) throw error
      onSaved()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Editar Postagem" size="md">
      <div className="space-y-4">
        {/* Info fixa */}
        <div className="rounded-lg bg-surface-light p-3 space-y-1">
          <p className="text-sm font-semibold text-white">{post.titulo}</p>
          {post.clientes?.nome && (
            <p className="text-xs text-primary-light font-medium">{post.clientes.nome}</p>
          )}
          <p className="text-xs text-gray-400">
            {format(parseISO(post.data_agendada), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Tipo de Post */}
        <Select
          label="Tipo de Post"
          value={tipoPost}
          onChange={(e) => setTipoPost(e.target.value)}
        >
          {TIPOS_POST.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_LIST.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                  status === s
                    ? 'border-transparent text-white'
                    : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                )}
                style={
                  status === s
                    ? { backgroundColor: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] }
                    : {}
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Legenda (Copy) */}
        <Textarea
          label="Legenda (Copy)"
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder="Escreva a legenda do post..."
          rows={5}
        />

        {/* Link da Mídia */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">Link da Mídia</label>
          <input
            type="url"
            value={linkMidia}
            onChange={(e) => setLinkMidia(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-lg border border-gray-700 bg-surface-light px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
          {linkMidia && (
            <a
              href={linkMidia}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-light hover:text-primary mt-1 transition-colors"
            >
              <ExternalLink size={12} />
              Abrir link da mídia
            </a>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
          <Button variant="secondary" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
