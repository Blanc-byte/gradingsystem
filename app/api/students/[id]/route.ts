import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// PATCH /api/students/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const body = await request.json()
    const data: { fullname?: string } = {}
    if (body.fullname !== undefined) data.fullname = body.fullname
    const student = await prisma.students.update({ where: { id }, data })
    return NextResponse.json({ student })
  } catch {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

// DELETE /api/students/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    await prisma.students.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}


