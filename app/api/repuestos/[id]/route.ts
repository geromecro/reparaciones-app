import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalcularValorizacion } from '@/lib/recalcular-valorizacion'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { cantidad, importeUnitario } = body

    if (!cantidad || importeUnitario === undefined) {
      return NextResponse.json(
        { error: 'cantidad e importeUnitario son requeridos' },
        { status: 400 }
      )
    }

    // Get existing repuesto to find reparacionId
    const existingRepuesto = await prisma.repuestoUsado.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingRepuesto) {
      return NextResponse.json(
        { error: 'Repuesto no encontrado' },
        { status: 404 }
      )
    }

    const cantidadNum = parseInt(cantidad.toString())
    const importeNum = parseFloat(importeUnitario.toString())
    const newSubtotal = cantidadNum * importeNum

    // Update repuesto with new values
    const updatedRepuesto = await prisma.repuestoUsado.update({
      where: { id: parseInt(id) },
      data: {
        cantidad: cantidadNum,
        importeUnitario: importeNum,
        subtotal: newSubtotal
      }
    })

    // Recalculate valorizacion and cotizacion
    await recalcularValorizacion(existingRepuesto.reparacionId)

    return NextResponse.json(updatedRepuesto, { status: 200 })
  } catch (error) {
    console.error('Error updating repuesto:', error)
    return NextResponse.json(
      { error: 'Error updating repuesto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get repuesto before deletion to find reparacionId
    const repuesto = await prisma.repuestoUsado.findUnique({
      where: { id: parseInt(id) }
    })

    if (!repuesto) {
      return NextResponse.json(
        { error: 'Repuesto no encontrado' },
        { status: 404 }
      )
    }

    const reparacionId = repuesto.reparacionId

    // Delete repuesto
    await prisma.repuestoUsado.delete({
      where: { id: parseInt(id) }
    })

    // Recalculate valorizacion and cotizacion
    await recalcularValorizacion(reparacionId)

    return NextResponse.json(
      { message: 'Repuesto eliminado correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting repuesto:', error)
    return NextResponse.json(
      { error: 'Error deleting repuesto' },
      { status: 500 }
    )
  }
}
