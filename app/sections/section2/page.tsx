"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Teacher { id: number; fullname: string; username: string; role: string }
interface Section { id: number; name: string; grade_year: number; teacherId: number; locked?: boolean; sy?: string }

export default function Section2Page() {
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
		} catch (e: any) {
			setError(e.message)
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
		} catch (e: any) {
			setError(e.message)
		}
	}

async function submitRename(sectionId: number) {
    const res = await fetch(`/api/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue }),
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
			setError(data.error || 'Failed to delete section')
		}
	}

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-4"></h1>



			{/* Only one section allowed. If none, show centered create button. */}
			{!loading && sections.length === 0 ? (
				<div className="flex items-center justify-center py-20">
					<form onSubmit={handleAddSection} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm w-full max-w-md">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">Create my section</h2>
						<input
							type="text"
							placeholder="Section name"
							value={newSectionName}
							onChange={(e) => setNewSectionName(e.target.value)}
							className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<label htmlFor="gradeYear" className="sr-only">Grade Level (7-12)</label>
						<input
							id="gradeYear"
							type="number"
							min={7}
							max={12}
							placeholder="Grade Level (7-12)"
							value={newSectionGrade}
							onChange={(e) => setNewSectionGrade(Number(e.target.value))}
							className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<label htmlFor="sy" className="sr-only">School Year</label>
						<input
							id="sy"
							type="text"
							placeholder="School Year (e.g., 2024-2025)"
							value={newSectionSy}
							onChange={(e) => setNewSectionSy(e.target.value)}
							className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button type="submit" className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Create Section</button>
					</form>
				</div>
			) : (
				<div className="flex items-center justify-center py-20">
					{sections[0] && (
						<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm w-full max-w-md">
							<div className="text-center">
								<div className="text-xl font-semibold text-gray-900">{sections[0].name}</div>
								<div className="mt-1 text-sm text-gray-500">Grade Year: {sections[0].grade_year}</div>
								<div className="mt-1 text-sm text-gray-500">School Year: {sections[0].sy || '—'}</div>
							</div>
						<div className="mt-6 flex items-center justify-center gap-4">
							<Link href={`/sections/section2/${sections[0].id}`} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Open Profile</Link>
							<button onClick={() => { setRenameValue(sections[0].name); setRenameOpen(true) }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Rename</button>
						</div>
						</div>
					)}
				</div>
			)}

			{renameOpen && sections[0] && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white w-full max-w-sm rounded-lg shadow-lg p-5">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">Rename Section</h3>
						<input
							type="text"
							value={renameValue}
							onChange={(e) => setRenameValue(e.target.value)}
							className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<div className="flex justify-end gap-2">
							<button onClick={() => setRenameOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
							<button onClick={() => submitRename(sections[0].id)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
						</div>
					</div>
				</div>
			)}

			{error && (
				<div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
			)}
		</div>
	)
}


