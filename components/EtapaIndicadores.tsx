'use client'

interface EtapaIndicadoresProps {
  reparacion: {
    estado: string
    valorizacion?: {
      id: number
      cotizacion?: {
        id: number
      } | null
    } | null
    repuestosUsados?: Array<any>
  }
}

const EstadoReparacion = {
  RECIBIDO: 'RECIBIDO',
  PRECINTADO: 'PRECINTADO',
  ASIGNADO: 'ASIGNADO',
  DIAGNOSTICO: 'DIAGNOSTICO',
  EN_REPARACION: 'EN_REPARACION',
  ESPERANDO_REPUESTOS: 'ESPERANDO_REPUESTOS',
  VALORIZADO: 'VALORIZADO',
  COTIZADO: 'COTIZADO',
  APROBADO: 'APROBADO',
  FACTURADO: 'FACTURADO',
  LISTO_PARA_RETIRO: 'LISTO_PARA_RETIRO',
  ENTREGADO: 'ENTREGADO',
  CERRADO: 'CERRADO'
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

export default function EtapaIndicadores({ reparacion }: EtapaIndicadoresProps) {
  // Etapa 1 - Recepción: completa cuando estado >= ASIGNADO
  const etapa1Completa = (estadoOrden[reparacion.estado] ?? -1) >= (estadoOrden[EstadoReparacion.ASIGNADO] ?? -1)

  // Etapa 2 - Presupuesto: completa cuando existe valorización
  const etapa2Completa = !!reparacion.valorizacion && (reparacion.repuestosUsados?.length ?? 0) > 0

  // Etapa 3 - Administración: completa cuando existe cotización Y estado >= FACTURADO
  const etapa3Completa =
    !!reparacion.valorizacion?.cotizacion &&
    (estadoOrden[reparacion.estado] ?? -1) >= (estadoOrden[EstadoReparacion.FACTURADO] ?? -1)

  return (
    <div className="flex gap-4 items-center justify-center">
      {/* Etapa 1 - Recepción */}
      <div className="flex flex-col items-center gap-1 cursor-help" title="Recepción - Julio">
        <span
          className={`text-lg font-bold ${etapa1Completa ? 'text-green-600' : 'text-gray-300'}`}
        >
          {etapa1Completa ? '✓' : '○'}
        </span>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          Recepción
        </span>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200"></div>

      {/* Etapa 2 - Presupuesto */}
      <div className="flex flex-col items-center gap-1 cursor-help" title="Presupuesto - Rodríguez">
        <span
          className={`text-lg font-bold ${etapa2Completa ? 'text-green-600' : 'text-gray-300'}`}
        >
          {etapa2Completa ? '✓' : '○'}
        </span>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          Presupuesto
        </span>
      </div>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200"></div>

      {/* Etapa 3 - Administración */}
      <div className="flex flex-col items-center gap-1 cursor-help" title="Administración - Pablo/Mateo">
        <span
          className={`text-lg font-bold ${etapa3Completa ? 'text-green-600' : 'text-gray-300'}`}
        >
          {etapa3Completa ? '✓' : '○'}
        </span>
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          Admin
        </span>
      </div>
    </div>
  )
}
