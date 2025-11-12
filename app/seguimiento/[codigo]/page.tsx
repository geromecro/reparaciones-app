'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Seguimiento {
  equipo: {
    id: number
    descripcion: string
    numeroInterno: string
    fechaRecepcion: string
    cliente: {
      nombre: string
      telefono: string
    }
  }
  reparacion: {
    id: number
    estado: string
    createdAt: string
  }
  historial: Array<{
    id: number
    estadoAnterior: string | null
    estadoNuevo: string
    fechaCambio: string
  }>
}

const estadoLabels: { [key: string]: string } = {
  'RECIBIDO': 'Recibido',
  'PRECINTADO': 'Precintado',
  'ASIGNADO': 'Asignado',
  'DIAGNOSTICO': 'Diagnóstico',
  'EN_REPARACION': 'En reparación',
  'ESPERANDO_REPUESTOS': 'Esperando repuestos',
  'VALORIZADO': 'Valorizado',
  'COTIZADO': 'Cotizado',
  'APROBADO': 'Aprobado',
  'FACTURADO': 'Facturado',
  'LISTO_PARA_RETIRO': 'Listo para retiro',
  'ENTREGADO': 'Entregado',
  'CERRADO': 'Cerrado'
}

const estadoColores: { [key: string]: string } = {
  'RECIBIDO': 'bg-primary-100 text-primary-900',
  'PRECINTADO': 'bg-primary-100 text-primary-900',
  'ASIGNADO': 'bg-primary-100 text-primary-900',
  'DIAGNOSTICO': 'bg-warning-50 text-warning-700 border border-warning-100',
  'EN_REPARACION': 'bg-warning-50 text-warning-700 border border-warning-100',
  'ESPERANDO_REPUESTOS': 'bg-warning-50 text-warning-700 border border-warning-100',
  'VALORIZADO': 'bg-primary-100 text-primary-800 border border-primary-200',
  'COTIZADO': 'bg-primary-100 text-primary-800 border border-primary-200',
  'APROBADO': 'bg-primary-100 text-primary-800 border border-primary-200',
  'FACTURADO': 'bg-accent-50 text-accent-700 border border-accent-200',
  'LISTO_PARA_RETIRO': 'bg-accent-50 text-accent-700 border border-accent-200',
  'ENTREGADO': 'bg-accent-50 text-accent-700 border border-accent-200',
  'CERRADO': 'bg-accent-50 text-accent-700 border border-accent-200'
}

export default function SeguimientoReparacion() {
  const params = useParams()
  const codigo = params.codigo as string
  const [data, setData] = useState<Seguimiento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSeguimiento()
  }, [codigo])

  const fetchSeguimiento = async () => {
    try {
      const res = await fetch(`/api/seguimiento/${codigo}`)
      if (!res.ok) {
        setError('Reparación no encontrada')
        setLoading(false)
        return
      }
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error('Error:', err)
      setError('Error al cargar seguimiento')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-primary-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-primary-600">Cargando seguimiento...</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-primary-50 p-4">
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
            <p className="text-error-600">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-primary-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Seguimiento de Reparación
          </h1>
          <p className="text-primary-600">
            Código: {data.equipo.numeroInterno}
          </p>
        </div>

        {/* Estado Actual */}
        <div className="bg-white rounded-lg border border-primary-200 shadow-sm p-6 mb-8">
          <p className="text-sm text-primary-600 mb-3">Estado Actual</p>
          <div className={`inline-flex items-center px-4 py-3 rounded-full text-lg font-semibold ${estadoColores[data.reparacion.estado]}`}>
            {estadoLabels[data.reparacion.estado] || data.reparacion.estado}
          </div>
        </div>

        {/* Datos del Equipo */}
        <div className="bg-white rounded-lg border border-primary-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary-900 mb-4">
            Equipo
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-primary-600">Descripción</p>
              <p className="text-primary-900 font-medium">{data.equipo.descripcion}</p>
            </div>
            <div>
              <p className="text-sm text-primary-600">Fecha de Recepción</p>
              <p className="text-primary-900 font-medium">
                {new Date(data.equipo.fechaRecepcion).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary-900 mb-6">
            Historial de Estados
          </h2>

          <div className="space-y-4">
            {data.historial.length === 0 ? (
              <p className="text-primary-600">Sin cambios registrados</p>
            ) : (
              data.historial.map((item, idx) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-700 rounded-full"></div>
                    {idx < data.historial.length - 1 && (
                      <div className="w-0.5 h-12 bg-primary-200 mt-2"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoColores[item.estadoNuevo]} mb-2`}>
                      {estadoLabels[item.estadoNuevo] || item.estadoNuevo}
                    </span>
                    <p className="text-sm text-primary-600">
                      {new Date(item.fechaCambio).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-primary-600">
            Si tenés dudas, contactanos<br />
            Tel: {data.equipo.cliente.telefono}
          </p>
        </div>
      </div>
    </main>
  )
}
