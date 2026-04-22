import { openDB, type IDBPDatabase } from 'idb'
import type { Image, ColorPalette, Group, Tag } from '@/types'

const DB_NAME = 'pupila-brand-zone'
const DB_VERSION = 1

interface Schema {
  images: { key: string; value: Image; indexes: { by_group: string } }
  palettes: { key: string; value: ColorPalette; indexes: { by_group: string } }
  groups: { key: string; value: Group }
  tags: { key: string; value: Tag }
}

let dbInstance: IDBPDatabase<Schema> | null = null

async function getDB(): Promise<IDBPDatabase<Schema>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<Schema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const imageStore = db.createObjectStore('images', { keyPath: 'id' })
      imageStore.createIndex('by_group', 'groupId')

      const paletteStore = db.createObjectStore('palettes', { keyPath: 'id' })
      paletteStore.createIndex('by_group', 'groupId')

      db.createObjectStore('groups', { keyPath: 'id' })
      db.createObjectStore('tags', { keyPath: 'id' })
    },
  })
  return dbInstance
}

export const imageDB = {
  getAll: async () => (await getDB()).getAll('images'),
  put: async (item: Image) => (await getDB()).put('images', item),
  delete: async (id: string) => (await getDB()).delete('images', id),
}

export const paletteDB = {
  getAll: async () => (await getDB()).getAll('palettes'),
  put: async (item: ColorPalette) => (await getDB()).put('palettes', item),
  delete: async (id: string) => (await getDB()).delete('palettes', id),
}

export const groupDB = {
  getAll: async () => (await getDB()).getAll('groups'),
  put: async (item: Group) => (await getDB()).put('groups', item),
  delete: async (id: string) => (await getDB()).delete('groups', id),
}

export const tagDB = {
  getAll: async () => (await getDB()).getAll('tags'),
  put: async (item: Tag) => (await getDB()).put('tags', item),
  delete: async (id: string) => (await getDB()).delete('tags', id),
}

export async function exportAllData() {
  const [images, palettes, groups, tags] = await Promise.all([
    imageDB.getAll(),
    paletteDB.getAll(),
    groupDB.getAll(),
    tagDB.getAll(),
  ])
  return { images, palettes, groups, tags }
}

export async function clearAndImportData(snapshot: {
  images: Image[]
  palettes: ColorPalette[]
  groups: Group[]
  tags: Tag[]
}) {
  const db = await getDB()
  const tx = db.transaction(['images', 'palettes', 'groups', 'tags'], 'readwrite')
  await Promise.all([
    tx.objectStore('images').clear(),
    tx.objectStore('palettes').clear(),
    tx.objectStore('groups').clear(),
    tx.objectStore('tags').clear(),
  ])
  await Promise.all([
    ...snapshot.images.map((image) => tx.objectStore('images').put(image)),
    ...snapshot.palettes.map((palette) => tx.objectStore('palettes').put(palette)),
    ...snapshot.groups.map((group) => tx.objectStore('groups').put(group)),
    ...snapshot.tags.map((tag) => tx.objectStore('tags').put(tag)),
  ])
  await tx.done
}
