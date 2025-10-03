"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ToastProvider, { useToast } from '@/app/components/ToastProvider'

interface Student { id: number; fullname: string }

function SubmitInner() {
  const params = useSearchParams()
  const router = useRouter()
  const { show } = useToast()

  const sectionId = Number(params.get('sectionId'))
  const subjectId = Number(params.get('subjectId'))
  const quarter = Number(params.get('quarter'))

  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sectionId || !subjectId || !quarter) return
    void loadStudents()
  }, [sectionId, subjectId, quarter])

  async function loadStudents() {
    try {
      const res = await fetch(`/api/section-students?sectionId=${sectionId}&subjectId=${subjectId}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load students')
      
      const studentsData = data.students.map((s: { id: number; fullname: string }) => ({ id: s.id, fullname: s.fullname }))
      setStudents(studentsData)
      
      // Pre-fill existing grades for this quarter
      const existingGrades: Record<number, string> = {}
      data.students.forEach((s: { id: number; quarters?: Record<number, number | null> }) => {
        const existingGrade = s.quarters?.[quarter]
        if (existingGrade !== null && existingGrade !== undefined) {
          existingGrades[s.id] = String(existingGrade)
        }
      })
      setGrades(existingGrades)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load students'
      show(message)
    } finally {
      setLoading(false)
    }
  }

  function setGrade(studentId: number, value: string) {
    setGrades((g) => ({ ...g, [studentId]: value }))
  }

  async function submitGrades() {
    try {
      // Only submit grades for students who have values entered
      const gradesToSubmit = students
        .map((s) => {
          const gradeValue = grades[s.id]
          if (gradeValue && gradeValue.trim() !== '' && !Number.isNaN(Number(gradeValue))) {
            return {
              studentId: s.id,
              grade: Number(gradeValue),
              subjectId,
              quarter,
            }
          }
          return null
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      if (gradesToSubmit.length === 0) {
        show('Please enter at least one grade before submitting')
        return
      }

      const res = await fetch('/api/grades/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, items: gradesToSubmit }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit grades')
      show(`Grades submitted for ${gradesToSubmit.length} student(s)`)
      router.back()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to submit grades'
      show(message)
    }
  }

  if (!sectionId || !subjectId || !quarter) {
    return <div className="p-4">Missing parameters.</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Enter Grades</h1>
      <p className="text-sm text-gray-600 mb-4">
        Pre-filled values are existing grades. You can edit them or leave empty for students without grades.
      </p>
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((s, idx) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.fullname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <input
                    type="number"
                    min={60}
                    max={100}
                    step="0.01"
                    value={grades[s.id] ?? ''}
                    onChange={(e) => setGrade(s.id, e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={submitGrades} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save Grades</button>
      </div>
    </div>
  )
}

export default function SubmitPage() {
  return (
    <ToastProvider>
      <SubmitInner />
    </ToastProvider>
  )
}


