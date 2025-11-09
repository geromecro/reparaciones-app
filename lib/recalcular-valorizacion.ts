import { prisma } from './prisma'

/**
 * Recalculates Valorizacion and Cotizacion when repuestos are modified/deleted
 * Updates:
 * 1. Valorizacion.costoRepuestos = sum of all repuesto subtotals
 * 2. Valorizacion.subtotal = costoRepuestos + importeManoObra
 * 3. Cotizacion.importeOriginal = new Valorizacion.subtotal
 * 4. Cotizacion.importeFinal = importeOriginal + ajustePablo
 */
export async function recalcularValorizacion(reparacionId: number) {
  try {
    // Get all repuestos for this repair
    const repuestos = await prisma.repuestoUsado.findMany({
      where: { reparacionId }
    })

    // Calculate total cost of parts
    const costoRepuestos = repuestos.reduce((sum, r) => sum + r.subtotal, 0)

    // Get current valorizacion
    const valorizacion = await prisma.valorizacion.findUnique({
      where: { reparacionId },
      include: { cotizacion: true }
    })

    if (!valorizacion) {
      // No valorizacion exists yet, nothing to recalculate
      return null
    }

    // Calculate new subtotal (parts + labor)
    const newSubtotal = costoRepuestos + valorizacion.importeManoObra

    // Update valorizacion with new costs
    const updatedValorizacion = await prisma.valorizacion.update({
      where: { reparacionId },
      data: {
        costoRepuestos,
        subtotal: newSubtotal
      }
    })

    // If quotation exists, update it with new importeOriginal and recalc importeFinal
    if (valorizacion.cotizacion) {
      const updatedCotizacion = await prisma.cotizacion.update({
        where: { id: valorizacion.cotizacion.id },
        data: {
          importeOriginal: newSubtotal,
          importeFinal: newSubtotal + valorizacion.cotizacion.ajustePablo
        }
      })

      return { valorizacion: updatedValorizacion, cotizacion: updatedCotizacion }
    }

    return { valorizacion: updatedValorizacion, cotizacion: null }
  } catch (error) {
    console.error('Error in recalcularValorizacion:', error)
    throw error
  }
}
