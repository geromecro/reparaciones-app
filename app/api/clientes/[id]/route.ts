import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Using singleton from @/lib/prisma

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: { equipos: true }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error fetching cliente:', error)
    return NextResponse.json(
      { error: 'Error fetching cliente' },
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
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: body
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error updating cliente:', error)
    return NextResponse.json(
      { error: 'Error updating cliente' },
      { status: 500 }
    )
  }
}
