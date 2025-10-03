import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/section-subjects?sectionId=123
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sectionId = Number(searchParams.get('sectionId'))
  if (!sectionId || Number.isNaN(sectionId)) {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
  }
  try {
    // Find distinct subjectIds that have grades for students in this section
    const rows = await prisma.grade.findMany({
      where: { student: { sectionId } },
      select: { subjectId: true },
      distinct: ['subjectId'],
      orderBy: { subjectId: 'asc' },
    })
    const subjectIds = rows.map((r) => r.subjectId)
    if (subjectIds.length === 0) return NextResponse.json({ subjects: [] })
    const subjects = await prisma.subjects.findMany({
      where: { id: { in: subjectIds } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ subjects })
  } catch {
    // Fallback raw SQL if needed
    try {
      const raw = await prisma.$queryRaw<Array<{ id: number; name: string }>>`
        SELECT s.id, s.name FROM subjects s
        WHERE s.id IN (
          SELECT DISTINCT g."subjectId" FROM grades g
          JOIN students st ON st.id = g."studentId"
          WHERE st."sectionId" = ${sectionId}
        )
        ORDER BY s.name ASC
      `
      return NextResponse.json({ subjects: raw })
    } catch {
      return NextResponse.json({ error: 'Failed to fetch section subjects' }, { status: 500 })
    }
  }
}



