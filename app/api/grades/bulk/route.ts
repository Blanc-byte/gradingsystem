import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

type GradeItem = {
  studentId: number
  subjectId: number
  quarter: number
  grade: number
}

type RawItem = {
  studentId: unknown
  subjectId: unknown
  quarter: unknown
  grade: unknown
}

// POST /api/grades/bulk { sectionId, items: [{ studentId, subjectId, quarter, grade }] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sectionId = Number(body.sectionId)
    const items: RawItem[] = Array.isArray(body.items) ? (body.items as RawItem[]) : []
    if (!sectionId || items.length === 0) {
      return NextResponse.json({ error: 'sectionId and items required' }, { status: 400 })
    }

    // Read subjectId from first item; DB constraint will enforce validity
    const subjectId = Number(items?.[0]?.subjectId)
    if (!subjectId) {
      return NextResponse.json({ error: 'subjectId required on items' }, { status: 400 })
    }

    // Ensure students belong to the section and sanitize items
    const studentIds = items
      .map((i: RawItem) => Number(i.studentId))
      .filter((n: number) => Number.isFinite(n))
    const validStudents = await prisma.students.findMany({ where: { id: { in: studentIds }, sectionId }, select: { id: true } })
    const validSet = new Set(validStudents.map((s) => s.id))

    const sanitized: GradeItem[] = items
      .map((i: RawItem): GradeItem => ({
        studentId: Number(i.studentId),
        subjectId: Number(i.subjectId),
        quarter: Number(i.quarter),
        grade: Number(i.grade),
      }))
      .filter((i: GradeItem) =>
        validSet.has(i.studentId) &&
        i.quarter >= 1 &&
        i.quarter <= 4 &&
        Number.isFinite(i.grade)
      )

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'No valid grade items to submit' }, { status: 400 })
    }

    // Manual upsert within a transaction (studentId+subjectId+quarter)
    await prisma.$transaction(async (tx) => {
      for (const i of sanitized) {
        const existing = await tx.grade.findFirst({
          where: { studentId: i.studentId, subjectId: i.subjectId, quarter: i.quarter },
        })
        if (existing) {
          await tx.grade.update({ where: { id: existing.id }, data: { grade: i.grade } })
        } else {
          await tx.grade.create({ data: { studentId: i.studentId, subjectId: i.subjectId, quarter: i.quarter, grade: i.grade } })
        }
      }
    })

    return NextResponse.json({ success: true, count: sanitized.length })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to submit grades'
    console.error('grades/bulk error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


