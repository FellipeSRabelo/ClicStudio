import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(time) {
  if (!time) return ''
  return time.slice(0, 5)
}

export const TASK_COLORS = {
  default: '#5d109c',
}

// Mapa de ícone string -> nome do componente Lucide
export const ICON_MAP = {
  camera: 'Camera',
  video: 'Video',
  image: 'Image',
  film: 'Film',
  briefcase: 'Briefcase',
  users: 'Users',
  package: 'Package',
  calendar: 'CalendarDays',
  star: 'Star',
  heart: 'Heart',
}
