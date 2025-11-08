import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reparacionId, codigoRepuesto, descripcion, cantidad, importeUnitario } = body

    if (!reparacionId || !codigoRepuesto || !cantidad || importeUnitario === undefined) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    const subtotal = cantidad * importeUnitario

    const repuesto = await prisma.repuestoUsado.create({
      data: {
        reparacionId: parseInt(reparacionId),
        codigoRepuesto,
        descripcion,
        cantidad: parseInt(cantidad),
        importeUnitario: parseFloat(importeUnitario),
        subtotal
      }
    })

    return NextResponse.json(repuesto, { status: 201 })
  } catch (error) {
    console.error('Error creating repuesto:', error)
    return NextResponse.json(
      { error: 'Error creating repuesto' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reparacionId = searchParams.get('reparacionId')

    if (!reparacionId) {
      return NextResponse.json(
        { error: 'reparacionId es requerido' },
        { status: 400 }
      )
    }

    const repuestos = await prisma.repuestoUsado.findMany({
      where: { reparacionId: parseInt(reparacionId) }
    })

    return NextResponse.json(repuestos)
  } catch (error) {
    console.error('Error fetching repuestos:', error)
    return NextResponse.json(
      { error: 'Error fetching repuestos' },
      { status: 500 }
    )
  }
}
