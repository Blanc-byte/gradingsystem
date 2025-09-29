import { NextRequest, NextResponse } from 'next/server'
import { createTeacher, findTeacherByUsername } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { fullname, username, password, role } = await request.json()

    if (!fullname || !username || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingTeacher = await findTeacherByUsername(username)
    if (existingTeacher) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    const teacher = await createTeacher({
      fullname,
      username,
      password,
      role
    })

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        fullname: teacher.fullname,
        username: teacher.username,
        role: teacher.role
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
