'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn.utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  endAdornment?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, endAdornment, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-10 w-full rounded-xl border border-border bg-white px-3 text-base text-gray-900',
            'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            endAdornment && 'pr-12',
            error && 'border-error focus:ring-error',
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  ),
)

Input.displayName = 'Input'
