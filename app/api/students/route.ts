import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/app/lib/supabase'

// POST /api/students → create student
export async function POST(request: NextRequest) {
  try {
    const { fullname, sectionId } = await request.json()
    if (!fullname || !sectionId) {
      return NextResponse.json({ error: 'fullname and sectionId required' }, { status: 400 })
    }
    
    const { data: student, error } = await supabase
      .from('Students')
      .insert({ fullname, sectionId: Number(sectionId) })
      .select()
      .single()
    
    if (error) throw error
    return NextResponse.json({ student }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}


