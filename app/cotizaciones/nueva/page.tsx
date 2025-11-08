'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Valorizacion {
  id: number
  subtotal: number
  costoRepuestos: number
  importeManoObra: number
  reparacion: {
    equipo: {
      cliente: {
        nombre: string
      }
      descripcion: string
    }
  }
}

function NuevaCotizacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const valorizacionId = searchParams.get('valorizacionId')

  const [valorizacion, setValorizacion] = useState<Valorizacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [ajustePablo, setAjustePablo] = useState(0)

  useEffect(() => {
    if (!valorizacionId) {
      setError('No se especificó valorizacionId')
      setLoading(false)
      return
    }

    fetchValorizacion()
  }, [valorizacionId])

  const fetchValorizacion = async () => {
    try {
      const res = await fetch(`/api/valorizaciones/${valorizacionId}`)
      if (!res.ok) {
        setError('Valorización no encontrada')
        setLoading(false)
        return
      }
      const data = await res.json()
      setValorizacion(data)
    } catch (err) {
      console.error('Error fetching valorizacion:', err)
      setError('Error al cargar la valorización')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!valorizacion) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valorizacionId: valorizacion.id,
          ajustePablo: parseFloat(ajustePablo.toString())
        })
      })

      if (res.ok) {
        router.push('/cotizaciones')
      } else {
        setError('Error al crear la cotización')
      }
    } catch (err) {
      console.error('Error creating cotizacion:', err)
      setError('Error al crear la cotización')
    } finally {
      setSubmitting(false)
    }
  }

  const importeFinal = valorizacion ? valorizacion.subtotal + ajustePablo : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (error || !valorizacion) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Valorización no encontrada'}</p>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-900">
              ← Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nueva Cotización
          </h1>
          <p className="text-gray-600">
            {valorizacion.reparacion.equipo.cliente.nombre} - {valorizacion.reparacion.equipo.descripcion}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Resumen de Costos</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Repuestos</span>
                  <span className="font-semibold text-gray-900">${valorizacion.costoRepuestos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mano de Obra</span>
                  <span className="font-semibold text-gray-900">${valorizacion.importeManoObra.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span className="text-gray-900">Subtotal</span>
                  <span className="text-blue-600">${valorizacion.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ajuste Pablo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajuste de Precio (P de Pablo)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Ingresa un valor positivo para aumentar o negativo para disminuir el precio
              </p>
              <input
                type="number"
                value={ajustePablo}
                onChange={(e) => setAjustePablo(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Final Price */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Precio Final</h3>
              <div className="text-4xl font-bold text-green-600">
                ${importeFinal.toFixed(2)}
              </div>
              {ajustePablo !== 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Ajuste: {ajustePablo > 0 ? '+' : ''} ${ajustePablo.toFixed(2)}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Creando...' : 'Crear Cotización'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NuevaCotizacion() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center"><p className="text-gray-600">Cargando...</p></div>}>
      <NuevaCotizacionContent />
    </Suspense>
  )
}
