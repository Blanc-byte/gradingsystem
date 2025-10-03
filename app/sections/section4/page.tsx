'use client'

import { useState, useEffect } from 'react'
import ToastProvider, { useToast } from '@/app/components/ToastProvider'
import ReportsLoadingScreen from '@/app/components/ReportsLoadingScreen'

interface Section {
  id: number
  name: string
  sy: string
  grade_year: number
}

interface Student {
  id: number
  fullname: string
  quarters: Record<number, number | null>
  generalAverage?: number
  remarks?: string
}

interface Subject {
  id: number
  name: string
}

interface StudentReport {
  studentId: number
  studentName: string
  gradeYear: number
  sectionName: string
  sy: string
  subjects: Array<{
    name: string
    quarters: Record<number, number | null>
    final: number
  }>
  generalAverage: number
  remarks: string
  adviserName: string
  principalName: string
}

function ReportsInner() {
  const [section, setSection] = useState<Section | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const { show } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Check if teacher is logged in
      const teacherData = localStorage.getItem('teacher')
      if (!teacherData) {
        show('Please log in first')
        return
      }

      const teacher = JSON.parse(teacherData)
      if (!teacher || !teacher.id) {
        show('Invalid teacher data. Please log in again.')
        return
      }

      // Load teacher's section with teacherId parameter (same as Section 2)
      const sectionRes = await fetch(`/api/sections?teacherId=${teacher.id}`, { cache: 'no-store' })
      const sectionData = await sectionRes.json()
      
      if (!sectionRes.ok) throw new Error(sectionData.error || 'Failed to load section')
      
      const sections = sectionData.sections || []
      if (sections.length === 0) {
        show('No section found. Please create a section first.')
        return
      }
      
      setSection(sections[0])
      
      // Load subjects first
      const subjectsRes = await fetch('/api/subjects', { cache: 'no-store' })
      const subjectsData = await subjectsRes.json()
      
      if (!subjectsRes.ok) throw new Error(subjectsData.error || 'Failed to load subjects')
      const fetchedSubjects = subjectsData.subjects || []
      setSubjects(fetchedSubjects)
      
      // Load students with grades
      const studentsRes = await fetch(`/api/section-students?sectionId=${sections[0].id}`, { cache: 'no-store' })
      const studentsData = await studentsRes.json()
      
      if (!studentsRes.ok) throw new Error(studentsData.error || 'Failed to load students')
      
      // Calculate general average and remarks for each student - only from subjects with grades
      const studentsWithAverages = await Promise.all(
        studentsData.students.map(async (student: { id: number; fullname: string; quarters?: Record<number, number | null>; generalAverage?: number; remarks?: string }) => {
          // Get all subject grades for this student - only subjects with actual grades
          const allSubjectGrades = []
          
          for (const subject of fetchedSubjects) {
            const subjectGradesRes = await fetch(`/api/section-students?sectionId=${sections[0].id}&subjectId=${subject.id}&studentId=${student.id}`, { cache: 'no-store' })
            const subjectGradesData = await subjectGradesRes.json()
            
            if (subjectGradesRes.ok && subjectGradesData.students) {
              const studentData = subjectGradesData.students.find((s: { id: number; quarters?: Record<number, number | null> }) => s.id === student.id)
              if (studentData && studentData.quarters) {
                const quarters = studentData.quarters
                const grades = Object.values(quarters).filter(grade => grade !== null && grade !== undefined) as number[]
                
                // Only include subject if it has at least one grade
                if (grades.length > 0) {
                  const subjectFinal = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
                  allSubjectGrades.push(subjectFinal)
                }
              }
            }
          }
          
          // Calculate general average from subjects that have grades
          const generalAverage = allSubjectGrades.length > 0 ? allSubjectGrades.reduce((sum, grade) => sum + grade, 0) / allSubjectGrades.length : 0
          const remarks = generalAverage >= 75 ? 'PASSED' : 'FAILED'
          
          return {
            ...student,
            generalAverage: Math.round(generalAverage * 100) / 100,
            remarks
          }
        })
      )
      
      setStudents(studentsWithAverages)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load data'
      show(message)
    } finally {
      setLoading(false)
    }
  }

  function generatePDF() {
    show('PDF generation feature will be implemented')
  }

  async function viewStudentReport(student: Student) {
    if (!section) return
    
    setLoadingReport(true)
    try {
      // Get teacher data for adviser name
      const teacherData = localStorage.getItem('teacher')
      const teacher = teacherData ? JSON.parse(teacherData) : null
      
      // Fetch actual grades for this student across all subjects
      const studentGradesRes = await fetch(`/api/section-students?sectionId=${section.id}&studentId=${student.id}`, { cache: 'no-store' })
      const studentGradesData = await studentGradesRes.json()
      
      if (!studentGradesRes.ok) throw new Error(studentGradesData.error || 'Failed to load student grades')
      
      // Get grades for each subject - only include subjects with actual grades
      const subjectsWithGrades = []
      
      for (const subject of subjects) {
        const subjectGradesRes = await fetch(`/api/section-students?sectionId=${section.id}&subjectId=${subject.id}`, { cache: 'no-store' })
        const subjectGradesData = await subjectGradesRes.json()
        
        if (subjectGradesRes.ok && subjectGradesData.students) {
          const studentData = subjectGradesData.students.find((s: { id: number; quarters?: Record<number, number | null> }) => s.id === student.id)
          if (studentData && studentData.quarters) {
            const quarters = studentData.quarters
            const grades = Object.values(quarters).filter(grade => grade !== null && grade !== undefined) as number[]
            
            // Only include subject if it has at least one grade
            if (grades.length > 0) {
              const final = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
              
              subjectsWithGrades.push({
                name: subject.name,
                quarters: quarters,
                final: Math.round(final * 100) / 100
              })
            }
          }
        }
      }
      
      // Create student report data with actual data
      const studentReport: StudentReport = {
        studentId: student.id,
        studentName: student.fullname,
        gradeYear: section.grade_year,
        sectionName: section.name,
        sy: section.sy,
        subjects: subjectsWithGrades,
        generalAverage: student.generalAverage || 0,
        remarks: student.remarks || 'FAILED',
        adviserName: teacher?.fullname || 'Adviser Name',
        principalName: 'Principal Name' // This would be a system setting
      }
      
      setSelectedStudent(studentReport)
      setShowReportModal(true)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load student report data'
      show(message)
    } finally {
      setLoadingReport(false)
    }
  }

  function printReport() {
    window.print()
  }

  function closeReportModal() {
    setShowReportModal(false)
    setSelectedStudent(null)
  }

  if (loading) {
    return <ReportsLoadingScreen />
  }

  if (!section) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Section Found</h2>
        <p className="text-gray-600">Please create a section first to view reports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <div className="mt-2 text-sm text-gray-600">
              <p><span className="font-medium">Section:</span> {section.name}</p>
              <p><span className="font-medium">School Year:</span> {section.sy}</p>
            </div>
          </div>
          <button
            onClick={generatePDF}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate PDF / Print All
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">General Average</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.fullname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{student.generalAverage || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.remarks === 'PASSED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.remarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => viewStudentReport(student)}
                      disabled={loadingReport}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {loadingReport ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="relative">
                    {/* Outer circle */}
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    {/* Inner circle */}
                    <div className="absolute top-2 left-2 w-12 h-12 border-4 border-blue-100 rounded-full animate-spin border-t-blue-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    {/* Center dot */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <p className="mt-4 text-lg text-gray-600">Loading report...</p>
                  <p className="mt-1 text-sm text-gray-500">Please wait</p>
                </div>
              </div>
            ) : selectedStudent ? (
            <div className="p-6">
              {/* Report Header */}
              <div className="text-center border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Report Card</h2>
                <p className="text-gray-600">Form 138</p>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p><span className="font-medium">Student Name:</span> {selectedStudent.studentName}</p>
                  <p><span className="font-medium">Grade & Section:</span> {selectedStudent.gradeYear} - {selectedStudent.sectionName}</p>
                </div>
                <div>
                  <p><span className="font-medium">School Year:</span> {selectedStudent.sy}</p>
                  <p><span className="font-medium">General Average:</span> {selectedStudent.generalAverage}</p>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Grades</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-200 px-4 py-2 text-left">Subject</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">1st Q</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">2nd Q</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">3rd Q</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">4th Q</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.subjects.map((subject, index) => (
                        <tr key={index}>
                          <td className="border border-gray-200 px-4 py-2">{subject.name}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center">{subject.quarters[1] || '-'}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center">{subject.quarters[2] || '-'}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center">{subject.quarters[3] || '-'}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center">{subject.quarters[4] || '-'}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center font-medium">{subject.final || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p><span className="font-medium">General Average:</span> {selectedStudent.generalAverage}</p>
                  <p><span className="font-medium">Remarks:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                      selectedStudent.remarks === 'PASSED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStudent.remarks}
                    </span>
                  </p>
                </div>
                <div>
                  <p><span className="font-medium">Adviser:</span> {selectedStudent.adviserName}</p>
                  <p><span className="font-medium">Principal:</span> {selectedStudent.principalName}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={printReport}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Print Report
                </button>
                <button
                  onClick={closeReportModal}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Back to List
                </button>
              </div>
            </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Section4Page() {
  return (
    <ToastProvider>
      <ReportsInner />
    </ToastProvider>
  )
}


