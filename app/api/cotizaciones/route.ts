import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { valorizacionId, ajustePablo } = body

    if (!valorizacionId) {
      return NextResponse.json(
        { error: 'valorizacionId es requerido' },
        { status: 400 }
      )
    }

    const valorizacion = await prisma.valorizacion.findUnique({
      where: { id: parseInt(valorizacionId) }
    })

    if (!valorizacion) {
      return NextResponse.json(
        { error: 'Valorizacion no encontrada' },
        { status: 404 }
      )
    }

    const importeFinal = valorizacion.subtotal + (ajustePablo || 0)

    const cotizacion = await prisma.cotizacion.create({
      data: {
        valorizacionId: parseInt(valorizacionId),
        importeOriginal: valorizacion.subtotal,
        ajustePablo: parseFloat(ajustePablo || '0'),
        importeFinal
      },
      include: { valorizacion: true }
    })

    return NextResponse.json(cotizacion, { status: 201 })
  } catch (error) {
    console.error('Error creating cotizacion:', error)
    return NextResponse.json(
      { error: 'Error creating cotizacion' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    let where: any = { estado: { not: 'COMPLETADA' } }
    if (estado) {
      where.estado = estado
    }

    const cotizaciones = await prisma.cotizacion.findMany({
      where,
      include: {
        valorizacion: {
          include: {
            reparacion: {
              include: { equipo: { include: { cliente: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(cotizaciones)
  } catch (error) {
    console.error('Error fetching cotizaciones:', error)
    return NextResponse.json(
      { error: 'Error fetching cotizaciones' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cotizacionId, estado } = body

    if (!cotizacionId) {
      return NextResponse.json(
        { error: 'cotizacionId es requerido' },
        { status: 400 }
      )
    }

    const cotizacion = await prisma.cotizacion.update({
      where: { id: parseInt(cotizacionId) },
      data: { estado },
      include: { valorizacion: true }
    })

    return NextResponse.json(cotizacion)
  } catch (error) {
    console.error('Error updating cotizacion:', error)
    return NextResponse.json(
      { error: 'Error updating cotizacion' },
      { status: 500 }
    )
  }
}
