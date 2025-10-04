import supabase from './supabase'
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createTeacher(data: {
  fullname: string
  username: string
  password: string
  role: string
}) {
  const hashedPassword = await hashPassword(data.password)
  
  const { data: teacher, error } = await supabase
    .from('Teachers')
    .insert({
      ...data,
      password: hashedPassword
    })
    .select()
    .single()

  if (error) throw error
  return teacher
}

export async function findTeacherByUsername(username: string) {
  const { data: teacher, error } = await supabase
    .from('Teachers')
    .select('*')
    .eq('username', username)
    .single()

  if (error) return null
  return teacher
}

export async function validateTeacher(username: string, password: string) {
  const teacher = await findTeacherByUsername(username)
  
  if (!teacher) {
    return null
  }
  
  const isValid = await verifyPassword(password, teacher.password)
  
  if (!isValid) {
    return null
  }
  
  return {
    id: teacher.id,
    fullname: teacher.fullname,
    username: teacher.username,
    role: teacher.role
  }
}
