export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/app/lib/supabase'

// GET /api/sections?teacherId=1 → list sections for teacher
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teacherId = Number(searchParams.get('teacherId'))
  if (!teacherId || Number.isNaN(teacherId)) {
    return NextResponse.json({ error: 'teacherId is required' }, { status: 400 })
  }
  try {
    const { data: sections, error } = await supabase
      .from('Section')
      .select('id, name, grade_year, sy, locked, teacherId')
      .eq('teacherId', teacherId)
      .order('id', { ascending: false })

    if (error) throw error
    return NextResponse.json({ sections })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

// POST /api/sections → create section for teacher
export async function POST(request: NextRequest) {
  try {
    const { name, grade_year, teacherId, sy } = await request.json()
    if (!name || !grade_year || !teacherId) {
      return NextResponse.json({ error: 'name, grade_year, teacherId required' }, { status: 400 })
    }
    // Enforce one section per teacher in API
    const { data: existing } = await supabase
      .from('Section')
      .select('id')
      .eq('teacherId', Number(teacherId))
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Teacher already has a section' }, { status: 409 })
    }
    
    const { data: section, error } = await supabase
      .from('Section')
      .insert({ name, grade_year, teacherId: Number(teacherId), sy })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ section }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}


