import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { Image, FilterState, ViewMode } from '@/types'
import { imageDB } from '@/lib/db'
import type { AppStore } from './index'

export interface ImagesSlice {
  images: Image[]
  imagesViewMode: ViewMode
  imagesFilter: FilterState

  hydrateImages: (images: Image[]) => void
  addImage: (fields: Omit<Image, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateImage: (id: string, updates: Partial<Omit<Image, 'id' | 'createdAt'>>) => void
  deleteImage: (id: string) => void
  addImageComment: (imageId: string, text: string) => void
  updateImageComment: (imageId: string, commentId: string, text: string) => void
  deleteImageComment: (imageId: string, commentId: string) => void
  setImagesViewMode: (mode: ViewMode) => void
  setImagesFilter: (filter: Partial<FilterState>) => void
  resetImagesFilter: () => void
}

const defaultFilter: FilterState = { search: '', groupId: null, tagIds: [] }

export const createImagesSlice: StateCreator<AppStore, [], [], ImagesSlice> = (set) => ({
  images: [],
  imagesViewMode: 'grid',
  imagesFilter: defaultFilter,

  hydrateImages: (images) => set({ images }),

  addImage: (fields) => {
    const image: Image = {
      ...fields,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({ images: [image, ...state.images] }))
    imageDB.put(image)
  },

  updateImage: (id, updates) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...updates, updatedAt: new Date().toISOString() } : img
      ),
    }))
    set((state) => {
      const updated = state.images.find((img) => img.id === id)
      if (updated) imageDB.put(updated)
      return {}
    })
  },

  deleteImage: (id) => {
    set((state) => ({ images: state.images.filter((img) => img.id !== id) }))
    imageDB.delete(id)
  },

  addImageComment: (imageId, text) => {
    const comment = { id: nanoid(), text, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId
          ? { ...img, comments: [...img.comments, comment], updatedAt: new Date().toISOString() }
          : img
      ),
    }))
    set((state) => {
      const updated = state.images.find((img) => img.id === imageId)
      if (updated) imageDB.put(updated)
      return {}
    })
  },

  updateImageComment: (imageId, commentId, text) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId
          ? {
              ...img,
              comments: img.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, text, updatedAt: new Date().toISOString() }
                  : comment
              ),
              updatedAt: new Date().toISOString(),
            }
          : img
      ),
    }))
    set((state) => {
      const updated = state.images.find((img) => img.id === imageId)
      if (updated) imageDB.put(updated)
      return {}
    })
  },

  deleteImageComment: (imageId, commentId) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId
          ? {
              ...img,
              comments: img.comments.filter((comment) => comment.id !== commentId),
              updatedAt: new Date().toISOString(),
            }
          : img
      ),
    }))
    set((state) => {
      const updated = state.images.find((img) => img.id === imageId)
      if (updated) imageDB.put(updated)
      return {}
    })
  },

  setImagesViewMode: (mode) => set({ imagesViewMode: mode }),

  setImagesFilter: (filter) =>
    set((state) => ({ imagesFilter: { ...state.imagesFilter, ...filter } })),

  resetImagesFilter: () => set({ imagesFilter: defaultFilter }),
})
