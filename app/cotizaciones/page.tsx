'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/format'

interface Cotizacion {
  id: number
  valorizacion: {
    id: number
    reparacion: {
      equipo: {
        cliente: {
          nombre: string
        }
        descripcion: string
      }
    }
    subtotal: number
  }
  importeOriginal: number
  ajustePablo: number
  importeFinal: number
  estado: string
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [ajusteModal, setAjusteModal] = useState({
    visible: false,
    cotizacionId: 0,
    ajuste: 0
  })

  useEffect(() => {
    fetchCotizaciones()
  }, [])

  const fetchCotizaciones = async () => {
    try {
      const res = await fetch('/api/cotizaciones?estado=PENDIENTE')
      const data = await res.json()
      setCotizaciones(data)
    } catch (error) {
      console.error('Error fetching cotizaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCotizacion = async (cotizacionId: number, nuevoAjuste: number) => {
    try {
      const cotizacion = cotizaciones.find(c => c.id === cotizacionId)
      if (!cotizacion) return

      const res = await fetch('/api/cotizaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cotizacionId,
          estado: 'COMPLETADA',
          ajustePablo: nuevoAjuste
        })
      })

      if (res.ok) {
        setAjusteModal({ visible: false, cotizacionId: 0, ajuste: 0 })
        fetchCotizaciones()
      }
    } catch (error) {
      console.error('Error updating cotizacion:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cotizaciones Pendientes
            </h1>
            <p className="text-gray-600">
              Total: {cotizaciones.length} reparaciones pendientes de cotizar
            </p>
          </div>
          <Link
            href="/"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Volver
          </Link>
        </div>

        {/* Cotizaciones List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              Cargando cotizaciones...
            </div>
          ) : cotizaciones.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No hay cotizaciones pendientes
            </div>
          ) : (
            <div className="divide-y">
              {cotizaciones.map(cot => (
                <div
                  key={cot.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedId(selectedId === cot.id ? null : cot.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cot.valorizacion.reparacion.equipo.cliente.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {cot.valorizacion.reparacion.equipo.descripcion}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </div>

                  {selectedId === cot.id && (
                    <div className="bg-gray-50 p-6 rounded-lg mt-4">
                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <div>
                          <p className="text-gray-600 text-sm">Costo Original</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${formatCurrency(cot.importeOriginal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Ajuste Actual</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${formatCurrency(cot.ajustePablo)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Total Final</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${formatCurrency(cot.importeFinal)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <button
                          onClick={() => setAjusteModal({
                            visible: true,
                            cotizacionId: cot.id,
                            ajuste: cot.ajustePablo
                          })}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-2"
                        >
                          Ajustar Cotización
                        </button>
                        <button
                          onClick={() => updateCotizacion(cot.id, cot.ajustePablo)}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Completar Cotización
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ajuste Modal */}
      {ajusteModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Ajustar Cotización
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajuste a Aplicar (P de Pablo)
              </label>
              <input
                type="number"
                value={ajusteModal.ajuste}
                onChange={(e) => setAjusteModal({...ajusteModal, ajuste: parseFloat(e.target.value) || 0})}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 mt-2">
                Ingresa un valor positivo o negativo para ajustar el precio
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setAjusteModal({ visible: false, cotizacionId: 0, ajuste: 0 })}
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateCotizacion(ajusteModal.cotizacionId, ajusteModal.ajuste)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
