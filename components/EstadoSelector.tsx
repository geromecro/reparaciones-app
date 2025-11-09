'use client'

import { useState } from 'react'

interface EstadoSelectorProps {
  estadoActual: string
  reparacionId: number
  onEstadoChanged?: (nuevoEstado: string) => void
}

const ESTADOS = [
  { value: 'RECIBIDO', label: 'Recibido', variant: 'default' },
  { value: 'DIAGNOSTICO', label: 'Diagnosticado', variant: 'warning' },
  { value: 'EN_REPARACION', label: 'En reparación', variant: 'warning' },
  { value: 'LISTO_PARA_RETIRO', label: 'Listo para retirar', variant: 'success' },
]

const variantStyles = {
  default: 'bg-blue-100 text-blue-900 border border-blue-200',
  warning: 'bg-amber-100 text-amber-900 border border-amber-200',
  success: 'bg-green-100 text-green-900 border border-green-200',
  info: 'bg-blue-100 text-blue-900 border border-blue-200',
}

export default function EstadoSelector({
  estadoActual,
  reparacionId,
  onEstadoChanged
}: EstadoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const estadoActualInfo = ESTADOS.find(e => e.value === estadoActual)

  const handleEstadoChange = async (nuevoEstado: string) => {
    if (nuevoEstado === estadoActual) {
      setIsOpen(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/reparaciones/${reparacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      if (res.ok) {
        setIsOpen(false)
        if (onEstadoChanged) {
          onEstadoChanged(nuevoEstado)
        }
      } else {
        setError('Error al actualizar el estado')
      }
    } catch (err) {
      console.error('Error changing estado:', err)
      setError('Error al actualizar el estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Estado Badge Button */}
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md ${
          estadoActualInfo ? variantStyles[estadoActualInfo.variant as keyof typeof variantStyles] : 'bg-blue-100 text-blue-900 border border-blue-200'
        }`}
      >
        {loading ? 'Actualizando...' : estadoActualInfo?.label || estadoActual}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {ESTADOS.map(estado => (
              <button
                key={estado.value}
                onClick={() => handleEstadoChange(estado.value)}
                disabled={loading}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                  estadoActual === estado.value ? 'bg-gray-50 font-semibold' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variantStyles[estado.variant as keyof typeof variantStyles]}`}>
                      {estado.label}
                    </span>
                  </div>
                  {estadoActual === estado.value && (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
