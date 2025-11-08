import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Using singleton from @/lib/prisma

export async function GET() {
  try {
    const equipos = await prisma.equipo.findMany({
      include: {
        cliente: true,
        reparaciones: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(equipos)
  } catch (error) {
    console.error('Error fetching equipos:', error)
    return NextResponse.json(
      { error: 'Error fetching equipos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clienteId, descripcion, numeroEquipo } = body

    if (!clienteId || !descripcion) {
      return NextResponse.json(
        { error: 'clienteId y descripcion son requeridos' },
        { status: 400 }
      )
    }

    // Generate internal number
    const numeroInterno = `EQUIPO-${Date.now()}`

    const equipo = await prisma.equipo.create({
      data: {
        clienteId: parseInt(clienteId),
        descripcion,
        numeroEquipo,
        numeroInterno
      },
      include: { cliente: true }
    })

    return NextResponse.json(equipo, { status: 201 })
  } catch (error) {
    console.error('Error creating equipo:', error)
    return NextResponse.json(
      { error: 'Error creating equipo' },
      { status: 500 }
    )
  }
}
