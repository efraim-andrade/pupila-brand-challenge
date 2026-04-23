import { create } from 'zustand'
import { createImagesSlice } from '../imagesSlice'
import { createPalettesSlice } from '../palettesSlice'
import { createOrganizationSlice } from '../organizationSlice'
import { createUISlice } from '../uiSlice'
import type { AppStore } from '../index'
import type { Group, Tag } from '@/types'
import { groupDB, tagDB } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  imageDB: { put: jest.fn(), delete: jest.fn() },
  paletteDB: { put: jest.fn(), delete: jest.fn() },
  groupDB: { put: jest.fn(), delete: jest.fn() },
  tagDB: { put: jest.fn(), delete: jest.fn() },
}))

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }))

const mockedGroupDB = groupDB as jest.Mocked<typeof groupDB>
const mockedTagDB = tagDB as jest.Mocked<typeof tagDB>

const makeStore = () =>
  create<AppStore>()((...args) => ({
    ...createImagesSlice(...args),
    ...createPalettesSlice(...args),
    ...createOrganizationSlice(...args),
    ...createUISlice(...args),
  }))

const makeGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 'group-1',
  name: 'My Group',
  type: 'image',
  ...overrides,
})

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 'tag-1',
  name: 'My Tag',
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('organizationSlice — initial state', () => {
  it('starts with an empty groups array', () => {
    const store = makeStore()
    expect(store.getState().groups).toEqual([])
  })

  it('starts with an empty tags array', () => {
    const store = makeStore()
    expect(store.getState().tags).toEqual([])
  })
})

describe('hydrateOrganization', () => {
  it('replaces groups and tags with the provided arrays', () => {
    const store = makeStore()
    const groups = [makeGroup({ id: 'g-1' }), makeGroup({ id: 'g-2', type: 'palette' })]
    const tags = [makeTag({ id: 't-1' })]

    store.getState().hydrateOrganization(groups, tags)

    expect(store.getState().groups).toEqual(groups)
    expect(store.getState().tags).toEqual(tags)
  })

  it('replaces existing data on subsequent calls', () => {
    const store = makeStore()
    store.getState().hydrateOrganization([makeGroup()], [makeTag()])
    store.getState().hydrateOrganization([], [])

    expect(store.getState().groups).toEqual([])
    expect(store.getState().tags).toEqual([])
  })
})

describe('addGroup', () => {
  it('appends the new group to the groups array', () => {
    const store = makeStore()
    store.getState().addGroup({ name: 'Design', type: 'image' })
    expect(store.getState().groups).toHaveLength(1)
  })

  it('assigns an id from nanoid to the created group', () => {
    const store = makeStore()
    const created = store.getState().addGroup({ name: 'Design', type: 'image' })
    expect(created.id).toBe('test-id')
  })

  it('merges the provided fields into the created group', () => {
    const store = makeStore()
    const created = store.getState().addGroup({ name: 'Design', type: 'palette', color: '#ff0000' })
    expect(created).toEqual(expect.objectContaining({ name: 'Design', type: 'palette', color: '#ff0000' }))
  })

  it('returns the created group', () => {
    const store = makeStore()
    const returned = store.getState().addGroup({ name: 'Design', type: 'image' })
    expect(store.getState().groups[0]).toEqual(returned)
  })

  it('calls groupDB.put with the created group', () => {
    const store = makeStore()
    const created = store.getState().addGroup({ name: 'Design', type: 'image' })
    expect(mockedGroupDB.put).toHaveBeenCalledWith(created)
  })

  it('appends without removing existing groups', () => {
    const store = makeStore()
    store.getState().addGroup({ name: 'First', type: 'image' })
    store.getState().addGroup({ name: 'Second', type: 'palette' })
    expect(store.getState().groups).toHaveLength(2)
  })
})

describe('updateGroup', () => {
  it('merges updates into the matching group', () => {
    const store = makeStore()
    const existing = makeGroup({ id: 'g-1', name: 'Old Name', type: 'image' })
    store.getState().hydrateOrganization([existing], [])

    store.getState().updateGroup('g-1', { name: 'New Name' })

    expect(store.getState().groups[0]).toEqual(expect.objectContaining({ id: 'g-1', name: 'New Name', type: 'image' }))
  })

  it('leaves non-matching groups unchanged', () => {
    const store = makeStore()
    const groupA = makeGroup({ id: 'g-1', name: 'Alpha' })
    const groupB = makeGroup({ id: 'g-2', name: 'Beta' })
    store.getState().hydrateOrganization([groupA, groupB], [])

    store.getState().updateGroup('g-1', { name: 'Alpha Updated' })

    expect(store.getState().groups[1]).toEqual(groupB)
  })

  it('calls groupDB.put with the updated group', () => {
    const store = makeStore()
    const existing = makeGroup({ id: 'g-1', name: 'Old' })
    store.getState().hydrateOrganization([existing], [])

    store.getState().updateGroup('g-1', { name: 'New' })

    expect(mockedGroupDB.put).toHaveBeenCalledWith(expect.objectContaining({ id: 'g-1', name: 'New' }))
  })
})

