'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import EtapaIndicadores from '@/components/EtapaIndicadores'

type FiltroEtapa = 'todo' | 'recepcion' | 'presupuesto' | 'administracion'

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
  valorizacion?: {
    id: number
    cotizacion?: {
      id: number
    } | null
  } | null
  repuestosUsados?: Array<{
    id: number
  }>
}

const EstadoReparacion = {
  ASIGNADO: 'ASIGNADO',
  FACTURADO: 'FACTURADO'
}

const estadoOrden: { [key: string]: number } = {
  RECIBIDO: 0,
  PRECINTADO: 1,
  ASIGNADO: 2,
  DIAGNOSTICO: 3,
  EN_REPARACION: 4,
  ESPERANDO_REPUESTOS: 5,
  VALORIZADO: 6,
  COTIZADO: 7,
  APROBADO: 8,
  FACTURADO: 9,
  LISTO_PARA_RETIRO: 10,
  ENTREGADO: 11,
  CERRADO: 12
}

export default function Dashboard() {
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroActivo, setFiltroActivo] = useState<FiltroEtapa>('todo')

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

  // Funciones para detectar etapas completas
  const etapa1Completa = (rep: Reparacion) => {
    return (estadoOrden[rep.estado] ?? -1) >= (estadoOrden[EstadoReparacion.ASIGNADO] ?? -1)
  }

  const etapa2Completa = (rep: Reparacion) => {
    return !!rep.valorizacion && (rep.repuestosUsados?.length ?? 0) > 0
  }

  const etapa3Completa = (rep: Reparacion) => {
    return (
      !!rep.valorizacion?.cotizacion &&
      (estadoOrden[rep.estado] ?? -1) >= (estadoOrden[EstadoReparacion.FACTURADO] ?? -1)
    )
  }

  // Filtrar reparaciones según el filtro activo
  const reparacionesFiltradas = reparaciones.filter((rep) => {
    switch (filtroActivo) {
      case 'recepcion':
        return !etapa1Completa(rep)
      case 'presupuesto':
        return etapa1Completa(rep) && !etapa2Completa(rep)
      case 'administracion':
        return etapa2Completa(rep) && !etapa3Completa(rep)
      default:
        return true
    }
  })

  // Calcular conteos para los tabs
  const conteos = {
    todo: reparaciones.length,
    recepcion: reparaciones.filter((rep) => !etapa1Completa(rep)).length,
    presupuesto: reparaciones.filter((rep) => etapa1Completa(rep) && !etapa2Completa(rep)).length,
    administracion: reparaciones.filter((rep) => etapa2Completa(rep) && !etapa3Completa(rep)).length
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Panel de Reparaciones
            </h1>
            <p className="text-lg text-gray-600">
              {reparaciones.length} reparaciones en total
            </p>
          </div>
          <Link href="/">
            <Button variant="secondary" className="text-sm px-6 py-3">
              ← Inicio
            </Button>
          </Link>
        </div>

        {/* Tabs de Filtrado por Etapa */}
        <div className="mb-10 flex gap-3 border-b border-gray-200 pb-4">
          {[
            { id: 'todo' as FiltroEtapa, label: 'Todo', count: conteos.todo },
            { id: 'recepcion' as FiltroEtapa, label: 'Recepción', count: conteos.recepcion },
            { id: 'presupuesto' as FiltroEtapa, label: 'Presupuesto', count: conteos.presupuesto },
            { id: 'administracion' as FiltroEtapa, label: 'Administración', count: conteos.administracion }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroActivo(tab.id)}
              className={`px-4 py-4 font-semibold text-sm border-b-2 transition-all ${
                filtroActivo === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs font-bold">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <p className="text-lg text-gray-600">Cargando reparaciones...</p>
            </div>
          ) : reparacionesFiltradas.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-lg text-gray-600 mb-8">
                {reparaciones.length === 0 ? 'No hay reparaciones registradas' : `No hay reparaciones en la etapa "${filtroActivo}"`}
              </p>
              {reparaciones.length === 0 && (
                <Link href="/reparaciones/nueva">
                  <Button variant="primary" className="px-8 py-4 text-base">
                    Crear Nueva Reparación
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Equipo</th>
                    <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Progreso</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Electricista</th>
                    <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-8 py-5 text-sm font-semibold text-gray-700 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reparacionesFiltradas.map((rep) => (
                    <tr key={rep.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-base text-gray-900 font-semibold">#{rep.id}</td>
                      <td className="px-8 py-6 text-base text-gray-900">{rep.equipo.cliente.nombre}</td>
                      <td className="px-8 py-6 text-base text-gray-700">{rep.equipo.descripcion}</td>
                      <td className="px-8 py-6 text-center">
                        <EtapaIndicadores reparacion={rep} />
                      </td>
                      <td className="px-8 py-6 text-base text-gray-700">{rep.electricista || <span className="italic text-gray-400">-</span>}</td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-900">
                          {getEstadoLabel(rep.estado)}
                        </span>
                        {!rep.electricista && <span className="ml-2 inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-amber-100 text-amber-900">Sin asignar</span>}
                      </td>
                      <td className="px-8 py-6 text-base text-center">
                        <Link href={`/reparaciones/${rep.id}`} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                          Ver detalles
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
