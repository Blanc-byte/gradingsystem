import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/section-students?sectionId=123
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sectionId = Number(searchParams.get('sectionId'))
  const subjectIdParam = searchParams.get('subjectId')
  const subjectId = subjectIdParam ? Number(subjectIdParam) : undefined
  if (!sectionId || Number.isNaN(sectionId)) {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
  }
  try {
    const rawStudents = await prisma.students.findMany({
      where: { sectionId },
      orderBy: { id: 'desc' },
      select: { id: true, fullname: true, sectionId: true },
    })

    // Prefer raw SQL to avoid any Prisma relational mapping issues
    const studentIds = rawStudents.map((s) => s.id)
    let gradeRows: Array<{ sid: number; quarter: number; grade: number; id?: number }> = []
    if (studentIds.length > 0) {
      try {
        // lowercase table
        if (subjectId) {
          gradeRows = await prisma.$queryRaw<Array<{ sid: number; quarter: number; grade: number; id: number }>>`
            SELECT "studentId" as sid, quarter, grade, id FROM grades
            WHERE "studentId" = ANY(${studentIds}) AND quarter IN (1,2,3,4) AND "subjectId" = ${subjectId}
            ORDER BY id DESC
          `
        } else {
          gradeRows = await prisma.$queryRaw<Array<{ sid: number; quarter: number; grade: number; id: number }>>`
            SELECT "studentId" as sid, quarter, grade, id FROM grades
            WHERE "studentId" = ANY(${studentIds}) AND quarter IN (1,2,3,4)
            ORDER BY id DESC
          `
        }
      } catch {}
      if (gradeRows.length === 0) {
        try {
          // PascalCase table
          if (subjectId) {
            gradeRows = await prisma.$queryRaw<Array<{ sid: number; quarter: number; grade: number; id: number }>>`
              SELECT "studentId" as sid, quarter, grade, id FROM "Grade"
              WHERE "studentId" = ANY(${studentIds}) AND quarter IN (1,2,3,4) AND "subjectId" = ${subjectId}
              ORDER BY id DESC
            `
          } else {
            gradeRows = await prisma.$queryRaw<Array<{ sid: number; quarter: number; grade: number; id: number }>>`
              SELECT "studentId" as sid, quarter, grade, id FROM "Grade"
              WHERE "studentId" = ANY(${studentIds}) AND quarter IN (1,2,3,4)
              ORDER BY id DESC
            `
          }
        } catch {}
      }
    }

    const grouped: Record<number, { quarter: number; grade: number; id?: number }[]> = {}
    for (const r of gradeRows) {
      const sid = Number(r.sid)
      const list = grouped[sid] ?? []
      list.push({ quarter: Number(r.quarter), grade: Number(r.grade), id: r.id })
      grouped[sid] = list
    }
    const students = rawStudents.map((s) => {
      const quarters: Record<number, number | null> = { 1: null, 2: null, 3: null, 4: null }
      const sourceGrades = grouped[s.id] ?? []
      for (const g of sourceGrades as any[]) {
        const q = Number((g as any).quarter)
        if (q >= 1 && q <= 4) {
          // choose latest by id
          if (quarters[q] == null) {
            quarters[q] = Number((g as any).grade)
          }
        }
      }
      return {
        id: s.id,
        fullname: s.fullname,
        sectionId: s.sectionId,
        grades: sourceGrades,
        quarters,
      }
    })
    return NextResponse.json({ students })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}


