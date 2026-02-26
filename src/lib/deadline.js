import { differenceInHours, formatDistanceToNow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Calcula o status de urgência do deadline
 * @param {string|Date} deadline - data do deadline
 * @param {boolean} realizado - se a tarefa já foi concluída
 * @returns {{ status: 'ok'|'urgent'|'critical'|'done'|null, label: string|null, hoursLeft: number }}
 */
export function getDeadlineStatus(deadline, realizado = false) {
  if (!deadline) return { status: null, label: null, hoursLeft: Infinity }
  if (realizado) return { status: 'done', label: 'Concluída', hoursLeft: Infinity }

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const hoursLeft = differenceInHours(deadlineDate, now)

  if (isPast(deadlineDate) || hoursLeft < 0) {
    return { status: 'critical', label: 'Atrasado', hoursLeft }
  }
  if (hoursLeft < 24) {
    return { status: 'critical', label: 'Crítico', hoursLeft }
  }
  if (hoursLeft < 48) {
    return { status: 'urgent', label: 'Urgente', hoursLeft }
  }
  return { status: 'ok', label: null, hoursLeft }
}

/**
 * Retorna texto amigável de distância temporal
 * @param {string|Date} deadline
 * @returns {string|null}
 */
export function getDeadlineText(deadline) {
  if (!deadline) return null
  try {
    return formatDistanceToNow(new Date(deadline), { addSuffix: true, locale: ptBR })
  } catch {
    return null
  }
}

/**
 * Gradiente de 9 tons baseado na % de countdown
 */
const PROGRESS_COLORS = [
  { max: 11, color: '#22c55e' },  // Verde Seguro
  { max: 22, color: '#4ade80' },  // Verde Estável
  { max: 33, color: '#84cc16' },  // Verde Lima
  { max: 44, color: '#eab308' },  // Amarelo Alerta
  { max: 55, color: '#facc15' },  // Amarelo Urgente
  { max: 66, color: '#f97316' },  // Laranja Médio
  { max: 77, color: '#fb923c' },  // Laranja Forte
  { max: 88, color: '#ef4444' },  // Vermelho Crítico
  { max: 101, color: '#b91c1c' }, // Vermelho Vencido
]

function getProgressColor(percent) {
  for (const entry of PROGRESS_COLORS) {
    if (percent < entry.max) return entry.color
  }
  return '#b91c1c'
}

/**
 * Calcula a barra de progresso temporal baseada em Countdown (Janela de Alerta)
 * @param {string|Date} deadline - data do deadline
 * @param {boolean} realizado - se a tarefa foi concluída
 * @param {number} janelaHoras - janela de alerta em horas (default 120 = 5 dias)
 * @returns {{ percent: number, color: string }}
 */
export function getProgressBar(deadline, realizado = false, janelaHoras = 120) {
  if (!deadline) return { percent: 0, color: '#334155' } // slate-700
  if (realizado) return { percent: 100, color: '#22c55e' } // green-500

  const now = new Date()
  const end = new Date(deadline)
  const hoursLeft = differenceInHours(end, now)
  const janela = janelaHoras || 120

  // Atrasado
  if (isPast(end) || hoursLeft < 0) {
    return { percent: 100, color: '#b91c1c' }
  }

  // Fora da janela de alerta
  if (hoursLeft > janela) {
    return { percent: 0, color: '#334155' }
  }

  // Dentro da janela: countdown
  const percent = Math.min(100, Math.max(0, ((janela - hoursLeft) / janela) * 100))
  const color = getProgressColor(percent)

  return { percent: Math.round(percent), color }
}

/**
 * Classifica badges: cores CSS para status
 */
export const DEADLINE_BADGE = {
  urgent: {
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    label: 'Urgente',
  },
  critical: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    pulse: true,
  },
}
