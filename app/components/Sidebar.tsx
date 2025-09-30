'use client'

import Link from 'next/link'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const sections = [
    { id: 'section1', name: 'Section 1' },
    { id: 'section2', name: 'My Section' },
    { id: 'section3', name: 'Submit Grades' },
    { id: 'section4', name: 'Section 4' },
    { id: 'section5', name: 'Section 5' }
  ]

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4"></h2>
        <nav className="space-y-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/sections/${section.id}`}
              onClick={() => onSectionChange(section.id)}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {section.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
