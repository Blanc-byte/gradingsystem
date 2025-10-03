export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/sections/stats?grade_year=&sy=&q=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gradeYearParam = searchParams.get('grade_year')
  const sy = searchParams.get('sy') || undefined
  const q = searchParams.get('q') || undefined

  const grade_year = gradeYearParam ? Number(gradeYearParam) : undefined

  try {
    const sections = await prisma.section.findMany({
      where: {
        ...(grade_year ? { grade_year } : {}),
        ...(sy ? { sy } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      select: {
        id: true,
        name: true,
        sy: true,
        grade_year: true,
        locked: true,
        teacher: { select: { fullname: true } },
        _count: { select: { students: true } },
      },
      orderBy: { id: 'desc' },
    })

    return NextResponse.json({ sections })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch section stats' }, { status: 500 })
  }
}


