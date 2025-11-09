'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'

interface Reparacion {
  id: number
  equipo: {
    cliente: {
      nombre: string
    }
    descripcion: string
  }
  electricista: string | null
  estado: string
  createdAt: string
}

export default function Dashboard() {
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReparaciones()
  }, [])

  const fetchReparaciones = async () => {
    try {
      const res = await fetch('/api/reparaciones')
      const data = await res.json()
      setReparaciones(data)
    } catch (error) {
      console.error('Error fetching reparaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'RECIBIDO':
      case 'PRECINTADO':
      case 'ASIGNADO':
        return 'default'
      case 'DIAGNOSTICO':
      case 'EN_REPARACION':
      case 'ESPERANDO_REPUESTOS':
        return 'warning'
      case 'VALORIZADO':
      case 'COTIZADO':
      case 'APROBADO':
        return 'info'
      case 'FACTURADO':
      case 'LISTO_PARA_RETIRO':
      case 'ENTREGADO':
        return 'success'
      case 'CERRADO':
        return 'default'
      default:
        return 'default'
    }
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'RECIBIDO': 'Recibido',
      'PRECINTADO': 'Precintado',
      'ASIGNADO': 'Asignado',
      'DIAGNOSTICO': 'Diagnóstico',
      'EN_REPARACION': 'En reparación',
      'ESPERANDO_REPUESTOS': 'Esperando repuestos',
      'VALORIZADO': 'Valorizado',
      'COTIZADO': 'Cotizado (P)',
      'APROBADO': 'Aprobado/OC',
      'FACTURADO': 'Facturado',
      'LISTO_PARA_RETIRO': 'Listo para retiro',
      'ENTREGADO': 'Entregado',
      'CERRADO': 'Cerrado',
      'EN_PROCESO': 'En proceso',
      'COMPLETADA': 'Completada',
      'CANCELADA': 'Cancelada'
    }
    return labels[estado] || estado.replace('_', ' ')
  }

  const statCards = [
    {
      label: 'En Inicio',
      count: reparaciones.filter(r => ['RECIBIDO', 'PRECINTADO', 'ASIGNADO'].includes(r.estado)).length,
    },
    {
      label: 'En Trabajo',
      count: reparaciones.filter(r => ['DIAGNOSTICO', 'EN_REPARACION', 'ESPERANDO_REPUESTOS'].includes(r.estado)).length,
    },
    {
      label: 'En Administrativo',
      count: reparaciones.filter(r => ['VALORIZADO', 'COTIZADO', 'APROBADO'].includes(r.estado)).length,
    },
    {
      label: 'Entregadas/Cerradas',
      count: reparaciones.filter(r => ['FACTURADO', 'LISTO_PARA_RETIRO', 'ENTREGADO', 'CERRADO'].includes(r.estado)).length,
    },
  ]

  return (
    <main className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-primary-900 mb-2">
              Dashboard
            </h1>
            <p className="text-base text-primary-600">
              {reparaciones.length} reparaciones registradas
            </p>
          </div>
          <Link href="/">
            <Button variant="secondary">
              ← Volver al Inicio
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 p-8">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                {stat.label}
              </p>
              <p className="text-5xl font-bold text-gray-900">
                {stat.count}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Cargando reparaciones...</p>
            </div>
          ) : reparaciones.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">No hay reparaciones registradas</p>
              <Link href="/reparaciones/nueva">
                <Button variant="primary">
                  Crear Nueva Reparación
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                      ID
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Cliente
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Equipo
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Electricista
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Estado
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reparaciones.map((rep) => (
                    <tr key={rep.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-8 py-5 text-sm text-gray-900 font-medium">
                        #{rep.id}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-900">
                        {rep.equipo.cliente.nombre}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-700">
                        {rep.equipo.descripcion}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-700">
                        {rep.electricista || <span className="italic text-gray-500">Sin asignar</span>}
                      </td>
                      <td className="px-8 py-5 flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900 border border-blue-200">
                          {getEstadoLabel(rep.estado)}
                        </span>
                        {!rep.electricista && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200">
                            Incompleta
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm">
                        <Link
                          href={`/reparaciones/${rep.id}`}
                          className="text-blue-700 hover:text-blue-900 font-medium transition-colors"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
