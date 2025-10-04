export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/app/lib/supabase'

// GET /api/sections/:id → fetch single section
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const { data: section, error } = await supabase
      .from('Section')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    return NextResponse.json({ section })
  } catch {
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
    const data: { name?: string; grade_year?: number; sy?: string; locked?: boolean } = {}
    if (body.name !== undefined) data.name = body.name
    if (body.grade_year !== undefined) data.grade_year = body.grade_year
    if (body.sy !== undefined) data.sy = body.sy
    if (body.locked !== undefined) data.locked = Boolean(body.locked)
    
    const { data: section, error } = await supabase
      .from('Section')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ section })
  } catch {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

// DELETE /api/sections/:id
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params
  const id = Number(idStr)
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  try {
    const { error } = await supabase
      .from('Section')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}


