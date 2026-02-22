import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full mx-4 rounded-xl bg-surface border border-gray-800 shadow-2xl animate-fade-in',
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-surface-light hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
