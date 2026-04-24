'use client';

import { Home, Image, Menu, Palette } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { JSX, ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ConfigurationModal } from '@/features/dashboard/components/ConfigurationModal';
import { useAppStore } from '@/store';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

const pageNames: Record<string, { label: string; icon: typeof Home }> = {
  '/': { label: 'Dashboard', icon: Home },
  '/images': { label: 'Images', icon: Image },
  '/palettes': { label: 'Palettes', icon: Palette },
  '/statistics': { label: 'Statistics', icon: Palette },
};

export function AppShell({ children }: AppShellProps): JSX.Element {
  const pathname = usePathname();
  const currentPage = pageNames[pathname] || { label: 'Dashboard', icon: Home };
  const PageIcon = currentPage.icon;

  const toggleSidebar = useAppStore((store) => store.toggleSidebar);
  const sidebarOpen = useAppStore((store) => store.sidebarOpen);
  const hydrated = useAppStore((store) => store.hydrated);
  const modal = useAppStore((store) => store.modal);
  const closeModal = useAppStore((store) => store.closeModal);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 gap-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <PageIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">
            {currentPage.label}
          </span>
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

      <ConfigurationModal
        open={modal?.type === 'configuration'}
        onClose={closeModal}
      />
    </div>
  );
}
