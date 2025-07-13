'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface NativeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'floating' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  isLoading?: boolean
}

export const NativeButton = forwardRef<HTMLButtonElement, NativeButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading = false, ...props }, ref) => {
    const variants = {
      default: 'bg-neutral-900 text-white hover:bg-neutral-800',
      floating: 'bg-white shadow-lg hover:shadow-xl',
      outline: 'border border-neutral-200 hover:bg-neutral-50',
      ghost: 'hover:bg-neutral-100'
    }

    const sizes = {
      default: 'h-12 px-6',
      sm: 'h-10 px-4',
      lg: 'h-14 px-8'
    }

    return (
      <button
        ref={ref}
        disabled={isLoading}
        className={cn(
          'relative rounded-xl font-medium transition-all duration-200',
          variants[variant],
          sizes[size],
          isLoading && 'opacity-70 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className={cn(isLoading && 'opacity-0')}>
          {props.children}
        </div>
      </button>
    )
  }
)

NativeButton.displayName = 'NativeButton' 