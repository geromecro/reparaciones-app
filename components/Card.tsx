import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'flat'
}

export default function Card({
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  const variantStyles = {
    default: 'bg-white rounded-lg border border-primary-200 shadow-sm',
    elevated: 'bg-white rounded-lg border border-primary-200 shadow-md',
    flat: 'bg-white rounded-lg',
  }

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-primary-200 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-primary-200 ${className}`}>
      {children}
    </div>
  )
}
