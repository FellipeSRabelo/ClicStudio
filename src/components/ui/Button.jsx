import { cn } from '../../lib/utils'

export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const variants = {
    primary: 'bg-primary hover:bg-primary-light text-white',
    secondary: 'bg-surface-light hover:bg-surface-lighter text-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-surface-light text-gray-300',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
