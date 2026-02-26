import { differenceInHours, differenceInMilliseconds, formatDistanceToNow, isPast } from 'date-fns'
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
 * Calcula a porcentagem da barra de progresso temporal
 * @param {string|Date} createdAt - data de criação da tarefa
 * @param {string|Date} deadline - data do deadline
 * @param {boolean} realizado - se a tarefa foi concluída
 * @returns {{ percent: number, colorClass: string }}
 */
export function getProgressBar(createdAt, deadline, realizado = false) {
  if (!deadline || !createdAt) return { percent: 0, colorClass: 'bg-slate-500/50' }
  if (realizado) return { percent: 100, colorClass: 'bg-green-500' }

  const now = new Date()
  const start = new Date(createdAt)
  const end = new Date(deadline)

  const totalMs = differenceInMilliseconds(end, start)
  const elapsedMs = differenceInMilliseconds(now, start)

  if (totalMs <= 0) return { percent: 100, colorClass: 'bg-red-600' }

  const percent = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100))

  let colorClass = 'bg-slate-500'
  if (percent >= 80) colorClass = 'bg-red-600'
  else if (percent >= 50) colorClass = 'bg-yellow-500'

  return { percent: Math.round(percent), colorClass }
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
