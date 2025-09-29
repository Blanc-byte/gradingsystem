export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/sections?teacherId=1 → list sections for teacher
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teacherId = Number(searchParams.get('teacherId'))
  if (!teacherId || Number.isNaN(teacherId)) {
    return NextResponse.json({ error: 'teacherId is required' }, { status: 400 })
  }
  try {
    const sections = await prisma.section.findMany({
      where: { teacherId },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        grade_year: true,
        sy: true,
        locked: true,
        teacherId: true,
      },
    })
    return NextResponse.json({ sections })
  } catch (e) {
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
    const existing = await prisma.section.findFirst({ where: { teacherId: Number(teacherId) } })
    if (existing) {
      return NextResponse.json({ error: 'Teacher already has a section' }, { status: 409 })
    }
    const section = await prisma.section.create({
      data: { name, grade_year, teacherId: Number(teacherId), sy },
    })
    return NextResponse.json({ section }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}


