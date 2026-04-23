import type { StateCreator } from 'zustand'
import type { ModalState } from '@/types'
import type { AppStore } from './index'

export interface UISlice {
  sidebarOpen: boolean
  modal: ModalState | null
  hydrated: boolean

  toggleSidebar: () => void
  closeSidebar: () => void
  openModal: (modal: ModalState) => void
  closeModal: () => void
  setHydrated: (hydrated: boolean) => void
}

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set) => ({
  sidebarOpen: true,
  modal: null,
  hydrated: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
  setHydrated: (hydrated) => set({ hydrated }),
})
