import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/app/lib/supabase'

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
    
    const { data: student, error } = await supabase
      .from('Students')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
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
    const { error } = await supabase
      .from('Students')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}


