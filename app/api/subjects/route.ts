export const revalidate = 0

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/subjects
export async function GET() {
  try {
    // Primary path: use Prisma model
    const subjects = await prisma.subjects.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ subjects })
  } catch {
    try {
      // Fallback 1: quoted table name "Subjects"
      const rows = await prisma.$queryRawUnsafe<Array<{ id: number; name: string }>>(`SELECT id, name FROM "Subjects" ORDER BY name ASC`)
      return NextResponse.json({ subjects: rows })
    } catch {}
    try {
      // Fallback 2: lowercase table name subjects
      const rows2 = await prisma.$queryRawUnsafe<Array<{ id: number; name: string }>>(`SELECT id, name FROM subjects ORDER BY name ASC`)
      return NextResponse.json({ subjects: rows2 })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
  }
}


