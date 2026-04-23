import { create } from 'zustand'
import { createImagesSlice } from '../imagesSlice'
import { createPalettesSlice } from '../palettesSlice'
import { createOrganizationSlice } from '../organizationSlice'
import { createUISlice } from '../uiSlice'
import type { AppStore } from '../index'
import type { Image } from '@/types'
import { imageDB } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  imageDB: { put: jest.fn(), delete: jest.fn() },
  paletteDB: { put: jest.fn(), delete: jest.fn() },
  groupDB: { put: jest.fn(), delete: jest.fn() },
  tagDB: { put: jest.fn(), delete: jest.fn() },
}))

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }))

const mockedImageDB = imageDB as jest.Mocked<typeof imageDB>

const makeStore = () =>
  create<AppStore>()((...args) => ({
    ...createImagesSlice(...args),
    ...createPalettesSlice(...args),
    ...createOrganizationSlice(...args),
    ...createUISlice(...args),
  }))

const makeImage = (overrides: Partial<Image> = {}): Image => ({
  id: 'img-1',
  url: 'https://example.com/photo.jpg',
  name: 'Test Image',
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('imagesSlice — initial state', () => {
  it('starts with an empty images array', () => {
    const store = makeStore()
    expect(store.getState().images).toEqual([])
  })

  it('starts with imagesViewMode as grid', () => {
    const store = makeStore()
    expect(store.getState().imagesViewMode).toBe('grid')
  })

  it('starts with the default imagesFilter', () => {
    const store = makeStore()
    expect(store.getState().imagesFilter).toEqual({ search: '', groupId: null, tagIds: [] })
  })
})

describe('hydrateImages', () => {
  it('replaces the images array with the provided images', () => {
    const store = makeStore()
    const images = [makeImage({ id: 'img-1' }), makeImage({ id: 'img-2' })]

    store.getState().hydrateImages(images)

    expect(store.getState().images).toEqual(images)
  })

  it('replaces existing images on subsequent calls', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage()])
    store.getState().hydrateImages([])

    expect(store.getState().images).toEqual([])
  })
})

describe('addImage', () => {
  it('prepends the new image to the front of the images array', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'existing' })])

    store.getState().addImage({ url: 'https://example.com/new.jpg', name: 'New', groupId: null, tagIds: [], comments: [] })

    expect(store.getState().images[0].url).toBe('https://example.com/new.jpg')
    expect(store.getState().images[1].id).toBe('existing')
  })

  it('assigns the id returned by nanoid', () => {
    const store = makeStore()
    store.getState().addImage({ url: 'https://example.com/x.jpg', name: 'X', groupId: null, tagIds: [], comments: [] })

    expect(store.getState().images[0].id).toBe('test-id')
  })

  it('sets createdAt and updatedAt as ISO strings', () => {
    const store = makeStore()
    store.getState().addImage({ url: 'https://example.com/x.jpg', name: 'X', groupId: null, tagIds: [], comments: [] })

    const { createdAt, updatedAt } = store.getState().images[0]
    expect(typeof createdAt).toBe('string')
    expect(typeof updatedAt).toBe('string')
  })

  it('calls imageDB.put with the created image', () => {
    const store = makeStore()
    store.getState().addImage({ url: 'https://example.com/x.jpg', name: 'X', groupId: null, tagIds: [], comments: [] })

    expect(mockedImageDB.put).toHaveBeenCalledWith(expect.objectContaining({ id: 'test-id', url: 'https://example.com/x.jpg' }))
  })
})

