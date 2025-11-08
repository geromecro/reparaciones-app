import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const reparaciones = await prisma.reparacion.findMany({
      include: {
        equipo: {
          include: { cliente: true }
        },
        repuestosUsados: true,
        valorizacion: {
          include: { cotizacion: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(reparaciones)
  } catch (error) {
    console.error('Error fetching reparaciones:', error)
    return NextResponse.json(
      { error: 'Error fetching reparaciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipoId, electricista, precintoNumero, fechaEntregaEstimada } = body

    if (!equipoId || !electricista) {
      return NextResponse.json(
        { error: 'equipoId y electricista son requeridos' },
        { status: 400 }
      )
    }

    const reparacion = await prisma.reparacion.create({
      data: {
        equipoId: parseInt(equipoId),
        electricista,
        precintoNumero,
        fechaEntregaEstimada: fechaEntregaEstimada ? new Date(fechaEntregaEstimada) : undefined
      },
      include: {
        equipo: { include: { cliente: true } },
        repuestosUsados: true
      }
    })

    // Update equipo estado
    await prisma.equipo.update({
      where: { id: parseInt(equipoId) },
      data: { estado: 'EN_REPARACION' }
    })

    return NextResponse.json(reparacion, { status: 201 })
  } catch (error) {
    console.error('Error creating reparacion:', error)
    return NextResponse.json(
      { error: 'Error creating reparacion' },
      { status: 500 }
    )
  }
}
