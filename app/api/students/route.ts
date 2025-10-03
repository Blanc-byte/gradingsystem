import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// POST /api/students → create student
export async function POST(request: NextRequest) {
  try {
    const { fullname, sectionId } = await request.json()
    if (!fullname || !sectionId) {
      return NextResponse.json({ error: 'fullname and sectionId required' }, { status: 400 })
    }
    const student = await prisma.students.create({
      data: { fullname, sectionId: Number(sectionId) },
    })
    return NextResponse.json({ student }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}


