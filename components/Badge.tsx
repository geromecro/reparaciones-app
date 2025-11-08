import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
  className?: string
}

export default function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-primary-100 text-primary-900',
    success: 'bg-accent-50 text-accent-700 border border-accent-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-100',
    error: 'bg-error-50 text-error-700 border border-error-200',
    info: 'bg-primary-100 text-primary-800 border border-primary-200',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