describe('updateImage', () => {
  it('merges updates into the matching image', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', name: 'Old Name' })])

    store.getState().updateImage('img-1', { name: 'New Name' })

    expect(store.getState().images[0].name).toBe('New Name')
  })

  it('refreshes updatedAt on the matching image', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', updatedAt: '2024-01-01T00:00:00.000Z' })])

    store.getState().updateImage('img-1', { name: 'Updated' })

    expect(typeof store.getState().images[0].updatedAt).toBe('string')
  })

  it('leaves non-matching images unchanged', () => {
    const store = makeStore()
    const imageA = makeImage({ id: 'img-1', name: 'Alpha' })
    const imageB = makeImage({ id: 'img-2', name: 'Beta' })
    store.getState().hydrateImages([imageA, imageB])

    store.getState().updateImage('img-1', { name: 'Alpha Updated' })

    expect(store.getState().images[1]).toEqual(imageB)
  })

  it('calls imageDB.put with the updated image', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', name: 'Old' })])

    store.getState().updateImage('img-1', { name: 'New' })

    expect(mockedImageDB.put).toHaveBeenCalledWith(expect.objectContaining({ id: 'img-1', name: 'New' }))
  })
})

describe('deleteImage', () => {
  it('removes the image with the matching id', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1' })])

    store.getState().deleteImage('img-1')

    expect(store.getState().images).toHaveLength(0)
  })

  it('leaves non-matching images in the array', () => {
    const store = makeStore()
    const imageA = makeImage({ id: 'img-1' })
    const imageB = makeImage({ id: 'img-2' })
    store.getState().hydrateImages([imageA, imageB])

    store.getState().deleteImage('img-1')

    expect(store.getState().images).toEqual([imageB])
  })

  it('calls imageDB.delete with the target id', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1' })])

    store.getState().deleteImage('img-1')

    expect(mockedImageDB.delete).toHaveBeenCalledWith('img-1')
  })
})

describe('addImageComment', () => {
  it('appends the comment to the matching image', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [] })])

    store.getState().addImageComment('img-1', 'Nice shot!')

    expect(store.getState().images[0].comments).toHaveLength(1)
  })

  it('assigns an id from nanoid to the new comment', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [] })])

    store.getState().addImageComment('img-1', 'Nice!')

    expect(store.getState().images[0].comments[0].id).toBe('test-id')
  })

  it('stores the provided comment text', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [] })])

    store.getState().addImageComment('img-1', 'Great image')

    expect(store.getState().images[0].comments[0].text).toBe('Great image')
  })

  it('sets comment createdAt and updatedAt as strings', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [] })])

    store.getState().addImageComment('img-1', 'Hello')

    const { createdAt, updatedAt } = store.getState().images[0].comments[0]
    expect(typeof createdAt).toBe('string')
    expect(typeof updatedAt).toBe('string')
  })

  it('calls imageDB.put with the updated image', () => {
    const store = makeStore()
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [] })])

    store.getState().addImageComment('img-1', 'Hello')

    expect(mockedImageDB.put).toHaveBeenCalledWith(expect.objectContaining({ id: 'img-1' }))
  })

  it('does not mutate non-matching images', () => {
    const store = makeStore()
    const imageB = makeImage({ id: 'img-2', comments: [] })
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [] }), imageB])

    store.getState().addImageComment('img-1', 'Hello')

    expect(store.getState().images[1].comments).toHaveLength(0)
  })
})

describe('updateImageComment', () => {
  it('updates the text of the matching comment', () => {
    const store = makeStore()
    const comment = { id: 'c-1', text: 'Original', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [comment] })])

    store.getState().updateImageComment('img-1', 'c-1', 'Updated text')

    expect(store.getState().images[0].comments[0].text).toBe('Updated text')
  })

  it('refreshes comment.updatedAt', () => {
    const store = makeStore()
    const comment = { id: 'c-1', text: 'Old', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [comment] })])

    store.getState().updateImageComment('img-1', 'c-1', 'New')

    expect(typeof store.getState().images[0].comments[0].updatedAt).toBe('string')
  })

  it('refreshes image.updatedAt', () => {
    const store = makeStore()
    const comment = { id: 'c-1', text: 'Old', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', updatedAt: '2024-01-01T00:00:00.000Z', comments: [comment] })])

    store.getState().updateImageComment('img-1', 'c-1', 'New')

    expect(typeof store.getState().images[0].updatedAt).toBe('string')
  })

  it('calls imageDB.put with the updated image', () => {
    const store = makeStore()
    const comment = { id: 'c-1', text: 'Old', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [comment] })])

    store.getState().updateImageComment('img-1', 'c-1', 'New')

    expect(mockedImageDB.put).toHaveBeenCalledWith(expect.objectContaining({ id: 'img-1' }))
  })
})

