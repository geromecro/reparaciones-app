import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { ajustePablo } = body

    if (ajustePablo === undefined) {
      return NextResponse.json(
        { error: 'ajustePablo es requerido' },
        { status: 400 }
      )
    }

    // Get current cotizacion
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: parseInt(id) }
    })

    if (!cotizacion) {
      return NextResponse.json(
        { error: 'Cotizacion no encontrada' },
        { status: 404 }
      )
    }

    const ajusteNum = parseFloat(ajustePablo.toString())
    const newImporteFinal = cotizacion.importeOriginal + ajusteNum

    // Update cotizacion
    const updatedCotizacion = await prisma.cotizacion.update({
      where: { id: parseInt(id) },
      data: {
        ajustePablo: ajusteNum,
        importeFinal: newImporteFinal
      }
    })

    return NextResponse.json(updatedCotizacion, { status: 200 })
  } catch (error) {
    console.error('Error updating cotizacion:', error)
    return NextResponse.json(
      { error: 'Error updating cotizacion' },
      { status: 500 }
    )
  }
}
