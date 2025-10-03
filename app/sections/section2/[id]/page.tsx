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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch section'
      show(message)
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch students'
      show(message)
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to fetch subjects'
      show(message)
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update lock'
      show(message)
    } finally {
      setToggling(false)
    }
  }

  if (loadingSection) return <div>Loading section...</div>
  if (!section) return <div>Section not found.</div>

  return (
    <div className="space-y-6">
  {/* Header with lock button */}
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold text-blue-800">{section.name}</h1>
    <button
      onClick={toggleLock}
      disabled={toggling}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
        section.locked
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          : "bg-red-600 text-white border-red-600 hover:bg-red-700"
      }`}
    >
      {section.locked ? "Unlock" : "Lock"}
    </button>
  </div>

  {/* Section meta */}
  <div className="text-sm text-gray-600 flex items-center gap-4">
    <span className="font-medium text-gray-700">Grade Year: {section.grade_year}</span>
    <span className="font-medium text-gray-700">School Year: {section.sy || "—"}</span>
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        section.locked
          ? "bg-red-200 text-gray-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {section.locked ? "Locked" : "Unlocked"}
    </span>
  </div>

  {/* Card container */}
  <div className="bg-white border border-blue-100 rounded-xl shadow-sm">
    {/* Filters and add student */}
    <div className="p-5 border-b border-blue-100 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterSubjectId}
          onChange={(e) =>
            setFilterSubjectId(e.target.value ? Number(e.target.value) : "")
          }
          className="w-full sm:w-60 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <form
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={editingStudentId ? handleUpdateStudent : handleAddStudent}
      >
        <input
          type="text"
          placeholder={
            editingStudentId ? "Edit student name" : "Add student name"
          }
          value={editingStudentId ? editingStudentName : studentName}
          onChange={(e) =>
            editingStudentId
              ? setEditingStudentName(e.target.value)
              : setStudentName(e.target.value)
          }
          className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          {editingStudentId ? "Update" : "Add Student"}
        </button>
        {editingStudentId && (
          <button
            type="button"
            onClick={() => {
              setEditingStudentId(null);
              setEditingStudentName("");
            }}
            className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </form>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wide">
              #
            </th>
            <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wide">
              Student Name
            </th>
            <th className="px-6 py-3 text-center font-semibold text-blue-800 uppercase tracking-wide">
              1st
            </th>
            <th className="px-6 py-3 text-center font-semibold text-blue-800 uppercase tracking-wide">
              2nd
            </th>
            <th className="px-6 py-3 text-center font-semibold text-blue-800 uppercase tracking-wide">
              3rd
            </th>
            <th className="px-6 py-3 text-center font-semibold text-blue-800 uppercase tracking-wide">
              4th
            </th>
            <th />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((s, idx) => (
            <tr key={s.id} className="hover:bg-blue-50/40 transition">
              <td className="px-6 py-4 text-gray-600">{idx + 1}</td>
              <td className="px-6 py-4 text-gray-900 font-medium">{s.fullname}</td>
              {[1, 2, 3, 4].map((q) => {
                const v = s.quarters?.[q] ?? null;
                return (
                  <td
                    key={q}
                    className={`px-6 py-4 text-center ${
                      v == null
                        ? "text-gray-500 italic"
                        : v < 75
                        ? "text-red-600 font-semibold"
                        : v > 90
                        ? "text-blue-700 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {v == null ? "—" : v}
                  </td>
                );
              })}
              <td className="px-6 py-4 text-right space-x-3">
                <button
                  onClick={() => {
                    setEditingStudentId(s.id);
                    setEditingStudentName(s.fullname);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteStudent(s.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {students.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-10 text-center text-gray-500 italic"
              >
                No students yet.
              </td>
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


