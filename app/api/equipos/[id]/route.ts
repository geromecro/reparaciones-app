import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const equipo = await prisma.equipo.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        reparaciones: {
          include: {
            repuestosUsados: true,
            valorizacion: {
              include: { cotizacion: true }
            }
          }
        },
        entregas: true
      }
    })

    if (!equipo) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(equipo)
  } catch (error) {
    console.error('Error fetching equipo:', error)
    return NextResponse.json(
      { error: 'Error fetching equipo' },
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
    const equipo = await prisma.equipo.update({
      where: { id: parseInt(id) },
      data: body,
      include: { cliente: true }
    })

    return NextResponse.json(equipo)
  } catch (error) {
    console.error('Error updating equipo:', error)
    return NextResponse.json(
      { error: 'Error updating equipo' },
      { status: 500 }
    )
  }
}
