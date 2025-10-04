import { NextRequest, NextResponse } from 'next/server'
import { validateTeacher } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  
  
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const teacher = await validateTeacher(username, password)

    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // In a real app, you'd set a JWT token or session cookie here
    console.log('DB URL:', process.env.DATABASE_URL)
    return NextResponse.json({
      success: true,
      teacher
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