describe('deleteImageComment', () => {
  it('removes the matching comment from the image', () => {
    const store = makeStore()
    const comment = { id: 'c-1', text: 'Hello', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [comment] })])

    store.getState().deleteImageComment('img-1', 'c-1')

    expect(store.getState().images[0].comments).toHaveLength(0)
  })

  it('leaves non-matching comments in the array', () => {
    const store = makeStore()
    const commentA = { id: 'c-1', text: 'A', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    const commentB = { id: 'c-2', text: 'B', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [commentA, commentB] })])

    store.getState().deleteImageComment('img-1', 'c-1')

    expect(store.getState().images[0].comments).toEqual([commentB])
  })

  it('refreshes image.updatedAt', () => {
    const store = makeStore()
    const comment = { id: 'c-1', text: 'Hello', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', updatedAt: '2024-01-01T00:00:00.000Z', comments: [comment] })])

    store.getState().deleteImageComment('img-1', 'c-1')

    expect(typeof store.getState().images[0].updatedAt).toBe('string')
  })

  it('calls imageDB.put with the updated image', () => {
    const store = makeStore()
    const comment = { id: 'c-1', text: 'Hello', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
    store.getState().hydrateImages([makeImage({ id: 'img-1', comments: [comment] })])

    store.getState().deleteImageComment('img-1', 'c-1')

    expect(mockedImageDB.put).toHaveBeenCalledWith(expect.objectContaining({ id: 'img-1' }))
  })
})

describe('setImagesViewMode', () => {
  it('sets the view mode to list', () => {
    const store = makeStore()
    store.getState().setImagesViewMode('list')
    expect(store.getState().imagesViewMode).toBe('list')
  })

  it('sets the view mode back to grid', () => {
    const store = makeStore()
    store.getState().setImagesViewMode('list')
    store.getState().setImagesViewMode('grid')
    expect(store.getState().imagesViewMode).toBe('grid')
  })
})

describe('setImagesFilter', () => {
  it('updates the search field while preserving other filter fields', () => {
    const store = makeStore()
    store.getState().setImagesFilter({ groupId: 'g-1' })
    store.getState().setImagesFilter({ search: 'sunset' })

    expect(store.getState().imagesFilter).toEqual({ search: 'sunset', groupId: 'g-1', tagIds: [] })
  })

  it('updates groupId while preserving search', () => {
    const store = makeStore()
    store.getState().setImagesFilter({ search: 'mountain' })
    store.getState().setImagesFilter({ groupId: 'g-2' })

    expect(store.getState().imagesFilter.search).toBe('mountain')
    expect(store.getState().imagesFilter.groupId).toBe('g-2')
  })

  it('updates tagIds without resetting search or groupId', () => {
    const store = makeStore()
    store.getState().setImagesFilter({ search: 'nature', groupId: 'g-1' })
    store.getState().setImagesFilter({ tagIds: ['t-1', 't-2'] })

    expect(store.getState().imagesFilter).toEqual({ search: 'nature', groupId: 'g-1', tagIds: ['t-1', 't-2'] })
  })
})

describe('resetImagesFilter', () => {
  it('resets the filter to the default values', () => {
    const store = makeStore()
    store.getState().setImagesFilter({ search: 'sunset', groupId: 'g-1', tagIds: ['t-1'] })

    store.getState().resetImagesFilter()

    expect(store.getState().imagesFilter).toEqual({ search: '', groupId: null, tagIds: [] })
  })
})
