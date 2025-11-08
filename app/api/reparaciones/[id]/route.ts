import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Using singleton from @/lib/prisma

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reparacion = await prisma.reparacion.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipo: { include: { cliente: true } },
        repuestosUsados: true,
        valorizacion: {
          include: { cotizacion: true }
        }
      }
    })

    if (!reparacion) {
      return NextResponse.json(
        { error: 'Reparacion no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(reparacion)
  } catch (error) {
    console.error('Error fetching reparacion:', error)
    return NextResponse.json(
      { error: 'Error fetching reparacion' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Si hay cambio de estado, registrar en historial
    if (body.estado) {
      const reparacionActual = await prisma.reparacion.findUnique({
        where: { id: parseInt(id) }
      })

      if (reparacionActual && reparacionActual.estado !== body.estado) {
        await prisma.historialEstado.create({
          data: {
            reparacionId: parseInt(id),
            estadoAnterior: reparacionActual.estado,
            estadoNuevo: body.estado
          }
        })
      }
    }

    const reparacion = await prisma.reparacion.update({
      where: { id: parseInt(id) },
      data: body,
      include: {
        equipo: { include: { cliente: true } },
        repuestosUsados: true,
        valorizacion: {
          include: { cotizacion: true }
        }
      }
    })

    return NextResponse.json(reparacion)
  } catch (error) {
    console.error('Error updating reparacion:', error)
    return NextResponse.json(
      { error: 'Error updating reparacion' },
      { status: 500 }
    )
  }
}
