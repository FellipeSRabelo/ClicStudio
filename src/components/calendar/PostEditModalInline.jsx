import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ExternalLink, Loader2, Instagram } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select, Textarea } from '../ui/Input'
import { Badge } from '../ui/Card'
import { cn } from '../../lib/utils'

const STATUS_LIST = ['Planejado', 'Em Produção', 'Aprovado', 'Postado']
const STATUS_COLORS = {
  'Planejado': '#6366f1',
  'Em Produção': '#f59e0b',
  'Aprovado': '#22c55e',
  'Postado': '#06b6d4',
}

export function PostEditModalInline({ post, onClose, onSaved }) {
  const [legenda, setLegenda] = useState(post.legenda || '')
  const [linkMidia, setLinkMidia] = useState(post.link_midia || '')
  const [status, setStatus] = useState(post.status || 'Planejado')
  const [tipoPost, setTipoPost] = useState(post.tipo_post || 'Reel')
  const [saving, setSaving] = useState(false)
  const [tiposPost, setTiposPost] = useState([])

  useEffect(() => {
    supabase
      .from('tipos_post')
      .select('nome')
      .eq('ativo', true)
      .order('nome')
      .then(({ data }) => {
        if (data) setTiposPost(data.map((t) => t.nome))
      })
  }, [])

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
          <div className="flex items-center gap-2">
            <Instagram size={16} className="text-pink-400 shrink-0" />
            <p className="text-sm font-semibold text-white">{post.titulo}</p>
          </div>
          {post.clientes?.nome && (
            <p className="text-xs text-primary-light font-medium">{post.clientes.nome}</p>
          )}
          <p className="text-xs text-gray-400">
            {format(parseISO(post.data_agendada), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {post.rede_social?.map((r) => (
              <Badge key={r} color="#e1306c">{r}</Badge>
            ))}
          </div>
        </div>

        {/* Tipo de Post */}
        <Select
          label="Tipo de Post"
          value={tipoPost}
          onChange={(e) => setTipoPost(e.target.value)}
        >
          {tiposPost.map((t) => (
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
