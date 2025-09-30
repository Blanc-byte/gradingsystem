"use client"

import { useEffect, useState } from 'react'
import ToastProvider, { useToast } from '@/app/components/ToastProvider'
import { useParams } from 'next/navigation'

interface Section { id: number; name: string; grade_year: number; teacherId: number; locked?: boolean; sy?: string }
interface Student { id: number; fullname: string; sectionId: number; grades?: { quarter: number; grade: number }[]; quarters?: Record<number, number | null> }

function SectionProfileInner() {
  const { show } = useToast()
  const params = useParams<{ id: string }>()
  const sectionId = Number(params.id)
  const [section, setSection] = useState<Section | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingSection, setLoadingSection] = useState(true)
  const [studentName, setStudentName] = useState('')
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null)
  const [editingStudentName, setEditingStudentName] = useState('')
  const [toggling, setToggling] = useState(false)
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>([])
  const [filterSubjectId, setFilterSubjectId] = useState<number | ''>('')

  useEffect(() => {
    if (!sectionId) return
    void loadSection()
    void loadStudents()
    void loadSubjects()
  }, [sectionId])

  useEffect(() => {
    if (!sectionId) return
    void loadStudents()
  }, [filterSubjectId])

  async function loadSection() {
    try {
      setLoadingSection(true)
      const res = await fetch(`/api/sections/${sectionId}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch section')
      setSection(data.section as Section)
    } catch (e: any) {
      show(e.message || 'Failed to fetch section')
      setSection(null)
    } finally {
      setLoadingSection(false)
    }
  }

  async function loadStudents() {
    try {
      if (!filterSubjectId) {
        setStudents([])
        return
      }
      const params = new URLSearchParams()
      params.set('sectionId', String(sectionId))
      params.set('subjectId', String(filterSubjectId))
      const res = await fetch(`/api/section-students?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch students')
      setStudents(data.students)
    } catch (e: any) {
      show(e.message || 'Failed to fetch students')
    }
  }

  async function loadSubjects() {
    try {
      const res = await fetch(`/api/section-subjects?sectionId=${sectionId}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch subjects')
      setSubjects(data.subjects)
      if (data.subjects && data.subjects.length > 0) {
        setFilterSubjectId((prev) => (prev ? prev : data.subjects[0].id))
      }
    } catch (e: any) {
      show(e.message || 'Failed to fetch subjects')
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault()
    if (!studentName.trim()) return
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname: studentName.trim(), sectionId }),
    })
    const data = await res.json()
    if (res.ok) {
      setStudents((prev) => [data.student, ...prev])
      setStudentName('')
    } else {
      show(data.error || 'Failed to add student')
    }
  }

  async function handleUpdateStudent(e: React.FormEvent) {
    e.preventDefault()
    if (editingStudentId == null) return
    const res = await fetch(`/api/students/${editingStudentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname: editingStudentName }),
    })
    const data = await res.json()
    if (res.ok) {
      setStudents((prev) => prev.map((s) => (s.id === editingStudentId ? data.student : s)))
      setEditingStudentId(null)
      setEditingStudentName('')
    } else {
      show(data.error || 'Failed to update student')
    }
  }

  async function handleDeleteStudent(studentId: number) {
    const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' })
    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
    } else {
      const data = await res.json()
      show(data.error || 'Failed to delete student')
    }
  }

  async function toggleLock() {
    if (!section) return
    try {
      setToggling(true)
      const res = await fetch(`/api/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !Boolean(section.locked) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update lock')
      setSection(data.section)
    } catch (e: any) {
      show(e.message || 'Failed to update lock')
    } finally {
      setToggling(false)
    }
  }

  if (loadingSection) return <div>Loading section...</div>
  if (!section) return <div>Section not found.</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{section.name}</h1>
        <button
          onClick={toggleLock}
          disabled={toggling}
          className={`px-3 py-1.5 rounded-lg text-sm border ${section.locked ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}
        >
          {section.locked ? 'Unlock' : 'Lock'}
        </button>
      </div>
      <div className="text-sm text-gray-600 mb-6 flex items-center gap-3">
        <span>Grade Year: {section.grade_year}</span>
        <span>School Year: {section.sy || '—'}</span>
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${section.locked ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}`}>
          {section.locked ? 'Locked' : 'Unlocked'}
        </span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value ? Number(e.target.value) : '')}
              className="w-full sm:w-60 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={editingStudentId ? handleUpdateStudent : handleAddStudent}>
            <input
              type="text"
              placeholder={editingStudentId ? 'Edit student name' : 'Add student name'}
              value={editingStudentId ? editingStudentName : studentName}
              onChange={(e) => (editingStudentId ? setEditingStudentName(e.target.value) : setStudentName(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              {editingStudentId ? 'Update' : 'Add Student'}
            </button>
            {editingStudentId && (
              <button type="button" onClick={() => { setEditingStudentId(null); setEditingStudentName('') }} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
            )}
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">1st</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2nd</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">3rd</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">4th</th>
                <th className="px-6 py-3"/>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.fullname}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${(() => { const v = s.quarters?.[1] ?? null; return v == null ? 'text-gray-700' : v < 75 ? 'text-red-600 font-medium' : v > 90 ? 'text-blue-600 font-semibold' : 'text-gray-800' })()}`}>{(() => { const v = s.quarters?.[1] ?? null; return v == null ? 'none' : v })()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${(() => { const v = s.quarters?.[2] ?? null; return v == null ? 'text-gray-700' : v < 75 ? 'text-red-600 font-medium' : v > 90 ? 'text-blue-600 font-semibold' : 'text-gray-800' })()}`}>{(() => { const v = s.quarters?.[2] ?? null; return v == null ? 'none' : v })()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${(() => { const v = s.quarters?.[3] ?? null; return v == null ? 'text-gray-700' : v < 75 ? 'text-red-600 font-medium' : v > 90 ? 'text-blue-600 font-semibold' : 'text-gray-800' })()}`}>{(() => { const v = s.quarters?.[3] ?? null; return v == null ? 'none' : v })()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${(() => { const v = s.quarters?.[4] ?? null; return v == null ? 'text-gray-700' : v < 75 ? 'text-red-600 font-medium' : v > 90 ? 'text-blue-600 font-semibold' : 'text-gray-800' })()}`}>{(() => { const v = s.quarters?.[4] ?? null; return v == null ? 'none' : v })()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button onClick={() => { setEditingStudentId(s.id); setEditingStudentName(s.fullname) }} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDeleteStudent(s.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No students yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default function SectionProfilePage() {
  return (
    <ToastProvider>
      <SectionProfileInner />
    </ToastProvider>
  )
}


