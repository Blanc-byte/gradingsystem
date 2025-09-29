'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

interface Teacher {
  id: number
  fullname: string
  username: string
  role: string
}

export default function SectionsLayout({ children }: { children: React.ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [activeSection, setActiveSection] = useState('section1')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher')
    if (!teacherData) {
      router.push('/login')
      return
    }
    try {
      setTeacher(JSON.parse(teacherData))
    } catch {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    const match = pathname?.match(/section(\d+)/)
    if (match) {
      setActiveSection(`section${match[1]}`)
    }
  }, [pathname])

  if (!teacher) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header teacherName={teacher.fullname} />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(s) => router.push(`/sections/${s}`)}
        />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


