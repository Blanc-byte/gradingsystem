import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/grades/exists?sectionId=&subjectId=&quarter=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sectionId = Number(searchParams.get('sectionId'))
  const subjectId = Number(searchParams.get('subjectId'))
  const quarter = Number(searchParams.get('quarter'))
  if (!sectionId || !subjectId || !quarter) {
    return NextResponse.json({ error: 'sectionId, subjectId, quarter required' }, { status: 400 })
  }

  try {
    // Count grades for students in this section for the subject+quarter
    const count = await prisma.grade.count({
      where: {
        subjectId,
        quarter,
        student: { sectionId },
      },
    })
    return NextResponse.json({ exists: count > 0, count })
  } catch {
    return NextResponse.json({ error: 'Failed to check grades' }, { status: 500 })
  }
}


