import { prisma } from './prisma'
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
  
  return prisma.teachers.create({
    data: {
      ...data,
      password: hashedPassword
    }
  })
}

export async function findTeacherByUsername(username: string) {
  return prisma.teachers.findUnique({
    where: { username }
  })
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
