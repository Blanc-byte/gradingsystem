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
      const res = await fetch(`/api/section-students?sectionId=${sectionId}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load students')
      setStudents(data.students.map((s: any) => ({ id: s.id, fullname: s.fullname })))
    } catch (e: any) {
      show(e.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  function setGrade(studentId: number, value: string) {
    setGrades((g) => ({ ...g, [studentId]: value }))
  }

  async function submitGrades() {
    try {
      // Require a grade for every listed student
      const missing = students.filter((s) => {
        const v = grades[s.id]
        return v === undefined || v === '' || Number.isNaN(Number(v))
      })
      if (missing.length > 0) {
        show('Please enter grades for all students before submitting')
        return
      }
      const payload = students.map((s) => ({
        studentId: s.id,
        grade: Number(grades[s.id]),
        subjectId,
        quarter,
      }))
      const res = await fetch('/api/grades/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, items: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit grades')
      show('Grades submitted')
      router.back()
    } catch (e: any) {
      show(e.message || 'Failed to submit grades')
    }
  }

  if (!sectionId || !subjectId || !quarter) {
    return <div className="p-4">Missing parameters.</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Enter Grades</h1>
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
        <button onClick={submitGrades} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Submit</button>
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


