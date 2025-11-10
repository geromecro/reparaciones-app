'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Cliente {
  id: number
  nombre: string
  telefono: string
  empresa?: string
}

export default function NuevaReparacion() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Cliente, 2: Equipo, 3: Asignación
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchCliente, setSearchCliente] = useState('')
  const [showNewCliente, setShowNewCliente] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form data
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    email: ''
  })
  const [equipo, setEquipo] = useState({
    descripcion: '',
    numeroInterno: ''
  })
  const [reparacion, setReparacion] = useState({
    electricista: '',
    precintoNumero: ''
  })

  // Step 1: Search or create client
  const searchClientes = async (nombre: string) => {
    if (!nombre) {
      setClientes([])
      return
    }
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      const filtered = data.filter((c: Cliente) =>
        c.nombre.toLowerCase().includes(nombre.toLowerCase())
      )
      setClientes(filtered)
    } catch (error) {
      console.error('Error searching clientes:', error)
    }
  }

  const createNewCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      })
      if (res.ok) {
        const cliente = await res.json()
        setClienteSeleccionado(cliente)
        setShowNewCliente(false)
        setStep(2)
      }
    } catch (error) {
      console.error('Error creating cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setStep(2)
  }

  const createEquipo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteSeleccionado) return

    setLoading(true)
    try {
      const res = await fetch('/api/equipos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: clienteSeleccionado.id,
          ...equipo
        })
      })
      if (res.ok) {
        const equipoData = await res.json()
        // Move to step 3 with equipo id
        sessionStorage.setItem('equipoId', equipoData.id)
        setStep(3)
      }
    } catch (error) {
      console.error('Error creating equipo:', error)
    } finally {
      setLoading(false)
    }
  }

  const createReparacion = async (e: React.FormEvent) => {
    e.preventDefault()
    const equipoId = sessionStorage.getItem('equipoId')
    if (!equipoId) return

    setLoading(true)
    try {
      const res = await fetch('/api/reparaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipoId: parseInt(equipoId),
          ...reparacion
        })
      })
      if (res.ok) {
        const reparacionData = await res.json()
        sessionStorage.removeItem('equipoId')
        router.push(`/reparaciones/${reparacionData.id}`)
      }
    } catch (error) {
      console.error('Error creating reparacion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-300 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nueva Reparación
          </h1>
          <p className="text-sm text-gray-600">
            Paso {step} de 3
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 bg-white border border-gray-300 p-8">
          <div className="flex justify-between items-center gap-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                  s <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                <p className="text-xs font-medium text-gray-700 mt-3 text-center">
                  {s === 1 && 'Cliente'}
                  {s === 2 && 'Equipo'}
                  {s === 3 && 'Reparación'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Forms */}
        <div className="bg-white border border-gray-300 p-10">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {showNewCliente ? 'Nuevo Cliente' : 'Seleccionar Cliente'}
              </h2>

              {!showNewCliente ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Buscar Cliente
                    </label>
                    <input
                      type="text"
                      value={searchCliente}
                      onChange={(e) => {
                        setSearchCliente(e.target.value)
                        searchClientes(e.target.value)
                      }}
                      placeholder="Nombre del cliente..."
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {clientes.length > 0 ? (
                    <div className="space-y-0 bg-gray-50 border border-gray-300">
                      {clientes.map(c => (
                        <button
                          key={c.id}
                          onClick={() => selectCliente(c)}
                          className="w-full text-left p-4 border-b border-gray-300 hover:bg-white last:border-b-0 transition"
                        >
                          <p className="font-semibold text-gray-900">{c.nombre}</p>
                          <p className="text-sm text-gray-600">{c.empresa || 'Sin empresa'}</p>
                          <p className="text-sm text-gray-600">{c.telefono}</p>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <button
                    onClick={() => setShowNewCliente(true)}
                    className="w-full bg-gray-600 text-white px-4 py-3 hover:bg-gray-700 font-medium transition-colors"
                  >
                    + Crear Nuevo Cliente
                  </button>
                </div>
              ) : (
                <form onSubmit={createNewCliente} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoCliente.nombre}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={nuevoCliente.empresa}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, empresa: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={nuevoCliente.telefono}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={nuevoCliente.email}
                      onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowNewCliente(false)}
                      className="flex-1 bg-gray-300 text-gray-900 px-4 py-3 hover:bg-gray-400 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                    >
                      {loading ? 'Creando...' : 'Crear Cliente'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={createEquipo} className="space-y-6">
              <div className="pb-8 border-b border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Datos del Equipo
                </h2>
                <p className="text-sm text-gray-600">
                  Cliente: <span className="font-semibold text-gray-900">{clienteSeleccionado?.nombre}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento/Seguimiento *
                </label>
                <input
                  type="text"
                  required
                  value={equipo.numeroInterno}
                  onChange={(e) => setEquipo({...equipo, numeroInterno: e.target.value})}
                  placeholder="Ej: 2025-001"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Equipo *
                </label>
                <textarea
                  required
                  value={equipo.descripcion}
                  onChange={(e) => setEquipo({...equipo, descripcion: e.target.value})}
                  placeholder="Ej: Alternador Bosch 150A"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 text-gray-900 px-4 py-3 hover:bg-gray-400 font-medium transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? 'Guardando...' : 'Siguiente →'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={createReparacion} className="space-y-6">
              <div className="pb-8 border-b border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900">
                  Asignar Reparación
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Electricista
                </label>
                <select
                  value={reparacion.electricista}
                  onChange={(e) => setReparacion({...reparacion, electricista: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin asignar</option>
                  <option value="Arnau">Arnau</option>
                  <option value="Ivan">Ivan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Precinto
                </label>
                <input
                  type="text"
                  value={reparacion.precintoNumero}
                  onChange={(e) => setReparacion({...reparacion, precintoNumero: e.target.value})}
                  placeholder="Ej: PRECINTO-001"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-300 text-gray-900 px-4 py-3 hover:bg-gray-400 font-medium transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-3 hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Reparación'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-900 font-medium transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
