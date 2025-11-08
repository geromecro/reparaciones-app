import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipoId, numeroRemitoOficial, numeroRemitoInterno } = body

    if (!equipoId) {
      return NextResponse.json(
        { error: 'equipoId es requerido' },
        { status: 400 }
      )
    }

    const entrega = await prisma.entrega.create({
      data: {
        equipoId: parseInt(equipoId),
        numeroRemitoOficial,
        numeroRemitoInterno,
        estado: 'COMPLETADA'
      },
      include: { equipo: { include: { cliente: true } } }
    })

    // Update equipo estado
    await prisma.equipo.update({
      where: { id: parseInt(equipoId) },
      data: { estado: 'ENTREGADO' }
    })

    return NextResponse.json(entrega, { status: 201 })
  } catch (error) {
    console.error('Error creating entrega:', error)
    return NextResponse.json(
      { error: 'Error creating entrega' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const entregas = await prisma.entrega.findMany({
      include: { equipo: { include: { cliente: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(entregas)
  } catch (error) {
    console.error('Error fetching entregas:', error)
    return NextResponse.json(
      { error: 'Error fetching entregas' },
      { status: 500 }
    )
  }
}
