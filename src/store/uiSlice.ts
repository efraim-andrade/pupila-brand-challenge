import type { StateCreator } from 'zustand'
import type { ActiveModule, ModalState } from '@/types'
import type { AppStore } from './index'

export interface UISlice {
  activeModule: ActiveModule
  sidebarOpen: boolean
  modal: ModalState | null
  hydrated: boolean

  setActiveModule: (module: ActiveModule) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  openModal: (modal: ModalState) => void
  closeModal: () => void
  setHydrated: (hydrated: boolean) => void
}

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set) => ({
  activeModule: 'images',
  sidebarOpen: true,
  modal: null,
  hydrated: false,

  setActiveModule: (module) => set({ activeModule: module }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
  setHydrated: (hydrated) => set({ hydrated }),
})
