import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reparacionId, manoObraElectricista, importeManoObra, numeroFacturaInterna } = body

    if (!reparacionId || !manoObraElectricista || !importeManoObra) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Get all parts for this repair
    const repuestos = await prisma.repuestoUsado.findMany({
      where: { reparacionId: parseInt(reparacionId) }
    })

    const costoRepuestos = repuestos.reduce((sum, r) => sum + r.subtotal, 0)
    const subtotal = costoRepuestos + importeManoObra

    const valorizacion = await prisma.valorizacion.create({
      data: {
        reparacionId: parseInt(reparacionId),
        costoRepuestos,
        manoObraElectricista,
        importeManoObra: parseFloat(importeManoObra),
        subtotal,
        numeroFacturaInterna
      },
      include: { reparacion: true }
    })

    return NextResponse.json(valorizacion, { status: 201 })
  } catch (error) {
    console.error('Error creating valorizacion:', error)
    return NextResponse.json(
      { error: 'Error creating valorizacion' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reparacionId = searchParams.get('reparacionId')

    let where: any = {}
    if (reparacionId) {
      where.reparacionId = parseInt(reparacionId)
    }

    const valorizaciones = await prisma.valorizacion.findMany({
      where,
      include: { reparacion: { include: { equipo: { include: { cliente: true } } } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(valorizaciones)
  } catch (error) {
    console.error('Error fetching valorizaciones:', error)
    return NextResponse.json(
      { error: 'Error fetching valorizaciones' },
      { status: 500 }
    )
  }
}
