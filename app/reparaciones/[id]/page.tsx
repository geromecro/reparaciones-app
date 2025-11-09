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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reparación #{reparacion.id}
            </h1>
            <p className="text-gray-600">
              {reparacion.equipo.cliente.nombre} - {reparacion.equipo.descripcion}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Volver
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Equipo Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Información del Equipo</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Descripción</p>
                <p className="font-semibold text-gray-900">{reparacion.equipo.descripcion}</p>
              </div>
              <div>
                <p className="text-gray-600">Número Interno</p>
                <p className="font-semibold text-gray-900">{reparacion.equipo.numeroInterno}</p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {reparacion.equipo.estado.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Reparacion Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Información de Reparación</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Electricista</p>
                <p className="font-semibold text-gray-900">{reparacion.electricista}</p>
              </div>
              <div>
                <p className="text-gray-600">Precinto</p>
                <p className="font-semibold text-gray-900">{reparacion.precintoNumero || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Estado</p>
                <div className="mt-2">
                  <EstadoSelector
                    estadoActual={reparacion.estado}
                    reparacionId={reparacion.id}
                    onEstadoChanged={(nuevoEstado) => {
                      setReparacion({...reparacion, estado: nuevoEstado})
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cliente Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Información del Cliente</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Nombre</p>
              <p className="font-semibold text-gray-900">{reparacion.equipo.cliente.nombre}</p>
            </div>
            <div>
              <p className="text-gray-600">Teléfono</p>
              <p className="font-semibold text-gray-900">{reparacion.equipo.cliente.telefono}</p>
            </div>
          </div>
        </div>

        {/* Tracking Link */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Link de Seguimiento para Cliente</h2>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900"
            />
            <button
              onClick={() => {
                const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/seguimiento/${reparacion.equipo.numeroInterno}`
                navigator.clipboard.writeText(link)
                alert('Link copiado al portapapeles')
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium whitespace-nowrap"
            >
              Copiar Link
            </button>
          </div>
        </div>

        {/* Repuestos Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-900">Repuestos Utilizados</h2>
            {!reparacion.valorizacion && (
              <button
                onClick={() => setShowFormRepuesto(!showFormRepuesto)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                {showFormRepuesto ? 'Cancelar' : '+ Agregar Repuesto'}
              </button>
            )}
          </div>

          {showFormRepuesto && (
            <form onSubmit={addRepuesto} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Repuesto *
                  </label>
                  <input
                    type="text"
                    required
                    value={repuesto.codigoRepuesto}
                    onChange={(e) => setRepuesto({...repuesto, codigoRepuesto: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={repuesto.descripcion}
                    onChange={(e) => setRepuesto({...repuesto, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    required
                    value={repuesto.cantidad}
                    onChange={(e) => setRepuesto({...repuesto, cantidad: parseInt(e.target.value) || 1})}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    required
                    value={repuesto.importeUnitario}
                    onChange={(e) => setRepuesto({...repuesto, importeUnitario: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Agregar Repuesto
                </button>
              </div>
            </form>
          )}

          {reparacion.repuestosUsados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left text-gray-900">Código</th>
                    <th className="px-4 py-2 text-left text-gray-900">Descripción</th>
                    <th className="px-4 py-2 text-center text-gray-900">Cantidad</th>
                    <th className="px-4 py-2 text-right text-gray-900">Precio Unit.</th>
                    <th className="px-4 py-2 text-right text-gray-900">Subtotal</th>
                    <th className="px-4 py-2 text-center text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reparacion.repuestosUsados.map(rep => (
                    <tr key={rep.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{rep.codigoRepuesto}</td>
                      <td className="px-4 py-2">{rep.descripcion || '-'}</td>
                      <td className="px-4 py-2 text-center">{rep.cantidad}</td>
                      <td className="px-4 py-2 text-right">${rep.importeUnitario.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-semibold">${rep.subtotal.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center space-x-2">
                        {!reparacion.valorizacion && (
                          <>
                            <button
                              onClick={() => setEditingRepuesto({id: rep.id, cantidad: rep.cantidad, importeUnitario: rep.importeUnitario})}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteRepuesto(rep.id)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold bg-gray-50">
                    <td colSpan={5} className="px-4 py-2 text-right">Total Repuestos:</td>
                    <td className="px-4 py-2 text-right">${totalRepuestos.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No hay repuestos registrados</p>
          )}
        </div>

        {/* Valorizacion Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-gray-900">Valorización</h2>
            {!reparacion.valorizacion && (
              <button
                onClick={() => setShowFormValorizacion(!showFormValorizacion)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                {showFormValorizacion ? 'Cancelar' : '+ Crear Valorización'}
              </button>
            )}
          </div>

          {showFormValorizacion && (
            <form onSubmit={createValorizacion} className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Electricista *
                  </label>
                  <select
                    value={valorizacion.manoObraElectricista}
                    onChange={(e) => setValorizacion({...valorizacion, manoObraElectricista: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Arnau">Arnau</option>
                    <option value="Ivan">Ivan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importe Mano de Obra *
                  </label>
                  <input
                    type="number"
                    required
                    value={valorizacion.importeManoObra}
                    onChange={(e) => setValorizacion({...valorizacion, importeManoObra: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Factura Interna
                  </label>
                  <input
                    type="text"
                    value={valorizacion.numeroFacturaInterna}
                    onChange={(e) => setValorizacion({...valorizacion, numeroFacturaInterna: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Crear Valorización
              </button>
            </form>
          )}

          {reparacion.valorizacion ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Costo Repuestos</p>
                  <p className="text-2xl font-bold text-gray-900">${reparacion.valorizacion.costoRepuestos.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Mano de Obra ({reparacion.valorizacion.manoObraElectricista})</p>
                  <p className="text-2xl font-bold text-gray-900">${reparacion.valorizacion.importeManoObra.toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-600 text-sm mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">${reparacion.valorizacion.subtotal.toFixed(2)}</p>
              </div>

              {reparacion.valorizacion.cotizacion ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600 text-xs">Importe Original</p>
                        <p className="font-semibold text-gray-900">${reparacion.valorizacion.cotizacion.importeOriginal.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Ajuste Pablo</p>
                        <p className="font-semibold text-gray-900">${reparacion.valorizacion.cotizacion.ajustePablo.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-gray-600 text-xs mb-1">Importe Final</p>
                      <p className="text-2xl font-bold text-gray-900">${reparacion.valorizacion.cotizacion.importeFinal.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCotizacion(true)
                      setCotizacionAjuste(reparacion.valorizacion.cotizacion.ajustePablo)
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Editar Cotización
                  </button>
                </div>
              ) : (
                <Link
                  href={`/cotizaciones/nueva?valorizacionId=${reparacion.valorizacion.id}`}
                  className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center text-sm mt-4"
                >
                  Crear Cotización
                </Link>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Cree una valorización para continuar</p>
          )}
        </div>
      </div>
    </div>
  )
}
