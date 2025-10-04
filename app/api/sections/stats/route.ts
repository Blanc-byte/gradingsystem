export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/app/lib/supabase'

// GET /api/sections/stats?grade_year=&sy=&q=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gradeYearParam = searchParams.get('grade_year')
  const sy = searchParams.get('sy') || undefined
  const q = searchParams.get('q') || undefined

  const grade_year = gradeYearParam ? Number(gradeYearParam) : undefined

  try {
    let query = supabase
      .from('Section')
      .select(`
        id,
        name,
        sy,
        grade_year,
        locked,
        teacher:Teachers(fullname),
        students:Students(count)
      `)
      .order('id', { ascending: false })

    if (grade_year) query = query.eq('grade_year', grade_year)
    if (sy) query = query.eq('sy', sy)
    if (q) query = query.ilike('name', `%${q}%`)

    const { data: sections, error } = await query

    if (error) throw error
    return NextResponse.json({ sections })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch section stats' }, { status: 500 })
  }
}


