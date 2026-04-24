/**
 * Tests for Sidebar:
 * - Brand name display driven by sidebarOpen state
 * - Nav link label visibility driven by sidebarOpen state
 * - Active link styling based on current pathname
 * - Configuration button wiring to openModal
 * - Automatic sidebar collapse on nav click for small screens
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppStore } from '@/store';
import type { ModalState } from '@/types';
import { Sidebar } from '../Sidebar';

jest.mock('@/store', () => ({ useAppStore: jest.fn() }));
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from 'next/navigation';

const mockedUsePathname = jest.mocked(usePathname);
const mockedUseAppStore = jest.mocked(useAppStore);

interface StoreState {
  sidebarOpen?: boolean;
  closeSidebar?: () => void;
  openModal?: (modal: ModalState) => void;
}

const buildStoreState = ({
  sidebarOpen = true,
  closeSidebar = jest.fn(),
  openModal = jest.fn(),
}: StoreState = {}) => ({
  sidebarOpen,
  closeSidebar,
  openModal,
});

const setupStore = (overrides: StoreState = {}) => {
  const storeState = buildStoreState(overrides);
  mockedUseAppStore.mockImplementation((selector) =>
    selector(storeState as Parameters<typeof selector>[0])
  );
  return storeState;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedUsePathname.mockReturnValue('/images');
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
});

describe('Sidebar', () => {
  describe('brand name display', () => {
    it('shows the full "Pupila" brand name when the sidebar is open', () => {
      setupStore({ sidebarOpen: true });

      render(<Sidebar />);

      expect(screen.getByText('Pupila')).toBeInTheDocument();
      expect(screen.queryByText('P')).not.toBeInTheDocument();
    });

    it('shows only the "P" abbreviation when the sidebar is collapsed', () => {
      setupStore({ sidebarOpen: false });

      render(<Sidebar />);

      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.queryByText('Pupila')).not.toBeInTheDocument();
    });
  });

  describe('navigation label visibility', () => {
    it('renders nav item labels when the sidebar is open', () => {
      setupStore({ sidebarOpen: true });

      render(<Sidebar />);

      expect(screen.getByText('Images')).toBeInTheDocument();
      expect(screen.getByText('Palettes')).toBeInTheDocument();
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    it('hides nav item labels when the sidebar is collapsed', () => {
      setupStore({ sidebarOpen: false });

      render(<Sidebar />);

      expect(screen.queryByText('Images')).not.toBeInTheDocument();
      expect(screen.queryByText('Palettes')).not.toBeInTheDocument();
      expect(screen.queryByText('Configuration')).not.toBeInTheDocument();
    });
  });

  describe('active link styling', () => {
    it('applies active styles to the link whose href matches the current pathname', () => {
      mockedUsePathname.mockReturnValue('/images');
      setupStore({ sidebarOpen: true });

      render(<Sidebar />);

      const imagesLink = screen.getByRole('link', { name: /images/i });
      expect(imagesLink).toHaveClass('bg-indigo-50', 'text-indigo-700');
    });

    it('does not apply active styles to links that do not match the current pathname', () => {
      mockedUsePathname.mockReturnValue('/images');
      setupStore({ sidebarOpen: true });

      render(<Sidebar />);

      const palettesLink = screen.getByRole('link', { name: /palettes/i });
      expect(palettesLink).not.toHaveClass('bg-indigo-50', 'text-indigo-700');
    });

    it('applies active styles to a nav item when the pathname starts with its href', () => {
      mockedUsePathname.mockReturnValue('/palettes/my-palette');
      setupStore({ sidebarOpen: true });

      render(<Sidebar />);

      const palettesLink = screen.getByRole('link', { name: /palettes/i });
      expect(palettesLink).toHaveClass('bg-indigo-50', 'text-indigo-700');
    });
  });

  describe('Configuration button', () => {
    it('calls openModal with type "configuration" when the Configuration button is clicked', async () => {
      const openModal = jest.fn();
      setupStore({ sidebarOpen: true, openModal });

      render(<Sidebar />);

      await userEvent.click(
        screen.getByRole('button', { name: /configuration/i })
      );

      expect(openModal).toHaveBeenCalledTimes(1);
      expect(openModal).toHaveBeenCalledWith({ type: 'configuration' });
    });
  });

  describe('automatic sidebar collapse on nav click', () => {
    it('calls closeSidebar when a nav link is clicked on a small screen', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      const closeSidebar = jest.fn();
      setupStore({ closeSidebar });

      render(<Sidebar />);

      await userEvent.click(screen.getByRole('link', { name: /images/i }));

      expect(closeSidebar).toHaveBeenCalledTimes(1);
    });

    it('does not call closeSidebar when a nav link is clicked on a large screen', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });
      const closeSidebar = jest.fn();
      setupStore({ closeSidebar });

      render(<Sidebar />);

      await userEvent.click(screen.getByRole('link', { name: /images/i }));

      expect(closeSidebar).not.toHaveBeenCalled();
    });

    it('calls closeSidebar when another nav link is clicked on a small screen', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      const closeSidebar = jest.fn();
      setupStore({ closeSidebar });

      render(<Sidebar />);

      await userEvent.click(screen.getByRole('link', { name: /palettes/i }));

      expect(closeSidebar).toHaveBeenCalledTimes(1);
    });
  });
});
