import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus, Edit2, Clock, MapPin, User, CheckCircle2,
  Camera, Video, Image, Film, Briefcase, Users, Package, CalendarDays, Star, Heart,
  ExternalLink, MessageCircle, Navigation, Instagram, AlertTriangle,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Card'
import { getDeadlineStatus, getDeadlineText, getProgressBar, DEADLINE_BADGE } from '../../lib/deadline'

const LUCIDE_ICONS = { Camera, Video, Image, Film, Briefcase, Users, Package, CalendarDays, Star, Heart }
const ICON_KEY_MAP = { camera: 'Camera', video: 'Video', image: 'Image', film: 'Film', briefcase: 'Briefcase', users: 'Users', package: 'Package', calendar: 'CalendarDays', star: 'Star', heart: 'Heart' }

export function DayDetailModal({ isOpen, onClose, day, tarefas = [], cronogramaPosts = [], tiposTarefa = [], funcionarios = [], onEdit, onNew, onEditPost }) {
  if (!day) return null

  const getTypeName = (id) => tiposTarefa.find((t) => t.id === id)?.nome || 'Sem tipo'
  const getTypeColor = (id) => tiposTarefa.find((t) => t.id === id)?.cor || '#5d109c'
  const getTypeIcon = (id) => {
    const tipo = tiposTarefa.find((t) => t.id === id)
    const iconName = ICON_KEY_MAP[tipo?.icone] || 'Camera'
    return LUCIDE_ICONS[iconName] || Camera
  }
  const getFuncName = (id) => funcionarios.find((f) => f.id === id)?.nome || 'Sem responsável'
  const getFuncPhone = (id) => {
    const f = funcionarios.find((f) => f.id === id)
    return f?.telefone ? f.telefone.replace(/\D/g, '') : null
  }

  const buildWhatsAppReminder = (tarefa) => {
    const dataFormatada = format(day, "dd/MM/yyyy (EEEE)", { locale: ptBR })
    const horario = tarefa.hora_inicio
      ? `${tarefa.hora_inicio.slice(0, 5)}${tarefa.hora_fim ? ' às ' + tarefa.hora_fim.slice(0, 5) : ''}`
      : 'Horário a definir'
    const tipo = getTypeName(tarefa.tipo_tarefa_id)
    const cliente = tarefa.clientes?.nome || ''
    const local = tarefa.local || ''

    let msg = `📋 *Lembrete ClicStudio*\n\n`
    msg += `*${tarefa.descricao}*\n`
    msg += `📅 ${dataFormatada}\n`
    msg += `⏰ ${horario}\n`
    msg += `🏷️ ${tipo}\n`
    if (cliente) msg += `👤 Cliente: ${cliente}\n`
    if (local) msg += `📍 Local: ${local}\n`
    if (tarefa.observacoes) msg += `\n📝 ${tarefa.observacoes}\n`

    return encodeURIComponent(msg)
  }

  const formatPhone = (phone) => {
    if (!phone) return null
    return phone.replace(/\D/g, '')
  }

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
            .map((tarefa) => {
              const TypeIcon = getTypeIcon(tarefa.tipo_tarefa_id)
              const clienteNome = tarefa.clientes?.nome
              const clienteTelefone = formatPhone(tarefa.clientes?.telefone)

              return (
                <div
                  key={tarefa.id}
                  className="rounded-lg border border-gray-800 p-3 hover:border-gray-700 transition-colors group relative overflow-hidden"
                  style={{ borderLeftColor: getTypeColor(tarefa.tipo_tarefa_id), borderLeftWidth: '3px' }}
                >
                  {/* Barra de progresso deadline */}
                  {(() => {
                    if (!tarefa.deadline_entrega) return null
                    const bar = getProgressBar(tarefa.deadline_entrega, tarefa.realizado, tarefa.janela_alerta_horas)
                    return (
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-800/40">
                        <div className="h-full transition-all" style={{ width: `${bar.percent}%`, backgroundColor: bar.color }} />
                      </div>
                    )
                  })()}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Título + ícone */}
                      <div className="flex items-center gap-2 mb-1">
                        {tarefa.realizado ? (
                          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        ) : (
                          <TypeIcon size={16} className="shrink-0" style={{ color: getTypeColor(tarefa.tipo_tarefa_id) }} />
                        )}
                        <span className={`text-sm font-medium ${tarefa.realizado ? 'line-through text-gray-500' : 'text-white'}`}>
                          {tarefa.descricao}
                        </span>
                      </div>

                      {/* Cliente em destaque */}
                      {clienteNome && (
                        <div className="flex items-center gap-2 ml-6 mb-1.5">
                          <span className="text-xs font-semibold text-gray-300">
                            {clienteNome}
                          </span>
                          {clienteTelefone && (
                            <a
                              href={`https://wa.me/55${clienteTelefone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400 transition-colors"
                              title="Abrir WhatsApp"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle size={12} />
                              <span>{tarefa.clientes?.telefone}</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Badges e info */}
                      <div className="flex flex-wrap items-center gap-3 ml-6 text-xs text-gray-400">
                        <Badge color={getTypeColor(tarefa.tipo_tarefa_id)}>
                          {getTypeName(tarefa.tipo_tarefa_id)}
                        </Badge>
                        {/* Deadline badge */}
                        {(() => {
                          if (!tarefa.deadline_entrega) return null
                          const dl = getDeadlineStatus(tarefa.deadline_entrega, tarefa.realizado)
                          const dlText = getDeadlineText(tarefa.deadline_entrega)
                          const badgeStyle = dl.status === 'critical' ? DEADLINE_BADGE.critical : dl.status === 'urgent' ? DEADLINE_BADGE.urgent : null
                          return (
                            <>
                              {badgeStyle && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} ${badgeStyle.pulse ? 'animate-pulse' : ''}`}>
                                  <AlertTriangle size={11} />
                                  {dl.status === 'critical' ? (dl.hoursLeft < 0 ? 'Atrasado' : 'Crítico') : dl.label}
                                </span>
                              )}
                              {dlText && !tarefa.realizado && (
                                <span className={`text-xs ${dl.status === 'critical' ? 'text-red-400' : dl.status === 'urgent' ? 'text-yellow-400' : 'text-gray-500'}`}>
                                  Deadline {dlText}
                                </span>
                              )}
                            </>
                          )
                        })()}
                        {tarefa.hora_inicio && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {tarefa.hora_inicio?.slice(0, 5)}
                            {tarefa.hora_fim && ` - ${tarefa.hora_fim?.slice(0, 5)}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {(() => {
                            const funcNome = getFuncName(tarefa.funcionario_id)
                            const funcPhone = getFuncPhone(tarefa.funcionario_id)
                            if (funcPhone) {
                              return (
                                <a
                                  href={`https://wa.me/55${funcPhone}?text=${buildWhatsAppReminder(tarefa)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-300 hover:text-green-400 transition-colors"
                                  title="Enviar lembrete pelo WhatsApp"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {funcNome}
                                </a>
                              )
                            }
                            return funcNome
                          })()}
                        </span>
                      </div>

                      {/* Local com link do Google Maps */}
                      {tarefa.local && (
                        <div className="flex items-center gap-1.5 ml-6 mt-1.5 text-xs text-gray-400">
                          <MapPin size={12} className="shrink-0" />
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(tarefa.local)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors underline underline-offset-2 decoration-gray-600 hover:decoration-white"
                            title="Abrir no Google Maps"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tarefa.local}
                          </a>
                        </div>
                      )}

                      {/* Link da Galeria */}
                      {tarefa.link_galeria && (
                        <div className="flex items-center gap-1.5 ml-6 mt-1.5 text-xs">
                          <ExternalLink size={12} className="text-gray-400 shrink-0" />
                          <a
                            href={tarefa.link_galeria}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white transition-colors underline underline-offset-2 decoration-gray-600 hover:decoration-white truncate"
                            title="Abrir galeria"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Galeria / Entrega
                          </a>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onEdit(tarefa)}
                      className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-500 hover:text-white hover:bg-surface-light transition-all cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <Button onClick={onNew} variant="outline" className="w-full">
          <Plus size={16} />
          Nova tarefa neste dia
        </Button>
      </div>

      {/* Cronograma Posts do dia */}
      {cronogramaPosts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Instagram size={14} className="text-pink-400" />
            Conteúdo Agendado ({cronogramaPosts.length})
          </h4>
          <div className="space-y-2">
            {cronogramaPosts.map((post) => {
              const statusColors = { 'Planejado': '#6366f1', 'Em Produção': '#f59e0b', 'Aprovado': '#22c55e', 'Postado': '#06b6d4' }
              const sColor = statusColors[post.status] || '#6366f1'
              return (
                <div
                  key={post.id}
                  className="rounded-lg border border-dashed border-gray-700 p-3 hover:border-gray-600 transition-colors group cursor-pointer"
                  style={{ borderLeftColor: sColor, borderLeftWidth: '3px', borderLeftStyle: 'solid' }}
                  onClick={() => onEditPost?.(post)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{post.titulo || 'Post agendado'}</p>
                      {post.clientes?.nome && (
                        <p className="text-xs font-semibold text-primary-light mt-0.5">{post.clientes.nome}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <Badge color={sColor}>{post.status}</Badge>
                        {post.rede_social?.map((r) => (
                          <Badge key={r} color="#e1306c">{r}</Badge>
                        ))}
                        <Badge color="#8b5cf6">{post.tipo_post}</Badge>
                      </div>
                      {post.legenda && (
                        <p className="text-xs text-gray-500 mt-1.5 truncate italic">{post.legenda}</p>
                      )}
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
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditPost?.(post) }}
                      className="opacity-0 group-hover:opacity-100 rounded p-1 text-gray-500 hover:text-white hover:bg-surface-light transition-all cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}
