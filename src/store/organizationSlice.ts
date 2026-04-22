import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'
import type { Group, Tag } from '@/types'
import { groupDB, tagDB } from '@/lib/db'
import type { AppStore } from './index'

export interface OrganizationSlice {
  groups: Group[]
  tags: Tag[]

  hydrateOrganization: (groups: Group[], tags: Tag[]) => void
  addGroup: (fields: Omit<Group, 'id'>) => Group
  updateGroup: (id: string, updates: Partial<Omit<Group, 'id'>>) => void
  deleteGroup: (id: string) => void
  addTag: (fields: Omit<Tag, 'id'>) => Tag
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id'>>) => void
  deleteTag: (id: string) => void
}

export const createOrganizationSlice: StateCreator<AppStore, [], [], OrganizationSlice> = (
  set
) => ({
  groups: [],
  tags: [],

  hydrateOrganization: (groups, tags) => set({ groups, tags }),

  addGroup: (fields) => {
    const group: Group = { ...fields, id: nanoid() }
    set((state) => ({ groups: [...state.groups, group] }))
    groupDB.put(group)
    return group
  },

  updateGroup: (id, updates) => {
    set((state) => ({
      groups: state.groups.map((group) => (group.id === id ? { ...group, ...updates } : group)),
    }))
    set((state) => {
      const updated = state.groups.find((group) => group.id === id)
      if (updated) groupDB.put(updated)
      return {}
    })
  },

  deleteGroup: (id) => {
    set((state) => ({ groups: state.groups.filter((group) => group.id !== id) }))
    groupDB.delete(id)
  },

  addTag: (fields) => {
    const tag: Tag = { ...fields, id: nanoid() }
    set((state) => ({ tags: [...state.tags, tag] }))
    tagDB.put(tag)
    return tag
  },

  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)),
    }))
    set((state) => {
      const updated = state.tags.find((tag) => tag.id === id)
      if (updated) tagDB.put(updated)
      return {}
    })
  },

  deleteTag: (id) => {
    set((state) => ({ tags: state.tags.filter((tag) => tag.id !== id) }))
    tagDB.delete(id)
  },
})
