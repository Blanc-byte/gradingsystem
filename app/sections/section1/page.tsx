'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ToastProvider, { useToast } from '@/app/components/ToastProvider'
import SectionLoadingScreen from '@/app/components/SectionLoadingScreen'

interface DashboardStats {
  totalSections: number
  totalStudents: number
  failedGrades: number
  recentActivity: Array<{
    id: number
    action: string
    timestamp: string
    sectionName?: string
  }>
}

function DashboardInner() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSections: 0,
    totalStudents: 0,
    failedGrades: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const { show } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Load all sections (not just teacher's section for comprehensive stats)
      const sectionRes = await fetch('/api/sections/stats', { cache: 'no-store' })
      const sectionData = await sectionRes.json()
      
      if (!sectionRes.ok) throw new Error(sectionData.error || 'Failed to load sections')
      
      const sections = sectionData.sections || []
      const totalSections = sections.length
      
      // Calculate total students across all sections
      let totalStudents = 0
      let failedGrades = 0
      
      // Load students and grades for each section
      for (const section of sections) {
        const studentsRes = await fetch(`/api/section-students?sectionId=${section.id}`, { cache: 'no-store' })
        const studentsData = await studentsRes.json()
        if (studentsRes.ok) {
          const students = studentsData.students || []
          totalStudents += students.length
          
          // Count failed grades only
          students.forEach((student: any) => {
            if (student.quarters) {
              Object.values(student.quarters).forEach((grade: any) => {
                if (grade !== null && grade !== undefined && grade < 75) {
                  failedGrades++
                }
              })
            }
          })
        }
      }
      
      // Mock recent activity (you can replace with real data later)
      const recentActivity = [
        { id: 1, action: 'Added new student', timestamp: '2 hours ago', sectionName: sections[0]?.name },
        { id: 2, action: 'Submitted grades for Mathematics', timestamp: '1 day ago', sectionName: sections[0]?.name },
        { id: 3, action: 'Updated section information', timestamp: '2 days ago', sectionName: sections[0]?.name },
      ].filter(activity => activity.sectionName) // Only show if section exists
      
      setStats({
        totalSections,
        totalStudents,
        failedGrades,
        recentActivity
      })
    } catch (e: any) {
      show(e.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <SectionLoadingScreen />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Grade Online Management System</h1>
        <p className="text-blue-100 text-lg">Welcome to your comprehensive grading platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Grades</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedGrades}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/sections/section2" className="group">
            <div className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 border border-blue-200 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-blue-900 group-hover:text-blue-800">My Section</p>
                  <p className="text-sm text-blue-600">Manage your section</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sections/section3" className="group">
            <div className="bg-green-50 hover:bg-green-100 rounded-lg p-4 border border-green-200 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-green-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-green-900 group-hover:text-green-800">Submit Grade</p>
                  <p className="text-sm text-green-600">Enter student grades</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sections/section4" className="group">
            <div className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 border border-purple-200 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-purple-900 group-hover:text-purple-800">Reports</p>
                  <p className="text-sm text-purple-600">View grade reports</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/sections/section5" className="group">
            <div className="bg-orange-50 hover:bg-orange-100 rounded-lg p-4 border border-orange-200 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-orange-900 group-hover:text-orange-800">Settings</p>
                  <p className="text-sm text-orange-600">System settings</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Section1Page() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  )
}


