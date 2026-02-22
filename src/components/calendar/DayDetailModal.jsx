import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus, Edit2, Clock, MapPin, User, CheckCircle2,
  Camera, Video, Image, Film, Briefcase, Users, Package, CalendarDays, Star, Heart,
  ExternalLink, MessageCircle, Navigation,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Card'

const LUCIDE_ICONS = { Camera, Video, Image, Film, Briefcase, Users, Package, CalendarDays, Star, Heart }
const ICON_KEY_MAP = { camera: 'Camera', video: 'Video', image: 'Image', film: 'Film', briefcase: 'Briefcase', users: 'Users', package: 'Package', calendar: 'CalendarDays', star: 'Star', heart: 'Heart' }

export function DayDetailModal({ isOpen, onClose, day, tarefas = [], tiposTarefa = [], funcionarios = [], onEdit, onNew }) {
  if (!day) return null

  const getTypeName = (id) => tiposTarefa.find((t) => t.id === id)?.nome || 'Sem tipo'
  const getTypeColor = (id) => tiposTarefa.find((t) => t.id === id)?.cor || '#5d109c'
  const getTypeIcon = (id) => {
    const tipo = tiposTarefa.find((t) => t.id === id)
    const iconName = ICON_KEY_MAP[tipo?.icone] || 'Camera'
    return LUCIDE_ICONS[iconName] || Camera
  }
  const getFuncName = (id) => funcionarios.find((f) => f.id === id)?.nome || 'Sem responsável'

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
                  className="rounded-lg border border-gray-800 p-3 hover:border-gray-700 transition-colors group"
                  style={{ borderLeftColor: getTypeColor(tarefa.tipo_tarefa_id), borderLeftWidth: '3px' }}
                >
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
                          <span className="text-xs font-semibold text-primary-light">
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
                          <Navigation size={10} className="text-gray-600" />
                        </div>
                      )}

                      {/* Link da Galeria */}
                      {tarefa.link_galeria && (
                        <div className="flex items-center gap-1.5 ml-6 mt-1.5 text-xs">
                          <ExternalLink size={12} className="text-primary-light shrink-0" />
                          <a
                            href={tarefa.link_galeria}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-light hover:text-white transition-colors underline underline-offset-2 decoration-primary/40 hover:decoration-white truncate"
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
    </Modal>
  )
}