describe('deleteGroup', () => {
  it('removes the group with the matching id', () => {
    const store = makeStore()
    const group = makeGroup({ id: 'g-1' })
    store.getState().hydrateOrganization([group], [])

    store.getState().deleteGroup('g-1')

    expect(store.getState().groups).toHaveLength(0)
  })

  it('leaves non-matching groups in the array', () => {
    const store = makeStore()
    const groupA = makeGroup({ id: 'g-1' })
    const groupB = makeGroup({ id: 'g-2' })
    store.getState().hydrateOrganization([groupA, groupB], [])

    store.getState().deleteGroup('g-1')

    expect(store.getState().groups).toEqual([groupB])
  })

  it('calls groupDB.delete with the target id', () => {
    const store = makeStore()
    store.getState().hydrateOrganization([makeGroup({ id: 'g-1' })], [])

    store.getState().deleteGroup('g-1')

    expect(mockedGroupDB.delete).toHaveBeenCalledWith('g-1')
  })
})

describe('addTag', () => {
  it('appends the new tag to the tags array', () => {
    const store = makeStore()
    store.getState().addTag({ name: 'Nature' })
    expect(store.getState().tags).toHaveLength(1)
  })

  it('assigns an id from nanoid to the created tag', () => {
    const store = makeStore()
    const created = store.getState().addTag({ name: 'Nature' })
    expect(created.id).toBe('test-id')
  })

  it('returns the created tag', () => {
    const store = makeStore()
    const returned = store.getState().addTag({ name: 'Nature' })
    expect(store.getState().tags[0]).toEqual(returned)
  })

  it('calls tagDB.put with the created tag', () => {
    const store = makeStore()
    const created = store.getState().addTag({ name: 'Nature' })
    expect(mockedTagDB.put).toHaveBeenCalledWith(created)
  })

  it('appends without removing existing tags', () => {
    const store = makeStore()
    store.getState().addTag({ name: 'First' })
    store.getState().addTag({ name: 'Second' })
    expect(store.getState().tags).toHaveLength(2)
  })
})

describe('updateTag', () => {
  it('merges updates into the matching tag', () => {
    const store = makeStore()
    store.getState().hydrateOrganization([], [makeTag({ id: 't-1', name: 'Old Name' })])

    store.getState().updateTag('t-1', { name: 'New Name' })

    expect(store.getState().tags[0]).toEqual(expect.objectContaining({ id: 't-1', name: 'New Name' }))
  })

  it('leaves non-matching tags unchanged', () => {
    const store = makeStore()
    const tagA = makeTag({ id: 't-1', name: 'Alpha' })
    const tagB = makeTag({ id: 't-2', name: 'Beta' })
    store.getState().hydrateOrganization([], [tagA, tagB])

    store.getState().updateTag('t-1', { name: 'Alpha Updated' })

    expect(store.getState().tags[1]).toEqual(tagB)
  })

  it('calls tagDB.put with the updated tag', () => {
    const store = makeStore()
    store.getState().hydrateOrganization([], [makeTag({ id: 't-1', name: 'Old' })])

    store.getState().updateTag('t-1', { name: 'New' })

    expect(mockedTagDB.put).toHaveBeenCalledWith(expect.objectContaining({ id: 't-1', name: 'New' }))
  })
})

describe('deleteTag', () => {
  it('removes the tag with the matching id', () => {
    const store = makeStore()
    store.getState().hydrateOrganization([], [makeTag({ id: 't-1' })])

    store.getState().deleteTag('t-1')

    expect(store.getState().tags).toHaveLength(0)
  })

  it('leaves non-matching tags in the array', () => {
    const store = makeStore()
    const tagA = makeTag({ id: 't-1' })
    const tagB = makeTag({ id: 't-2' })
    store.getState().hydrateOrganization([], [tagA, tagB])

    store.getState().deleteTag('t-1')

    expect(store.getState().tags).toEqual([tagB])
  })

  it('calls tagDB.delete with the target id', () => {
    const store = makeStore()
    store.getState().hydrateOrganization([], [makeTag({ id: 't-1' })])

    store.getState().deleteTag('t-1')

    expect(mockedTagDB.delete).toHaveBeenCalledWith('t-1')
  })
})
