'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import EstadoSelector from '@/components/EstadoSelector'
import Modal from '@/components/Modal'
import { formatCurrency } from '@/lib/format'

interface RepuestoUsado {
  id: number
  codigoRepuesto: string
  descripcion?: string
  cantidad: number
  importeUnitario: number
  subtotal: number
}

interface Reparacion {
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
  electricista: string
  precintoNumero?: string
  estado: string
  repuestosUsados: RepuestoUsado[]
  valorizacion?: any
  createdAt: string
}

interface EditingRepuesto {
  id: number
  codigoRepuesto: string
  descripcion?: string
  cantidad: number
  importeUnitario: number
}

export default function DetallesReparacion() {
  const params = useParams()
  const id = params.id as string
  const [reparacion, setReparacion] = useState<Reparacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFormRepuesto, setShowFormRepuesto] = useState(false)
  const [showFormValorizacion, setShowFormValorizacion] = useState(false)
  const [editingRepuesto, setEditingRepuesto] = useState<EditingRepuesto | null>(null)
  const [editingCotizacion, setEditingCotizacion] = useState(false)
  const [cotizacionAjuste, setCotizacionAjuste] = useState(0)
  const [editingBasicInfo, setEditingBasicInfo] = useState(false)
  const [basicInfoEdits, setBasicInfoEdits] = useState({ electricista: '', precintoNumero: '' })

  const [repuesto, setRepuesto] = useState({
    codigoRepuesto: '',
    descripcion: '',
    cantidad: 1,
    importeUnitario: 0
  })

  const [valorizacion, setValorizacion] = useState({
    manoObraElectricista: 'Arnau',
    importeManoObra: 0
  })

  useEffect(() => {
    fetchReparacion()
  }, [id])

  const fetchReparacion = async () => {
    try {
      const res = await fetch(`/api/reparaciones/${id}`)
      const data = await res.json()
      setReparacion(data)
    } catch (error) {
      console.error('Error fetching reparacion:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRepuesto = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/repuestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacionId: parseInt(id),
          ...repuesto,
          cantidad: parseInt(repuesto.cantidad.toString()),
          importeUnitario: parseFloat(repuesto.importeUnitario.toString())
        })
      })
      if (res.ok) {
        setRepuesto({
          codigoRepuesto: '',
          descripcion: '',
          cantidad: 1,
          importeUnitario: 0
        })
        setShowFormRepuesto(false)
        fetchReparacion()
      }
    } catch (error) {
      console.error('Error adding repuesto:', error)
    }
  }

  const createValorizacion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/valorizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reparacionId: parseInt(id),
          ...valorizacion,
          importeManoObra: parseFloat(valorizacion.importeManoObra.toString())
        })
      })
      if (res.ok) {
        setShowFormValorizacion(false)
        fetchReparacion()
      }
    } catch (error) {
      console.error('Error creating valorizacion:', error)
    }
  }

  const updateRepuesto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRepuesto) return

    try {
      const res = await fetch(`/api/repuestos/${editingRepuesto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoRepuesto: editingRepuesto.codigoRepuesto,
          descripcion: editingRepuesto.descripcion || '',
          cantidad: parseInt(editingRepuesto.cantidad.toString()),
          importeUnitario: parseFloat(editingRepuesto.importeUnitario.toString())
        })
      })

      if (res.ok) {
        setEditingRepuesto(null)
        fetchReparacion()
      } else {
        const error = await res.json()
        console.error('Error updating repuesto:', error)
        alert('Error al actualizar repuesto')
      }
    } catch (error) {
      console.error('Error updating repuesto:', error)
      alert('Error al actualizar repuesto')
    }
  }

  const deleteRepuesto = async (repuestoId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este repuesto?')) {
      return
    }

    try {
      const res = await fetch(`/api/repuestos/${repuestoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.ok) {
        fetchReparacion()
      } else {
        const error = await res.json()
        console.error('Error deleting repuesto:', error)
        alert('Error al eliminar repuesto')
      }
    } catch (error) {
      console.error('Error deleting repuesto:', error)
      alert('Error al eliminar repuesto')
    }
  }

  const updateCotizacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reparacion?.valorizacion?.cotizacion) return

    try {
      const res = await fetch(`/api/cotizaciones/${reparacion.valorizacion.cotizacion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ajustePablo: parseFloat(cotizacionAjuste.toString())
        })
      })

      if (res.ok) {
        setEditingCotizacion(false)
        setCotizacionAjuste(0)
        fetchReparacion()
      } else {
        const error = await res.json()
        console.error('Error updating cotizacion:', error)
        alert('Error al actualizar cotización')
      }
    } catch (error) {
      console.error('Error updating cotizacion:', error)
      alert('Error al actualizar cotización')
    }
  }

  const updateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reparacion) return

    try {
      const res = await fetch(`/api/reparaciones/${reparacion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electricista: basicInfoEdits.electricista || null,
          precintoNumero: basicInfoEdits.precintoNumero || null
        })
      })

      if (res.ok) {
        const updatedReparacion = await res.json()
        setReparacion(updatedReparacion)
        setEditingBasicInfo(false)
        alert('Información actualizada correctamente')
      } else {
        alert('Error al actualizar información')
      }
    } catch (error) {
      console.error('Error updating basic info:', error)
      alert('Error al actualizar información')
    }
  }

  const handleEditBasicInfoClick = () => {
    setBasicInfoEdits({
      electricista: reparacion?.electricista || '',
      precintoNumero: reparacion?.precintoNumero || ''
    })
    setEditingBasicInfo(true)
  }

  const totalRepuestos = reparacion?.repuestosUsados.reduce((sum, r) => sum + r.subtotal, 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 font-semibold">Cargando reparación...</p>
        </div>
      </div>
    )
  }

  if (!reparacion) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <p className="text-lg text-red-600 font-semibold mb-4">Reparación no encontrada</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">
            Volver al panel
          </Link>
        </div>
      </div>
    )
  }

  const isModalOpen = !!editingRepuesto || (editingCotizacion && !!reparacion?.valorizacion?.cotizacion)

  return (
    <div
      className="min-h-screen bg-gray-50 p-8"
      style={{
        pointerEvents: isModalOpen ? 'none' : 'auto',
        opacity: isModalOpen ? 0.5 : 1
      }}
    >
      {/* Repuesto Edit Modal */}
      <Modal
        isOpen={!!editingRepuesto}
        onClose={() => setEditingRepuesto(null)}
        title="Editar Repuesto"
      >
        <form onSubmit={updateRepuesto}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Repuesto
              </label>
              <input
                type="text"
                required
                value={editingRepuesto?.codigoRepuesto || ''}
                onChange={(e) => editingRepuesto && setEditingRepuesto({...editingRepuesto, codigoRepuesto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={editingRepuesto?.descripcion || ''}
                onChange={(e) => editingRepuesto && setEditingRepuesto({...editingRepuesto, descripcion: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                required
                value={editingRepuesto?.cantidad || 1}
                onChange={(e) => editingRepuesto && setEditingRepuesto({...editingRepuesto, cantidad: parseInt(e.target.value) || 1})}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario
              </label>
              <input
                type="number"
                required
                value={editingRepuesto?.importeUnitario || 0}
                onChange={(e) => editingRepuesto && setEditingRepuesto({...editingRepuesto, importeUnitario: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditingRepuesto(null)}
              className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Cotización Edit Modal */}
      <Modal
        isOpen={editingCotizacion && !!reparacion?.valorizacion?.cotizacion}
        onClose={() => setEditingCotizacion(false)}
        title="Editar Cotización"
      >
        <form onSubmit={updateCotizacion}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Importe Original
              </label>
              <input
                type="number"
                disabled
                value={reparacion?.valorizacion?.cotizacion?.importeOriginal || 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Se actualiza automáticamente con repuestos</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ajuste Pablo
              </label>
              <input
                type="number"
                required
                value={cotizacionAjuste}
                onChange={(e) => setCotizacionAjuste(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Importe Final
              </label>
              <input
                type="number"
                disabled
                value={(reparacion?.valorizacion?.cotizacion?.importeOriginal || 0) + cotizacionAjuste}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 font-semibold"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditingCotizacion(false)}
              className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              Reparación #{reparacion.id}
            </h1>
            <p className="text-lg text-gray-600">
              {reparacion.equipo.cliente.nombre}
            </p>
            <p className="text-base text-gray-500 mt-1">
              {reparacion.equipo.descripcion}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            ← Volver
          </Link>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Left Column - Detalles de la Reparación (2/3 width) */}
          <div className="col-span-2 bg-white rounded-xl shadow-md p-8">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detalles de la Reparación</h2>
              {!editingBasicInfo && (
                <button
                  onClick={handleEditBasicInfoClick}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  Editar
                </button>
              )}
            </div>

            {editingBasicInfo ? (
              <form onSubmit={updateBasicInfo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Electricista</label>
                    <select
                      value={basicInfoEdits.electricista}
                      onChange={(e) => setBasicInfoEdits({...basicInfoEdits, electricista: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-base"
                    >
                      <option value="">Sin asignar</option>
                      <option value="Arnau">Arnau</option>
                      <option value="Ivan">Ivan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Precinto</label>
                    <input
                      type="text"
                      value={basicInfoEdits.precintoNumero}
                      onChange={(e) => setBasicInfoEdits({...basicInfoEdits, precintoNumero: e.target.value})}
                      placeholder="Ej: PRECINTO-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-base"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-base font-semibold"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBasicInfo(false)}
                    className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 text-base font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <dl className="space-y-5">
                {/* Equipo Info */}
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Equipo - Descripción</dt>
                  <dd className="text-base text-gray-900">{reparacion.equipo.descripcion}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Número Interno</dt>
                  <dd className="text-base text-gray-900 font-mono">{reparacion.equipo.numeroInterno}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estado del Equipo</dt>
                  <dd className="text-base">
                    <span className="inline-block px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-900">
                      {reparacion.equipo.estado.replace('_', ' ')}
                    </span>
                  </dd>
                </div>

                {/* Reparación Info */}
                <div className="pt-4 border-t border-gray-200">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Electricista Asignado</dt>
                  <dd className="text-base text-gray-900">{reparacion.electricista || <span className="italic text-gray-400">Sin asignar</span>}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Número de Precinto</dt>
                  <dd className="text-base text-gray-900 font-mono">{reparacion.precintoNumero || <span className="italic text-gray-400">N/A</span>}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado de la Reparación</dt>
                  <dd className="text-base">
                    <EstadoSelector
                      estadoActual={reparacion.estado}
                      reparacionId={reparacion.id}
                      onEstadoChanged={(nuevoEstado) => {
                        setReparacion({...reparacion, estado: nuevoEstado})
                      }}
                    />
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* Right Column - Información del Cliente (1/3 width) */}
          <div className="col-span-1 space-y-8">
            {/* Cliente Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Cliente</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre</dt>
                  <dd className="text-base text-gray-900">{reparacion.equipo.cliente.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teléfono</dt>
                  <dd className="text-base text-gray-900 font-mono">{reparacion.equipo.cliente.telefono}</dd>
                </div>
              </dl>
            </div>

            {/* Tracking Link Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-200">Link de Seguimiento</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-xs text-gray-900 font-mono"
                />
                <button
                  onClick={() => {
                    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`
                    navigator.clipboard.writeText(link)
                    alert('Link copiado al portapapeles')
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold transition-colors"
                >
                  Copiar Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Repuestos Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Repuestos Utilizados</h2>
            <button
              onClick={() => setShowFormRepuesto(!showFormRepuesto)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-semibold transition-colors"
            >
              {showFormRepuesto ? '✕ Cancelar' : '+ Agregar Repuesto'}
            </button>
          </div>

          {showFormRepuesto && (
            <form onSubmit={addRepuesto} className="p-6 bg-gray-50 rounded-lg mb-6 grid grid-cols-5 gap-4 border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Código *</label>
                <input type="text" required value={repuesto.codigoRepuesto} onChange={(e) => setRepuesto({...repuesto, codigoRepuesto: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Descripción</label>
                <input type="text" value={repuesto.descripcion} onChange={(e) => setRepuesto({...repuesto, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Cantidad *</label>
                <input type="number" required value={repuesto.cantidad} onChange={(e) => setRepuesto({...repuesto, cantidad: parseInt(e.target.value) || 1})} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md text-base" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Precio Unit. *</label>
                <input type="number" required value={repuesto.importeUnitario} onChange={(e) => setRepuesto({...repuesto, importeUnitario: parseFloat(e.target.value) || 0})} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md text-base" />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">&nbsp;</label>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-base font-semibold transition-colors">Agregar</button>
              </div>
            </form>
          )}

          {reparacion.repuestosUsados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Precio Unit.</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reparacion.repuestosUsados.map(rep => (
                    <tr key={rep.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">{rep.codigoRepuesto}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{rep.descripcion || '-'}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 font-semibold">{rep.cantidad}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">${formatCurrency(rep.importeUnitario)}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">${formatCurrency(rep.subtotal)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => setEditingRepuesto({id: rep.id, codigoRepuesto: rep.codigoRepuesto, descripcion: rep.descripcion, cantidad: rep.cantidad, importeUnitario: rep.importeUnitario})} className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline">Editar</button>
                          <span className="text-gray-300">•</span>
                          <button onClick={() => deleteRepuesto(rep.id)} className="text-red-600 hover:text-red-800 text-xs font-semibold hover:underline">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 border-t-2 border-gray-300">
                    <td colSpan={4} className="px-6 py-5 text-right text-sm font-bold text-gray-900 uppercase tracking-wider">Total Repuestos:</td>
                    <td className="px-6 py-5 text-right text-2xl font-bold text-blue-900">${formatCurrency(totalRepuestos)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-base text-gray-500">No hay repuestos registrados</p>
            </div>
          )}
        </div>

        {/* Valorizacion Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Mano de obra</h2>
            {!reparacion.valorizacion && (
              <button onClick={() => setShowFormValorizacion(!showFormValorizacion)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-semibold transition-colors">
                {showFormValorizacion ? '✕ Cancelar' : '+ Crear Mano de obra'}
              </button>
            )}
          </div>

          {showFormValorizacion && (
            <form onSubmit={createValorizacion} className="p-6 bg-gray-50 rounded-lg mb-6 grid grid-cols-2 gap-4 border border-gray-200 mb-8">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Electricista *</label>
                <select value={valorizacion.manoObraElectricista} onChange={(e) => setValorizacion({...valorizacion, manoObraElectricista: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
                  <option value="Arnau">Arnau</option>
                  <option value="Ivan">Ivan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Importe Mano de Obra *</label>
                <input type="number" required value={valorizacion.importeManoObra} onChange={(e) => setValorizacion({...valorizacion, importeManoObra: parseFloat(e.target.value) || 0})} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md text-base" />
              </div>
              <div className="col-span-2">
                <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-base font-semibold transition-colors">Crear Mano de obra</button>
              </div>
            </form>
          )}

          {reparacion.valorizacion ? (
            <div className="space-y-0">
              {/* Invoice-style Valorización */}
              <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                {/* Conceptos */}
                <div className="p-8 space-y-6 border-b-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Costo de Repuestos</span>
                    <span className="text-xl font-bold text-gray-900">${formatCurrency(reparacion.valorizacion.costoRepuestos)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Mano de Obra - {reparacion.valorizacion.manoObraElectricista}
                    </span>
                    <span className="text-xl font-bold text-gray-900">${formatCurrency(reparacion.valorizacion.importeManoObra)}</span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="px-8 py-6 bg-blue-50 border-b-2 border-gray-300 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-700 uppercase tracking-wider">Subtotal</span>
                  <span className="text-2xl font-bold text-blue-900">${formatCurrency(reparacion.valorizacion.subtotal)}</span>
                </div>

                {/* Cotización Section */}
                {reparacion.valorizacion.cotizacion ? (
                  <>
                    {/* Cotización Conceptos */}
                    <div className="p-8 space-y-6 border-b-2 border-gray-300">
                      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider pb-4 border-b border-gray-300">Cotización (Pablo)</h3>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Importe Original</span>
                        <span className="text-base font-semibold text-gray-900">${reparacion.valorizacion.cotizacion.importeOriginal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Ajuste Pablo</span>
                        <span className={`text-base font-semibold ${reparacion.valorizacion.cotizacion.ajustePablo >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {reparacion.valorizacion.cotizacion.ajustePablo >= 0 ? '+' : ''}${reparacion.valorizacion.cotizacion.ajustePablo.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Final Total */}
                    <div className="px-8 py-8 bg-green-50 border-b border-green-200 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-700 uppercase tracking-wider">Importe Final</span>
                      <span className="text-4xl font-bold text-green-900">${reparacion.valorizacion.cotizacion.importeFinal.toFixed(2)}</span>
                    </div>

                    {/* Edit Button */}
                    <div className="px-8 py-6 bg-white flex gap-3">
                      <button
                        onClick={() => {setEditingCotizacion(true); setCotizacionAjuste(reparacion.valorizacion.cotizacion.ajustePablo)}}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-base font-semibold"
                      >
                        Editar Cotización
                      </button>
                    </div>
                  </>
                ) : (
                  /* Create Cotización Button */
                  <div className="px-8 py-6 bg-white">
                    <Link href={`/cotizaciones/nueva?valorizacionId=${reparacion.valorizacion.id}`} className="block bg-green-600 text-white px-6 py-4 rounded-md hover:bg-green-700 text-center text-base font-semibold transition-colors">
                      Crear Cotización
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">Cree la mano de obra para continuar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
