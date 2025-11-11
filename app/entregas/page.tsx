'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Entrega {
  id: number
  equipo: {
    id: number
    cliente: {
      nombre: string
      telefono: string
    }
    descripcion: string
    numeroInterno: string
    estado: string
  }
  numeroRemitoOficial?: string
  numeroRemitoInterno?: string
  fechaEntrega: string
  estado: string
}

export default function EntregasPage() {
  const [equipos, setEquipos] = useState<any[]>([])
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEquipoId, setSelectedEquipoId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'pendientes' | 'entregadas'>('pendientes')
  const [remitos, setRemitos] = useState({
    numeroRemitoOficial: '',
    numeroRemitoInterno: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equiposRes, entregasRes] = await Promise.all([
        fetch('/api/equipos'),
        fetch('/api/entregas')
      ])

      const equiposData = await equiposRes.json()
      const entregasData = await entregasRes.json()

      // Filter equipos that are ready for delivery (have valorizacion and cotizacion)
      const reparadosYCotizados = equiposData.filter((e: any) => {
        const tieneValorizacion = e.reparaciones.some((r: any) => r.valorizacion)
        const tieneCotizacion = e.reparaciones.some((r: any) => r.valorizacion?.cotizacion)
        const noEntregado = e.estado !== 'ENTREGADO'
        return tieneValorizacion && tieneCotizacion && noEntregado
      })

      setEquipos(reparadosYCotizados)
      setEntregas(entregasData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEntrega = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEquipoId) return

    try {
      const res = await fetch('/api/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipoId: selectedEquipoId,
          ...remitos
        })
      })

      if (res.ok) {
        setShowModal(false)
        setRemitos({
          numeroRemitoOficial: '',
          numeroRemitoInterno: ''
        })
        setSelectedEquipoId(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error creating entrega:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Entregas
            </h1>
            <p className="text-gray-600">
              Equipos listos para entregar: {equipos.length}
            </p>
          </div>
          <Link
            href="/"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Volver
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('pendientes')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'pendientes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pendientes ({equipos.length})
          </button>
          <button
            onClick={() => setActiveTab('entregadas')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'entregadas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Entregadas ({entregas.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pendientes' && (
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              Cargando equipos...
            </div>
          ) : equipos.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No hay equipos listos para entregar
            </div>
          ) : (
            <div className="divide-y">
              {equipos.map(equipo => (
                <div key={equipo.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {equipo.cliente.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {equipo.descripcion}
                      </p>
                      <div className="mt-3 flex gap-4 text-xs text-gray-600">
                        <span>Interno: {equipo.numeroInterno}</span>
                        <span>Tel: {equipo.cliente.telefono}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEquipoId(equipo.id)
                        setShowModal(true)
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Entregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Tab Entregadas */}
        {activeTab === 'entregadas' && (
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              Cargando entregas...
            </div>
          ) : entregas.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No hay entregas registradas
            </div>
          ) : (
            <div className="divide-y">
              {entregas.map(entrega => (
                <div key={entrega.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entrega.equipo.cliente.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {entrega.equipo.descripcion}
                      </p>
                      <div className="mt-3 flex gap-4 text-xs text-gray-600">
                        <span>Interno: {entrega.equipo.numeroInterno}</span>
                        <span>Tel: {entrega.equipo.cliente.telefono}</span>
                      </div>
                      {entrega.numeroRemitoOficial && (
                        <div className="mt-3 flex gap-4 text-xs text-gray-500">
                          <span>Remito Oficial: {entrega.numeroRemitoOficial}</span>
                          {entrega.numeroRemitoInterno && (
                            <span>Remito Interno: {entrega.numeroRemitoInterno}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-900">
                        Entregado
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(entrega.fechaEntrega).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Modal de Entrega */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Registrar Entrega
            </h2>

            <form onSubmit={handleEntrega} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Remito Oficial
                </label>
                <input
                  type="text"
                  value={remitos.numeroRemitoOficial}
                  onChange={(e) => setRemitos({...remitos, numeroRemitoOficial: e.target.value})}
                  placeholder="Ej: REM-2024-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Remito Interno
                </label>
                <input
                  type="text"
                  value={remitos.numeroRemitoInterno}
                  onChange={(e) => setRemitos({...remitos, numeroRemitoInterno: e.target.value})}
                  placeholder="Ej: INTERNAL-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedEquipoId(null)
                    setRemitos({
                      numeroRemitoOficial: '',
                      numeroRemitoInterno: ''
                    })
                  }}
                  className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Registrar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
