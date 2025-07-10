'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

// Modern Glass Card Component
interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  gradient?: boolean
}

export function GlassCard({ children, className, onClick, hover = true, gradient = false }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/80 backdrop-blur-xl border border-white/20',
        'shadow-lg shadow-black/5',
        hover && 'hover:shadow-xl hover:shadow-black/10 transition-all duration-300',
        gradient && 'bg-gradient-to-br from-white/90 to-white/70',
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  )
}

// Modern Button Component
interface ModernButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

export function ModernButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  onClick, 
  disabled, 
  loading 
}: ModernButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-lg shadow-primary-500/25',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-500',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  }

  return (
    <motion.button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  )
}

// Modern Input Component
interface ModernInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: string
  error?: string
  icon?: ReactNode
  className?: string
}

export function ModernInput({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text', 
  error, 
  icon, 
  className 
}: ModernInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-secondary-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-4 rounded-2xl border-2 border-secondary-200',
            'bg-white/80 backdrop-blur-sm',
            'text-secondary-900 placeholder-secondary-400',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
            'transition-all duration-200',
            'shadow-sm',
            icon && 'pl-12',
            error && 'border-accent-error focus:border-accent-error focus:ring-accent-error/20',
            className
          )}
        />
      </div>
      {error && (
        <motion.p 
          className="text-sm text-accent-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Modern Progress Bar
interface ModernProgressBarProps {
  value: number
  max: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
  className?: string
}

export function ModernProgressBar({ 
  value, 
  max, 
  label, 
  showPercentage = true, 
  color = 'primary',
  className 
}: ModernProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colors = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
    success: 'bg-gradient-to-r from-accent-success to-green-500',
    warning: 'bg-gradient-to-r from-accent-warning to-orange-500',
    error: 'bg-gradient-to-r from-accent-error to-red-500'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-semibold text-secondary-700">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-secondary-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <div className="w-full h-3 bg-secondary-200 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', colors[color])}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Modern Badge Component
interface ModernBadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ModernBadge({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className 
}: ModernBadgeProps) {
  const variants = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    success: 'bg-accent-success/10 text-accent-success border-accent-success/20',
    warning: 'bg-accent-warning/10 text-accent-warning border-accent-warning/20',
    error: 'bg-accent-error/10 text-accent-error border-accent-error/20',
    info: 'bg-accent-info/10 text-accent-info border-accent-info/20'
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full border',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  )
}

// Modern Loading Spinner
interface ModernSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white'
  className?: string
}

export function ModernSpinner({ size = 'md', color = 'primary', className }: ModernSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  const colors = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  return (
    <motion.div
      className={cn(
        'rounded-full border-2',
        sizes[size],
        colors[color],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}

// Modern Pull to Refresh Indicator
interface PullToRefreshIndicatorProps {
  isRefreshing: boolean
  pullDistance: number
  className?: string
}

export function PullToRefreshIndicator({ 
  isRefreshing, 
  pullDistance, 
  className 
}: PullToRefreshIndicatorProps) {
  return (
    <motion.div
      className={cn(
        'absolute top-0 left-0 right-0 flex justify-center items-center',
        'bg-white/80 backdrop-blur-xl border-b border-secondary-200',
        className
      )}
      style={{ 
        height: pullDistance || (isRefreshing ? 60 : 0),
      }}
      animate={{ 
        height: isRefreshing ? 60 : 0,
        opacity: (pullDistance > 0 || isRefreshing) ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ 
          rotate: isRefreshing ? 360 : pullDistance * 3.6,
        }}
        transition={{ 
          rotate: { 
            duration: isRefreshing ? 1 : 0,
            repeat: isRefreshing ? Infinity : 0,
            ease: "linear"
          }
        }}
      >
        <ModernSpinner size="md" color="primary" />
      </motion.div>
    </motion.div>
  )
}