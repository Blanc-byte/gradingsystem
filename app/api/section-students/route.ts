import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/section-students?sectionId=123
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sectionId = Number(searchParams.get('sectionId'))
  if (!sectionId || Number.isNaN(sectionId)) {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
  }
  try {
    const students = await prisma.students.findMany({
      where: { sectionId },
      orderBy: { id: 'desc' },
      include: {
        grades: {
          select: { quarter: true, grade: true },
        },
      },
    })
    return NextResponse.json({ students })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}


