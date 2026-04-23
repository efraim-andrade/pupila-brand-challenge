import { create } from 'zustand'
import { createImagesSlice } from '../imagesSlice'
import { createPalettesSlice } from '../palettesSlice'
import { createOrganizationSlice } from '../organizationSlice'
import { createUISlice } from '../uiSlice'
import type { AppStore } from '../index'

jest.mock('@/lib/db', () => ({
  imageDB: { put: jest.fn(), delete: jest.fn() },
  paletteDB: { put: jest.fn(), delete: jest.fn() },
  groupDB: { put: jest.fn(), delete: jest.fn() },
  tagDB: { put: jest.fn(), delete: jest.fn() },
}))

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }))

const makeStore = () =>
  create<AppStore>()((...args) => ({
    ...createImagesSlice(...args),
    ...createPalettesSlice(...args),
    ...createOrganizationSlice(...args),
    ...createUISlice(...args),
  }))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('uiSlice — initial state', () => {
  it('starts with sidebarOpen true', () => {
    const store = makeStore()
    expect(store.getState().sidebarOpen).toBe(true)
  })

  it('starts with modal null', () => {
    const store = makeStore()
    expect(store.getState().modal).toBeNull()
  })

  it('starts with hydrated false', () => {
    const store = makeStore()
    expect(store.getState().hydrated).toBe(false)
  })
})

describe('toggleSidebar', () => {
  it('flips sidebarOpen from true to false', () => {
    const store = makeStore()
    store.getState().toggleSidebar()
    expect(store.getState().sidebarOpen).toBe(false)
  })

  it('flips sidebarOpen from false back to true', () => {
    const store = makeStore()
    store.getState().toggleSidebar()
    store.getState().toggleSidebar()
    expect(store.getState().sidebarOpen).toBe(true)
  })
})

describe('closeSidebar', () => {
  it('sets sidebarOpen to false when it is true', () => {
    const store = makeStore()
    store.getState().closeSidebar()
    expect(store.getState().sidebarOpen).toBe(false)
  })

  it('keeps sidebarOpen false when already closed', () => {
    const store = makeStore()
    store.getState().closeSidebar()
    store.getState().closeSidebar()
    expect(store.getState().sidebarOpen).toBe(false)
  })
})

describe('openModal', () => {
  it('sets the modal state with the provided modal object', () => {
    const store = makeStore()
    store.getState().openModal({ type: 'addImage' })
    expect(store.getState().modal).toEqual({ type: 'addImage' })
  })

  it('sets the modal state including an optional payload', () => {
    const store = makeStore()
    store.getState().openModal({ type: 'editImage', payload: { id: 'img-1' } })
    expect(store.getState().modal).toEqual({ type: 'editImage', payload: { id: 'img-1' } })
  })

  it('replaces an existing modal with the new one', () => {
    const store = makeStore()
    store.getState().openModal({ type: 'addImage' })
    store.getState().openModal({ type: 'addPalette' })
    expect(store.getState().modal).toEqual({ type: 'addPalette' })
  })
})

describe('closeModal', () => {
  it('sets modal to null', () => {
    const store = makeStore()
    store.getState().openModal({ type: 'addImage' })
    store.getState().closeModal()
    expect(store.getState().modal).toBeNull()
  })

  it('is a no-op when modal is already null', () => {
    const store = makeStore()
    store.getState().closeModal()
    expect(store.getState().modal).toBeNull()
  })
})

describe('setHydrated', () => {
  it('sets hydrated to true', () => {
    const store = makeStore()
    store.getState().setHydrated(true)
    expect(store.getState().hydrated).toBe(true)
  })

  it('sets hydrated back to false', () => {
    const store = makeStore()
    store.getState().setHydrated(true)
    store.getState().setHydrated(false)
    expect(store.getState().hydrated).toBe(false)
  })
})
