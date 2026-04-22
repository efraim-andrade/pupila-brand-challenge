'use client'

import { type ReactNode, type JSX } from 'react'
import { Sidebar } from './Sidebar'
import { useAppStore } from '@/store'
import { Toaster } from 'sonner'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  const toggleSidebar = useAppStore((store) => store.toggleSidebar)
  const hydrated = useAppStore((store) => store.hydrated)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 gap-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-500">Brand Zone</span>
        </header>

        <main className="flex-1 overflow-auto">
          {hydrated ? (
            children
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          )}
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  )
}
