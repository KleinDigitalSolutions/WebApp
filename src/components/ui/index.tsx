import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  label?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export function ProgressBar({ value, max, className, label, color = 'primary' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colorClasses = {
    primary: 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600',
    success: 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500',
    warning: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
    danger: 'bg-gradient-to-r from-red-500 via-pink-500 to-rose-600',
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-base font-semibold text-gray-900">{label}</span>
          <span className="text-sm font-bold text-white bg-gradient-to-r from-gray-700 to-gray-800 px-3 py-1.5 rounded-full shadow-lg">
            {Math.round(value)}/{Math.round(max)}
          </span>
        </div>
      )}
      <div className="relative">
        <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
          <div
            className={cn(
              'h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden',
              colorClasses[color]
            )}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="absolute inset-0 rounded-full ring-1 ring-black/5"></div>
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size], className)} />
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  className, 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-gray-600 text-gray-300 bg-transparent hover:bg-gray-800 focus:ring-gray-500',
    ghost: 'text-emerald-400 hover:bg-gray-800 focus:ring-emerald-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const isDisabled = disabled || loading

  return (
    <button
      style={{
        transition: 'none',
        transform: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.transition = 'none'
      }}
      className={cn(
        baseClasses, 
        variantClasses[variant], 
        sizeClasses[size], 
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'block w-full rounded-lg border border-gray-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm',
          'text-gray-100 placeholder-gray-500 bg-gray-800',
          'px-3 py-2',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        className={cn(
          'block w-full rounded-lg border border-gray-700 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm',
          'text-gray-100 bg-gray-800',
          'px-3 py-2',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function Card({ children, className, hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-lg',
        hover && 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer',
        gradient && 'bg-gradient-to-br from-white via-slate-50 to-blue-50',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ children, variant = 'primary', size = 'md', className }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
    secondary: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold shadow-lg',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'block w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm',
          'text-gray-900 placeholder-gray-400 bg-white',
          'px-3 py-2 resize-vertical',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
