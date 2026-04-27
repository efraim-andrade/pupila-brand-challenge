'use client';

import { BarChart3, Image, Palette, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { JSX } from 'react';
import { useAppStore } from '@/store';

const navItems = [
  {
    href: '/images',
    label: 'Images',
    icon: Image,
  },
  {
    href: '/palettes',
    label: 'Palettes',
    icon: Palette,
  },
  {
    href: '/statistics',
    label: 'Statistics',
    icon: BarChart3,
  },
];

const _configurationIcon = Settings;

export function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const sidebarOpen = useAppStore((store) => store.sidebarOpen);
  const closeSidebar = useAppStore((store) => store.closeSidebar);
  const openModal = useAppStore((store) => store.openModal);

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <aside
      className={[
        'flex flex-col bg-surface transition-all duration-200',
        'shadow-border',
        'fixed inset-y-0 left-0 z-40 w-56',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:inset-auto md:z-auto md:translate-x-0',
        sidebarOpen ? 'md:w-56' : 'md:w-16',
      ].join(' ')}
    >
      <div className="flex h-14 items-center border-b border-surface-muted px-4">
        {sidebarOpen ? (
          <span className="text-base font-semibold tracking-[-0.32px] text-text-primary">
            Pupila
          </span>
        ) : (
          <span className="text-base font-semibold text-text-primary">P</span>
        )}
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-surface-subtle text-text-primary'
                  : 'text-text-tertiary hover:bg-surface-subtle hover:text-text-primary'
              }`}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => openModal({ type: 'configuration' })}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          title={!sidebarOpen ? 'Configuration' : undefined}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {sidebarOpen && <span>Configuration</span>}
        </button>
      </nav>
    </aside>
  );
}
