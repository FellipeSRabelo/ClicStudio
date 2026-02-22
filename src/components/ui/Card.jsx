import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-gray-800 bg-surface p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 16, md: 24, lg: 32 }
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 size={sizes[size]} className="animate-spin text-primary" />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon size={48} className="text-gray-600 mb-4" />}
      <h3 className="text-lg font-medium text-gray-400">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Badge({ children, color = '#5d109c', className }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: `${color}22`, color }}
    >
      {children}
    </span>
  )
}

export function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-surface-light">
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left font-medium text-gray-400">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">{children}</tbody>
      </table>
    </div>
  )
}
