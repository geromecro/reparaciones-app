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
      <div className="min-h-screen bg-gray-50 p-16 flex items-center justify-center">
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (!reparacion) {
    return (
      <div className="min-h-screen bg-gray-50 p-16">
        <p className="text-lg text-red-600">Reparación no encontrada</p>
      </div>
    )
  }

  const isModalOpen = !!editingRepuesto || (editingCotizacion && !!reparacion?.valorizacion?.cotizacion)

  return (
    <div
      className="min-h-screen bg-gray-50 p-16"
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

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-20 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              🎨 TEST MINIMALISTA 🎨 - Reparación #{reparacion.id}
            </h1>
            <p className="text-xl text-gray-600">
              {reparacion.equipo.cliente.nombre}
            </p>
            <p className="text-lg text-gray-500 mt-2">
              {reparacion.equipo.descripcion}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            ← Volver
          </Link>
        </div>

        {/* Info Section - Minimalista */}
        {/* Equipment Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-10 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Equipo</h2>
          <dl className="space-y-6">
            <div>
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Descripción</dt>
              <dd className="text-lg text-gray-900">{reparacion.equipo.descripcion}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Número Interno</dt>
              <dd className="text-lg text-gray-900 font-mono">{reparacion.equipo.numeroInterno}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Estado</dt>
              <dd className="text-lg">
                <span className="inline-block px-3 py-2 rounded-lg text-base font-semibold bg-blue-100 text-blue-900">
                  {reparacion.equipo.estado.replace('_', ' ')}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Repair Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-10 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reparación</h2>
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
            <form onSubmit={updateBasicInfo} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Electricista</label>
                <select
                  value={basicInfoEdits.electricista}
                  onChange={(e) => setBasicInfoEdits({...basicInfoEdits, electricista: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 text-base"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 text-base font-semibold"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBasicInfo(false)}
                  className="flex-1 bg-gray-200 text-gray-900 px-4 py-3 hover:bg-gray-300 text-base font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Electricista</dt>
                <dd className="text-lg text-gray-900">{reparacion.electricista || <span className="italic text-gray-400">Sin asignar</span>}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Precinto</dt>
                <dd className="text-lg text-gray-900">{reparacion.precintoNumero || <span className="italic text-gray-400">N/A</span>}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Estado Reparación</dt>
                <dd className="text-lg">
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

        {/* Cliente Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-10 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cliente</h2>
          <dl className="space-y-6">
            <div>
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Nombre</dt>
              <dd className="text-lg text-gray-900">{reparacion.equipo.cliente.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Teléfono</dt>
              <dd className="text-lg text-gray-900 font-mono">{reparacion.equipo.cliente.telefono}</dd>
            </div>
          </dl>
        </div>

        {/* Tracking Link Card */}
        <div className="bg-white rounded-xl shadow-sm p-10 mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Link de Seguimiento Público</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 text-base text-gray-900 font-mono"
            />
            <button
              onClick={() => {
                const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`
                navigator.clipboard.writeText(link)
                alert('Link copiado al portapapeles')
              }}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 text-base font-semibold whitespace-nowrap"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* Repuestos Section */}
        <div className="bg-white rounded-xl shadow-sm p-10 mb-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Repuestos Utilizados</h2>
            <button
              onClick={() => setShowFormRepuesto(!showFormRepuesto)}
              className="bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 text-sm font-semibold"
            >
              {showFormRepuesto ? 'Cancelar' : '+ Agregar Repuesto'}
            </button>
          </div>

          {showFormRepuesto && (
            <form onSubmit={addRepuesto} className="p-8 bg-gray-50 rounded-lg mb-8 grid grid-cols-5 gap-4 border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código *</label>
                <input type="text" required value={repuesto.codigoRepuesto} onChange={(e) => setRepuesto({...repuesto, codigoRepuesto: e.target.value})} className="w-full px-4 py-3 border border-gray-300 text-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <input type="text" value={repuesto.descripcion} onChange={(e) => setRepuesto({...repuesto, descripcion: e.target.value})} className="w-full px-4 py-3 border border-gray-300 text-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad *</label>
                <input type="number" required value={repuesto.cantidad} onChange={(e) => setRepuesto({...repuesto, cantidad: parseInt(e.target.value) || 1})} min="1" className="w-full px-4 py-3 border border-gray-300 text-base" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Unit. *</label>
                <input type="number" required value={repuesto.importeUnitario} onChange={(e) => setRepuesto({...repuesto, importeUnitario: parseFloat(e.target.value) || 0})} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 text-base" />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">&nbsp;</label>
                <button type="submit" className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 text-base font-semibold">Agregar</button>
              </div>
            </form>
          )}

          {reparacion.repuestosUsados.length > 0 ? (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Código</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Descripción</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Cant.</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Precio Unit.</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reparacion.repuestosUsados.map(rep => (
                    <tr key={rep.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-base text-gray-900 font-mono">{rep.codigoRepuesto}</td>
                      <td className="px-6 py-5 text-base text-gray-700">{rep.descripcion || '-'}</td>
                      <td className="px-6 py-5 text-center text-base text-gray-900">{rep.cantidad}</td>
                      <td className="px-6 py-5 text-right text-base text-gray-900">${rep.importeUnitario.toFixed(2)}</td>
                      <td className="px-6 py-5 text-right text-base font-semibold text-gray-900">${rep.subtotal.toFixed(2)}</td>
                      <td className="px-6 py-5 text-center space-x-3">
                        <button onClick={() => setEditingRepuesto({id: rep.id, codigoRepuesto: rep.codigoRepuesto, descripcion: rep.descripcion, cantidad: rep.cantidad, importeUnitario: rep.importeUnitario})} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Editar</button>
                        <button onClick={() => deleteRepuesto(rep.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 border-t-2 border-gray-300 font-semibold">
                    <td colSpan={4} className="px-6 py-5 text-right text-base text-gray-900">Total:</td>
                    <td className="px-6 py-5 text-right text-xl font-bold text-blue-900">${totalRepuestos.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No hay repuestos registrados</p>
            </div>
          )}
        </div>

        {/* Valorizacion Section */}
        <div className="bg-white rounded-xl shadow-sm p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Valorización</h2>
            {!reparacion.valorizacion && (
              <button onClick={() => setShowFormValorizacion(!showFormValorizacion)} className="bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 text-sm font-semibold">
                {showFormValorizacion ? 'Cancelar' : '+ Crear Valorización'}
              </button>
            )}
          </div>

          {showFormValorizacion && (
            <form onSubmit={createValorizacion} className="p-8 bg-gray-50 rounded-lg mb-8 grid grid-cols-3 gap-6 border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Electricista *</label>
                <select value={valorizacion.manoObraElectricista} onChange={(e) => setValorizacion({...valorizacion, manoObraElectricista: e.target.value})} className="w-full px-4 py-3 border border-gray-300 text-base">
                  <option value="Arnau">Arnau</option>
                  <option value="Ivan">Ivan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Importe Mano de Obra *</label>
                <input type="number" required value={valorizacion.importeManoObra} onChange={(e) => setValorizacion({...valorizacion, importeManoObra: parseFloat(e.target.value) || 0})} min="0" step="0.01" className="w-full px-4 py-3 border border-gray-300 text-base" />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nº Factura</label>
                <div className="flex gap-3">
                  <input type="text" value={valorizacion.numeroFacturaInterna} onChange={(e) => setValorizacion({...valorizacion, numeroFacturaInterna: e.target.value})} className="flex-1 px-4 py-3 border border-gray-300 text-base" />
                  <button type="submit" className="bg-green-600 text-white px-6 py-3 hover:bg-green-700 text-base font-semibold">Crear</button>
                </div>
              </div>
            </form>
          )}

          {reparacion.valorizacion ? (
            <div>
              <dl className="space-y-6 mb-12">
                <div>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Costo de Repuestos</dt>
                  <dd className="text-2xl font-bold text-gray-900">${reparacion.valorizacion.costoRepuestos.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Mano de Obra</dt>
                  <dd className="text-lg text-gray-900">{reparacion.valorizacion.manoObraElectricista} - <span className="font-semibold">${reparacion.valorizacion.importeManoObra.toFixed(2)}</span></dd>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Subtotal</dt>
                  <dd className="text-3xl font-bold text-blue-900">${reparacion.valorizacion.subtotal.toFixed(2)}</dd>
                </div>
              </dl>

              {reparacion.valorizacion.cotizacion ? (
                <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Cotización</h3>
                  <dl className="space-y-6 mb-8">
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Importe Original</dt>
                      <dd className="text-lg font-semibold text-gray-900">${reparacion.valorizacion.cotizacion.importeOriginal.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Ajuste Pablo</dt>
                      <dd className="text-lg font-semibold text-gray-900">${reparacion.valorizacion.cotizacion.ajustePablo.toFixed(2)}</dd>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Importe Final</dt>
                      <dd className="text-3xl font-bold text-green-900">${reparacion.valorizacion.cotizacion.importeFinal.toFixed(2)}</dd>
                    </div>
                  </dl>
                  <button onClick={() => {setEditingCotizacion(true); setCotizacionAjuste(reparacion.valorizacion.cotizacion.ajustePablo)}} className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 text-base font-semibold">Editar Cotización</button>
                </div>
              ) : (
                <Link href={`/cotizaciones/nueva?valorizacionId=${reparacion.valorizacion.id}`} className="block bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 text-center text-base font-semibold">Crear Cotización</Link>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">Cree una valorización para continuar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
