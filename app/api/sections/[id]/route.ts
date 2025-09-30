export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/sections/:id → fetch single section
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const section = await prisma.section.findUnique({ where: { id } })
    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    return NextResponse.json({ section })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 })
  }
}

// PATCH /api/sections/:id
export async function PATCH(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const body = await _request.json()
    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.grade_year !== undefined) data.grade_year = body.grade_year
    if (body.sy !== undefined) data.sy = body.sy
    if (body.locked !== undefined) data.locked = Boolean(body.locked)
    const section = await prisma.section.update({ where: { id }, data })
    return NextResponse.json({ section })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

// DELETE /api/sections/:id
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    await prisma.section.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}


