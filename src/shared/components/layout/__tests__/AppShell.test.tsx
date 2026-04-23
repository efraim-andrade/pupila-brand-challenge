/**
 * Tests for AppShell:
 * - Conditional rendering of children vs. loading spinner based on hydration state
 * - Mobile overlay visibility tied to sidebarOpen state
 * - Header toggle button wiring to toggleSidebar
 * - Mobile overlay click wiring to toggleSidebar
 * - ConfigurationModal open prop derived from modal.type
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from '../AppShell'
import { useAppStore } from '@/store'
import type { ModalState } from '@/types'

jest.mock('@/store', () => ({ useAppStore: jest.fn() }))
jest.mock('sonner', () => ({ Toaster: () => null }))
jest.mock('../Sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar" />,
}))
jest.mock('@/features/dashboard/components/ConfigurationModal', () => ({
  ConfigurationModal: ({ open }: { open: boolean }) => (
    <div data-testid="configuration-modal" data-open={String(open)} />
  ),
}))

const mockedUseAppStore = jest.mocked(useAppStore)

interface StoreState {
  sidebarOpen?: boolean
  hydrated?: boolean
  modal?: ModalState | null
  toggleSidebar?: () => void
  closeModal?: () => void
}

const buildStoreState = ({
  sidebarOpen = false,
  hydrated = true,
  modal = null,
  toggleSidebar = jest.fn(),
  closeModal = jest.fn(),
}: StoreState = {}) => ({
  sidebarOpen,
  hydrated,
  modal,
  toggleSidebar,
  closeModal,
})

const setupStore = (overrides: StoreState = {}) => {
  const storeState = buildStoreState(overrides)
  mockedUseAppStore.mockImplementation(
    (selector) => selector(storeState as Parameters<typeof selector>[0]),
  )
  return storeState
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('AppShell', () => {
  describe('content area hydration', () => {
    it('renders children when the store is hydrated', () => {
      setupStore({ hydrated: true })

      render(<AppShell><p>Page content</p></AppShell>)

      expect(screen.getByText('Page content')).toBeInTheDocument()
    })

    it('shows a loading spinner instead of children when the store is not yet hydrated', () => {
      setupStore({ hydrated: false })

      render(<AppShell><p>Page content</p></AppShell>)

      expect(screen.queryByText('Page content')).not.toBeInTheDocument()
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('mobile overlay', () => {
    it('renders the overlay when the sidebar is open', () => {
      setupStore({ sidebarOpen: true })

      render(<AppShell><p>content</p></AppShell>)

      const overlay = document.querySelector('.bg-black\\/40')
      expect(overlay).toBeInTheDocument()
    })

    it('does not render the overlay when the sidebar is closed', () => {
      setupStore({ sidebarOpen: false })

      render(<AppShell><p>content</p></AppShell>)

      const overlay = document.querySelector('.bg-black\\/40')
      expect(overlay).not.toBeInTheDocument()
    })

    it('calls toggleSidebar when the overlay is clicked', async () => {
      const toggleSidebar = jest.fn()
      setupStore({ sidebarOpen: true, toggleSidebar })

      render(<AppShell><p>content</p></AppShell>)

      const overlay = document.querySelector('.bg-black\\/40') as HTMLElement
      await userEvent.click(overlay)

      expect(toggleSidebar).toHaveBeenCalledTimes(1)
    })
  })

  describe('header toggle button', () => {
    it('calls toggleSidebar when the header toggle button is clicked', async () => {
      const toggleSidebar = jest.fn()
      setupStore({ toggleSidebar })

      render(<AppShell><p>content</p></AppShell>)

      await userEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }))

      expect(toggleSidebar).toHaveBeenCalledTimes(1)
    })
  })

  describe('ConfigurationModal integration', () => {
    it('passes open=true to ConfigurationModal when the active modal is configuration', () => {
      setupStore({ modal: { type: 'configuration' } })

      render(<AppShell><p>content</p></AppShell>)

      expect(screen.getByTestId('configuration-modal')).toHaveAttribute('data-open', 'true')
    })

    it('passes open=false to ConfigurationModal when no modal is active', () => {
      setupStore({ modal: null })

      render(<AppShell><p>content</p></AppShell>)

      expect(screen.getByTestId('configuration-modal')).toHaveAttribute('data-open', 'false')
    })

    it('passes open=false to ConfigurationModal when a different modal is active', () => {
      setupStore({ modal: { type: 'addImage' } })

      render(<AppShell><p>content</p></AppShell>)

      expect(screen.getByTestId('configuration-modal')).toHaveAttribute('data-open', 'false')
    })
  })
})
