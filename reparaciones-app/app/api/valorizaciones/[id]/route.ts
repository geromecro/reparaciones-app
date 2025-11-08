import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const valorizacion = await prisma.valorizacion.findUnique({
      where: { id: parseInt(id) },
      include: {
        reparacion: {
          include: { equipo: { include: { cliente: true } } }
        },
        cotizacion: true
      }
    })

    if (!valorizacion) {
      return NextResponse.json(
        { error: 'Valorizacion no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(valorizacion)
  } catch (error) {
    console.error('Error fetching valorizacion:', error)
    return NextResponse.json(
      { error: 'Error fetching valorizacion' },
      { status: 500 }
    )
  }
}
