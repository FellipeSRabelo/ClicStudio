import { cn } from '../../lib/utils'

export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <input
        className={cn(
          'w-full rounded-lg border border-gray-700 bg-surface-light px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <select
        className={cn(
          'w-full rounded-lg border border-gray-700 bg-surface-light px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-lg border border-gray-700 bg-surface-light px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none',
          error && 'border-red-500',
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Checkbox({ label, className, ...props }) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-600 bg-surface-light text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
        {...props}
      />
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  )
}
