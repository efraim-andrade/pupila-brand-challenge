import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { ColorPalette, FilterState, ViewMode } from '@/types'
import { paletteDB } from '@/lib/db'
import type { AppStore } from './index'

export interface PalettesSlice {
  palettes: ColorPalette[]
  palettesViewMode: ViewMode
  palettesFilter: FilterState

  hydratePalettes: (palettes: ColorPalette[]) => void
  addPalette: (fields: Omit<ColorPalette, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePalette: (id: string, updates: Partial<Omit<ColorPalette, 'id' | 'createdAt'>>) => void
  deletePalette: (id: string) => void
  addPaletteComment: (paletteId: string, text: string) => void
  updatePaletteComment: (paletteId: string, commentId: string, text: string) => void
  deletePaletteComment: (paletteId: string, commentId: string) => void
  setPalettesViewMode: (mode: ViewMode) => void
  setPalettesFilter: (filter: Partial<FilterState>) => void
  resetPalettesFilter: () => void
}

const defaultFilter: FilterState = { search: '', groupId: null, tagIds: [] }

export const createPalettesSlice: StateCreator<AppStore, [], [], PalettesSlice> = (set) => ({
  palettes: [],
  palettesViewMode: 'grid',
  palettesFilter: defaultFilter,

  hydratePalettes: (palettes) => set({ palettes }),

  addPalette: (fields) => {
    const palette: ColorPalette = {
      ...fields,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({ palettes: [palette, ...state.palettes] }))
    paletteDB.put(palette)
  },

  updatePalette: (id, updates) => {
    set((state) => ({
      palettes: state.palettes.map((palette) =>
        palette.id === id ? { ...palette, ...updates, updatedAt: new Date().toISOString() } : palette
      ),
    }))
    set((state) => {
      const updated = state.palettes.find((palette) => palette.id === id)
      if (updated) paletteDB.put(updated)
      return {}
    })
  },

  deletePalette: (id) => {
    set((state) => ({ palettes: state.palettes.filter((palette) => palette.id !== id) }))
    paletteDB.delete(id)
  },

  addPaletteComment: (paletteId, text) => {
    const comment = { id: nanoid(), text, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    set((state) => ({
      palettes: state.palettes.map((palette) =>
        palette.id === paletteId
          ? { ...palette, comments: [...palette.comments, comment], updatedAt: new Date().toISOString() }
          : palette
      ),
    }))
    set((state) => {
      const updated = state.palettes.find((palette) => palette.id === paletteId)
      if (updated) paletteDB.put(updated)
      return {}
    })
  },

  updatePaletteComment: (paletteId, commentId, text) => {
    set((state) => ({
      palettes: state.palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              comments: palette.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, text, updatedAt: new Date().toISOString() }
                  : comment
              ),
              updatedAt: new Date().toISOString(),
            }
          : palette
      ),
    }))
    set((state) => {
      const updated = state.palettes.find((palette) => palette.id === paletteId)
      if (updated) paletteDB.put(updated)
      return {}
    })
  },

  deletePaletteComment: (paletteId, commentId) => {
    set((state) => ({
      palettes: state.palettes.map((palette) =>
        palette.id === paletteId
          ? {
              ...palette,
              comments: palette.comments.filter((comment) => comment.id !== commentId),
              updatedAt: new Date().toISOString(),
            }
          : palette
      ),
    }))
    set((state) => {
      const updated = state.palettes.find((palette) => palette.id === paletteId)
      if (updated) paletteDB.put(updated)
      return {}
    })
  },

  setPalettesViewMode: (mode) => set({ palettesViewMode: mode }),

  setPalettesFilter: (filter) =>
    set((state) => ({ palettesFilter: { ...state.palettesFilter, ...filter } })),

  resetPalettesFilter: () => set({ palettesFilter: defaultFilter }),
})
