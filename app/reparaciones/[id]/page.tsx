'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import EstadoSelector from '@/components/EstadoSelector'
import Modal from '@/components/Modal'

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
    importeManoObra: 0,
    numeroFacturaInterna: ''
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
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!reparacion) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p className="text-red-600">Reparación no encontrada</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditingRepuesto(null)}
              className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-semibold"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditingCotizacion(false)}
              className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center border-b border-gray-300 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reparación #{reparacion.id}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {reparacion.equipo.cliente.nombre} - {reparacion.equipo.descripcion}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            ← Volver
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-white border border-gray-300 mb-8">
          {/* Equipment Info */}
          <div className="border-b border-gray-300">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h2 className="font-bold text-gray-900 text-sm">INFORMACIÓN DEL EQUIPO</h2>
            </div>
            <dl className="divide-y divide-gray-200">
              <div className="grid grid-cols-3 hover:bg-gray-50">
                <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Descripción</dt>
                <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">{reparacion.equipo.descripcion}</dd>
              </div>
              <div className="grid grid-cols-3 hover:bg-gray-50">
                <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Número Interno</dt>
                <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">{reparacion.equipo.numeroInterno}</dd>
              </div>
              <div className="grid grid-cols-3 hover:bg-gray-50">
                <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Estado Equipo</dt>
                <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {reparacion.equipo.estado.replace('_', ' ')}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Repair Info */}
          <div className="border-b border-gray-300">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 text-sm">INFORMACIÓN DE REPARACIÓN</h2>
              {!editingBasicInfo && (
                <button
                  onClick={handleEditBasicInfoClick}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Editar
                </button>
              )}
            </div>
            {editingBasicInfo ? (
              <form onSubmit={updateBasicInfo} className="px-6 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Electricista</label>
                  <select
                    value={basicInfoEdits.electricista}
                    onChange={(e) => setBasicInfoEdits({...basicInfoEdits, electricista: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Sin asignar</option>
                    <option value="Arnau">Arnau</option>
                    <option value="Ivan">Ivan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Número de Precinto</label>
                  <input
                    type="text"
                    value={basicInfoEdits.precintoNumero}
                    onChange={(e) => setBasicInfoEdits({...basicInfoEdits, precintoNumero: e.target.value})}
                    placeholder="Ej: PRECINTO-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-xs font-medium"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBasicInfo(false)}
                    className="flex-1 bg-gray-300 text-gray-900 px-3 py-2 rounded hover:bg-gray-400 text-xs font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <dl className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 hover:bg-gray-50">
                  <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Electricista</dt>
                  <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">{reparacion.electricista || <span className="italic text-gray-500">Sin asignar</span>}</dd>
                </div>
                <div className="grid grid-cols-3 hover:bg-gray-50">
                  <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Precinto</dt>
                  <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">{reparacion.precintoNumero || 'N/A'}</dd>
                </div>
                <div className="grid grid-cols-3 hover:bg-gray-50">
                  <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Estado</dt>
                  <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">
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

          {/* Cliente Info */}
          <div>
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h2 className="font-bold text-gray-900 text-sm">INFORMACIÓN DEL CLIENTE</h2>
            </div>
            <dl className="divide-y divide-gray-200">
              <div className="grid grid-cols-3 hover:bg-gray-50">
                <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Nombre</dt>
                <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">{reparacion.equipo.cliente.nombre}</dd>
              </div>
              <div className="grid grid-cols-3 hover:bg-gray-50">
                <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Teléfono</dt>
                <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">{reparacion.equipo.cliente.telefono}</dd>
              </div>
            </dl>
          </div>

          {/* Tracking Link */}
          <div>
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h2 className="font-bold text-gray-900 text-sm">LINK DE SEGUIMIENTO</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 font-mono"
                />
                <button
                  onClick={() => {
                    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`
                    navigator.clipboard.writeText(link)
                    alert('Link copiado al portapapeles')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium whitespace-nowrap"
                >
                  Copiar Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Repuestos Section */}
        <div className="bg-white border border-gray-300 mb-8">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-sm">REPUESTOS UTILIZADOS</h2>
            <button
              onClick={() => setShowFormRepuesto(!showFormRepuesto)}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-xs font-medium"
            >
              {showFormRepuesto ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {showFormRepuesto && (
            <form onSubmit={addRepuesto} className="p-6 bg-gray-50 border-b border-gray-300 grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Código *</label>
                <input type="text" required value={repuesto.codigoRepuesto} onChange={(e) => setRepuesto({...repuesto, codigoRepuesto: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                <input type="text" value={repuesto.descripcion} onChange={(e) => setRepuesto({...repuesto, descripcion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad *</label>
                <input type="number" required value={repuesto.cantidad} onChange={(e) => setRepuesto({...repuesto, cantidad: parseInt(e.target.value) || 1})} min="1" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit. *</label>
                <div className="flex gap-2">
                  <input type="number" required value={repuesto.importeUnitario} onChange={(e) => setRepuesto({...repuesto, importeUnitario: parseFloat(e.target.value) || 0})} min="0" step="0.01" className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm" />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-xs font-medium">Agregar</button>
                </div>
              </div>
            </form>
          )}

          {reparacion.repuestosUsados.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Descripción</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-900">Cant</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-900">Precio Unit.</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-900">Subtotal</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reparacion.repuestosUsados.map(rep => (
                  <tr key={rep.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{rep.codigoRepuesto}</td>
                    <td className="px-6 py-3 text-sm">{rep.descripcion || '-'}</td>
                    <td className="px-6 py-3 text-center text-sm">{rep.cantidad}</td>
                    <td className="px-6 py-3 text-right text-sm">${rep.importeUnitario.toFixed(2)}</td>
                    <td className="px-6 py-3 text-right text-sm font-medium">${rep.subtotal.toFixed(2)}</td>
                    <td className="px-6 py-3 text-center space-x-2">
                      <button onClick={() => setEditingRepuesto({id: rep.id, codigoRepuesto: rep.codigoRepuesto, descripcion: rep.descripcion, cantidad: rep.cantidad, importeUnitario: rep.importeUnitario})} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                      <button onClick={() => deleteRepuesto(rep.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Eliminar</button>
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold bg-gray-100 border-t border-gray-300">
                  <td colSpan={4} className="px-6 py-3 text-right text-sm">Total:</td>
                  <td className="px-6 py-3 text-right text-sm font-bold">${totalRepuestos.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-4 text-sm text-gray-600">No hay repuestos registrados</div>
          )}
        </div>

        {/* Valorizacion Section */}
        <div className="bg-white border border-gray-300">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-sm">VALORIZACIÓN</h2>
            {!reparacion.valorizacion && (
              <button onClick={() => setShowFormValorizacion(!showFormValorizacion)} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-xs font-medium">
                {showFormValorizacion ? 'Cancelar' : '+ Crear'}
              </button>
            )}
          </div>

          {showFormValorizacion && (
            <form onSubmit={createValorizacion} className="p-6 bg-gray-50 border-b border-gray-300 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Electricista *</label>
                <select value={valorizacion.manoObraElectricista} onChange={(e) => setValorizacion({...valorizacion, manoObraElectricista: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="Arnau">Arnau</option>
                  <option value="Ivan">Ivan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Importe Mano de Obra *</label>
                <input type="number" required value={valorizacion.importeManoObra} onChange={(e) => setValorizacion({...valorizacion, importeManoObra: parseFloat(e.target.value) || 0})} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-medium text-gray-700 mb-1">Nº Factura</label>
                <div className="flex gap-2">
                  <input type="text" value={valorizacion.numeroFacturaInterna} onChange={(e) => setValorizacion({...valorizacion, numeroFacturaInterna: e.target.value})} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm" />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-xs font-medium">Crear</button>
                </div>
              </div>
            </form>
          )}

          {reparacion.valorizacion ? (
            <div className="divide-y divide-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 hover:bg-gray-50">
                  <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Costo Repuestos</dt>
                  <dd className="px-6 py-3 text-sm font-bold text-gray-900 col-span-2">${reparacion.valorizacion.costoRepuestos.toFixed(2)}</dd>
                </div>
                <div className="grid grid-cols-3 hover:bg-gray-50">
                  <dt className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">Mano de Obra</dt>
                  <dd className="px-6 py-3 text-sm text-gray-900 col-span-2">{reparacion.valorizacion.manoObraElectricista} - ${reparacion.valorizacion.importeManoObra.toFixed(2)}</dd>
                </div>
                <div className="grid grid-cols-3 bg-blue-50">
                  <dt className="px-6 py-3 text-sm font-bold text-gray-900 bg-gray-50">Subtotal</dt>
                  <dd className="px-6 py-3 text-sm font-bold text-blue-900 col-span-2">${reparacion.valorizacion.subtotal.toFixed(2)}</dd>
                </div>
              </dl>

              {reparacion.valorizacion.cotizacion ? (
                <div className="border-t border-gray-300 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="grid grid-cols-3 px-6 py-3 hover:bg-gray-50">
                      <dt className="text-sm font-medium text-gray-700">Importe Original</dt>
                      <dd className="text-sm font-medium text-gray-900 col-span-2">${reparacion.valorizacion.cotizacion.importeOriginal.toFixed(2)}</dd>
                    </div>
                    <div className="grid grid-cols-3 px-6 py-3 hover:bg-gray-50">
                      <dt className="text-sm font-medium text-gray-700">Ajuste Pablo</dt>
                      <dd className="text-sm font-medium text-gray-900 col-span-2">${reparacion.valorizacion.cotizacion.ajustePablo.toFixed(2)}</dd>
                    </div>
                    <div className="grid grid-cols-3 px-6 py-3 bg-green-50 border-t border-gray-300">
                      <dt className="text-sm font-bold text-gray-900">Importe Final</dt>
                      <dd className="text-sm font-bold text-green-900 col-span-2">${reparacion.valorizacion.cotizacion.importeFinal.toFixed(2)}</dd>
                    </div>
                  </dl>
                  <div className="px-6 py-4">
                    <button onClick={() => {setEditingCotizacion(true); setCotizacionAjuste(reparacion.valorizacion.cotizacion.ajustePablo)}} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-xs font-medium">Editar Cotización</button>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4">
                  <Link href={`/cotizaciones/nueva?valorizacionId=${reparacion.valorizacion.id}`} className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center text-xs font-medium">Crear Cotización</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-4 text-sm text-gray-600">Cree una valorización para continuar</div>
          )}
        </div>
      </div>
    </div>
  )
}
