'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

interface Teacher {
  id: number
  fullname: string
  username: string
  role: string
}

export default function DashboardPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [activeSection, setActiveSection] = useState('section1')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if teacher is logged in
    const teacherData = localStorage.getItem('teacher')
    if (!teacherData) {
      router.push('/login')
      return
    }

    try {
      const parsedTeacher = JSON.parse(teacherData)
      setTeacher(parsedTeacher)
    } catch (error) {
      console.error('Error parsing teacher data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header teacherName={teacher.fullname} />
      
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {teacher.fullname}!
            </h1>
            <p className="text-gray-600 mb-6">
              You are currently viewing: <span className="font-medium text-blue-600">
                {activeSection.replace('section', 'Section ')}
              </span>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Dashboard Overview
              </h3>
              <p className="text-blue-700">
                This is your professional grading system dashboard. Use the navigation on the left to switch between different sections.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
