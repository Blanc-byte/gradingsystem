"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import ToastProvider, { useToast } from '@/app/components/ToastProvider'
import SectionLoadingScreen from '@/app/components/SectionLoadingScreen'

interface SectionRow {
  id: number
  name: string
  sy: string
  grade_year: number
  locked: boolean
  teacher: { fullname: string }
  _count: { students: number }
}

interface Subject { id: number; name: string }

function SubmitGradeInner() {
  const { show } = useToast()
  const router = useRouter()
  const [sections, setSections] = useState<SectionRow[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{ grade_year?: number; sy?: string; q?: string }>({})

  const [selectOpen, setSelectOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<SectionRow | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('')
  const [selectedQuarter, setSelectedQuarter] = useState<number | ''>('')

  useEffect(() => {
    void loadSubjects()
  }, [])

  useEffect(() => {
    void loadSections()
  }, [filters])

  async function loadSections() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.grade_year) params.set('grade_year', String(filters.grade_year))
      if (filters.sy) params.set('sy', filters.sy)
      if (filters.q) params.set('q', filters.q)
      const res = await fetch(`/api/sections/stats?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load sections')
      setSections(data.sections)
    } catch (e: any) {
      show(e.message || 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }

  async function loadSubjects() {
    try {
      const res = await fetch('/api/subjects', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load subjects')
      setSubjects(data.subjects)
    } catch (e: any) {
      show(e.message || 'Failed to load subjects')
    }
  }

  function openSelect(section: SectionRow) {
    if (section.locked) {
      show('This section is locked. Unlock it before submitting grades.')
      return
    }
    setSelectedSection(section)
    setSelectedSubjectId('')
    setSelectedQuarter('')
    setSelectOpen(true)
  }

  async function proceedSubmit() {
    if (!selectedSection) return
    if (!selectedSubjectId) {
      show('Please select a subject')
      return
    }
    if (!selectedQuarter) {
      show('Please select a quarter')
      return
    }
    try {
      const params = new URLSearchParams({
        sectionId: String(selectedSection.id),
        subjectId: String(selectedSubjectId),
        quarter: String(selectedQuarter),
      })
      const res = await fetch(`/api/grades/exists?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok && data.exists) {
        show(`Opening grade editor - ${data.count} student(s) already have grades for this quarter.`)
      }
      setSelectOpen(false)
      router.push(`/sections/section3/submit?${params.toString()}`)
    } catch (e: any) {
      show(e.message || 'Failed to check existing grades')
    }
  }

  if (loading) {
    return <SectionLoadingScreen />
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Submit Grade</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search section name"
            value={filters.q || ''}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="School Year (e.g., 2024-2025)"
            value={filters.sy || ''}
            onChange={(e) => setFilters((f) => ({ ...f, sy: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Grade Level"
            min={7}
            max={12}
            value={filters.grade_year || ''}
            onChange={(e) => setFilters((f) => ({ ...f, grade_year: e.target.value ? Number(e.target.value) : undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={loadSections} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Filter</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SY</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locked</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adviser</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th className="px-6 py-3"/>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sections.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.sy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.grade_year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${s.locked ? 'bg-red-200 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                    {s.locked ? 'Locked' : 'Unlocked'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.teacher.fullname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s._count.students}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button onClick={() => openSelect(s)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Select</button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No sections found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectOpen && selectedSection && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Subject and Quarter</h3>
            <div className="space-y-3">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select quarter</option>
                <option value={1}>1st</option>
                <option value={2}>2nd</option>
                <option value={3}>3rd</option>
                <option value={4}>4th</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelectOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={proceedSubmit} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Proceed</button>
            </div>
            <p className="mt-3 text-xs text-gray-600">Note: If grades already exist for the selected quarter, you'll be reminded before proceeding.</p>
          </div>
        </div>
      )}

    </div>
  )
}

export default function SubmitGradePage() {
  return (
    <ToastProvider>
      <SubmitGradeInner />
    </ToastProvider>
  )
}

// Removed duplicate default export


