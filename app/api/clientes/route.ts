import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(clientes)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[API /clientes GET] Error:', {
      message: errorMessage,
      dbConfigured: !!process.env.DATABASE_URL
    })
    return NextResponse.json(
      { error: 'Error fetching clientes', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, empresa, telefono, email, direccion } = body

    if (!nombre || !telefono) {
      return NextResponse.json(
        { error: 'nombre y telefono son requeridos' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        empresa,
        telefono,
        email,
        direccion
      }
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[API /clientes POST] Error:', {
      message: errorMessage,
      dbConfigured: !!process.env.DATABASE_URL
    })
    return NextResponse.json(
      { error: 'Error creating cliente', details: errorMessage },
      { status: 500 }
    )
  }
}
