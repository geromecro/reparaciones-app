import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params

    // Buscar equipo por numeroInterno
    const equipo = await prisma.equipo.findUnique({
      where: { numeroInterno: codigo },
      include: {
        cliente: {
          select: { nombre: true, telefono: true }
        },
        reparaciones: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            historial: {
              orderBy: { fechaCambio: 'desc' }
            }
          }
        }
      }
    })

    if (!equipo || equipo.reparaciones.length === 0) {
      return NextResponse.json(
        { error: 'Reparación no encontrada' },
        { status: 404 }
      )
    }

    const reparacion = equipo.reparaciones[0]

    return NextResponse.json({
      equipo: {
        id: equipo.id,
        descripcion: equipo.descripcion,
        numeroInterno: equipo.numeroInterno,
        fechaRecepcion: equipo.fechaRecepcion,
        cliente: equipo.cliente
      },
      reparacion: {
        id: reparacion.id,
        estado: reparacion.estado,
        electricista: reparacion.electricista,
        createdAt: reparacion.createdAt
      },
      historial: reparacion.historial
    })
  } catch (error) {
    console.error('Error in seguimiento:', error)
    return NextResponse.json(
      { error: 'Error al consultar seguimiento' },
      { status: 500 }
    )
  }
}
