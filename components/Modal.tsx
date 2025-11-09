'use client'

import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '28rem',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.5rem'
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
          {title}
        </h3>
        {children}
      </div>
    </div>,
    document.body
  )
}
