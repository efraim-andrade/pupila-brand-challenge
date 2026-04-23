'use client'

import { useEffect, type JSX } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store'

const navItems = [
  {
    href: '/images',
    label: 'Images',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v16.5a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V3.75A.75.75 0 013.75 3z" />
      </svg>
    ),
  },
  {
    href: '/palettes',
    label: 'Palettes',
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88" />
      </svg>
    ),
  },
]

const configurationIcon = (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export function Sidebar(): JSX.Element {
  const pathname = usePathname()
  const sidebarOpen = useAppStore((store) => store.sidebarOpen)
  const closeSidebar = useAppStore((store) => store.closeSidebar)
  const openModal = useAppStore((store) => store.openModal)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      closeSidebar()
    }
  }, [pathname, closeSidebar])

  return (
    <aside
      className={[
        'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
        'fixed inset-y-0 left-0 z-40 w-56',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:inset-auto md:z-auto md:translate-x-0',
        sidebarOpen ? 'md:w-56' : 'md:w-16',
      ].join(' ')}
    >
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        {sidebarOpen ? (
          <span className="font-semibold text-gray-900 tracking-tight">Pupila</span>
        ) : (
          <span className="font-bold text-indigo-600">P</span>
        )}
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={!sidebarOpen ? label : undefined}
            >
              {icon}
              {sidebarOpen && <span>{label}</span>}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => openModal({ type: 'configuration' })}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          title={!sidebarOpen ? 'Configuration' : undefined}
        >
          {configurationIcon}
          {sidebarOpen && <span>Configuration</span>}
        </button>
      </nav>
    </aside>
  )
}
