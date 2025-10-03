"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ToastProvider, { useToast } from '@/app/components/ToastProvider'
import { useRouter } from 'next/navigation'
import SectionLoadingScreen from '@/app/components/SectionLoadingScreen'

interface Teacher { id: number; fullname: string; username: string; role: string }
interface Section { id: number; name: string; grade_year: number; teacherId: number; locked?: boolean; sy?: string }

function Section2Inner() {
  const { show } = useToast()
	const [teacher, setTeacher] = useState<Teacher | null>(null)
	const [sections, setSections] = useState<Section[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [newSectionName, setNewSectionName] = useState('')
	const [newSectionGrade, setNewSectionGrade] = useState<number>(7)
	const [newSectionSy, setNewSectionSy] = useState<string>('2024-2025')
	const router = useRouter()
	const [renameOpen, setRenameOpen] = useState(false)
	const [renameValue, setRenameValue] = useState('')
	const [renameSy, setRenameSy] = useState('')

	useEffect(() => {
		const t = localStorage.getItem('teacher')
		if (t) setTeacher(JSON.parse(t))
	}, [])

	useEffect(() => {
		if (!teacher) return
		void fetchSections()
	}, [teacher])

	async function fetchSections() {
		try {
			setLoading(true)
			const res = await fetch(`/api/sections?teacherId=${teacher!.id}`, { cache: 'no-store' })
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to load sections')
			setSections(data.sections)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load sections'
      show(message)
		} finally {
			setLoading(false)
		}
	}

	async function handleAddSection(e: React.FormEvent) {
		e.preventDefault()
		if (!newSectionName.trim()) return
		if (newSectionGrade < 7 || newSectionGrade > 12) {
			setError('Grade level must be between 7 and 12')
			return
		}
		try {
			const res = await fetch('/api/sections', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newSectionName.trim(), grade_year: newSectionGrade, sy: newSectionSy, teacherId: teacher!.id }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to create section')
			setNewSectionName('')
			// Redirect to the section profile page
			router.push(`/sections/section2/${data.section.id}`)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to create section'
      show(message)
		}
	}

async function submitRename(sectionId: number) {
    const res = await fetch(`/api/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue, sy: renameSy }),
    })
    const data = await res.json()
    if (res.ok) {
        setSections((prev) => prev.map((s) => (s.id === sectionId ? data.section : s)))
        setRenameOpen(false)
    } else {
      setError(data.error || 'Failed to update section')
    }
}

	async function handleDeleteSection(sectionId: number) {
		const res = await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' })
		if (res.ok) {
			setSections((prev) => prev.filter((s) => s.id !== sectionId))
    } else {
      const data = await res.json()
      show(data.error || 'Failed to delete section')
		}
	}

	if (loading) {
		return <SectionLoadingScreen />
	}

	return (
		<div className="h-100 bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
			{/* Only one section allowed. If none, show centered create button. */}
			{sections.length === 0 ? (
				<div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-blue-100 p-8">
				<h2 className="text-xl font-bold text-blue-800 mb-6 text-center">Create Your Section</h2>
				<form onSubmit={handleAddSection} className="space-y-4">
					<input
					type="text"
					placeholder="Section Name"
					value={newSectionName}
					onChange={(e) => setNewSectionName(e.target.value)}
					className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<input
					type="number"
					min={7}
					max={12}
					placeholder="Grade Level (7-12)"
					value={newSectionGrade}
					onChange={(e) => setNewSectionGrade(Number(e.target.value))}
					className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<input
					type="text"
					placeholder="School Year (e.g., 2024-2025)"
					value={newSectionSy}
					onChange={(e) => setNewSectionSy(e.target.value)}
					className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
					type="submit"
					className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
					>
					Create Section
					</button>
				</form>
				</div>
			) : (
				<div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-blue-100 p-8 text-center">
				{sections[0] && (
					<>
					<h3 className="text-2xl font-bold text-blue-800">{sections[0].name}</h3>
					<p className="mt-2 text-gray-600">Grade Year: {sections[0].grade_year}</p>
					<p className="mt-1 text-gray-600">School Year: {sections[0].sy || "—"}</p>

					<div className="mt-6 flex items-center justify-center gap-4">
						<Link
						href={`/sections/section2/${sections[0].id}`}
						className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
						>
						Open Profile
						</Link>
						<button
						onClick={() => {
							setRenameValue(sections[0].name);
							setRenameSy(sections[0].sy || "");
							setRenameOpen(true);
						}}
						className="px-5 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
						>
						Edit
						</button>
					</div>
					</>
				)}
				</div>
			)}

			{renameOpen && sections[0] && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
				<div className="bg-white w-full max-w-sm rounded-2xl shadow-lg p-6 border border-blue-100">
					<h3 className="text-lg font-semibold text-blue-800 mb-4">Edit Section</h3>
					<input
					type="text"
					value={renameValue}
					onChange={(e) => setRenameValue(e.target.value)}
					className="w-full mb-3 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<input
					type="text"
					placeholder="School Year (e.g., 2024-2025)"
					value={renameSy}
					onChange={(e) => setRenameSy(e.target.value)}
					className="w-full mb-4 px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<div className="flex justify-end gap-2">
					<button
						onClick={() => setRenameOpen(false)}
						className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={() => submitRename(sections[0].id)}
						className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
					>
						Save
					</button>
					</div>
				</div>
				</div>
			)}
			</div>

	)
}

export default function Section2Page() {
  return (
    <ToastProvider>
      <Section2Inner />
    </ToastProvider>
  )
}


