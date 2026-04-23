import { colorItemsToColors, paletteColorsToItems, toggleTagId } from '../colorEditorUtils'

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }))

describe('colorItemsToColors', () => {
  it('filters out items with invalid hex values', () => {
    const items = [
      { id: '1', hex: '#ff0000', name: '' },
      { id: '2', hex: 'notahex', name: '' },
    ]
    expect(colorItemsToColors(items)).toEqual([{ hex: '#ff0000' }])
  })

  it('omits the name field when name is empty', () => {
    const items = [{ id: '1', hex: '#ffffff', name: '' }]
    expect(colorItemsToColors(items)).toEqual([{ hex: '#ffffff' }])
  })

  it('includes the name field when name is non-empty', () => {
    const items = [{ id: '1', hex: '#ffffff', name: 'White' }]
    expect(colorItemsToColors(items)).toEqual([{ hex: '#ffffff', name: 'White' }])
  })

  it('returns an empty array when given an empty list', () => {
    expect(colorItemsToColors([])).toEqual([])
  })

  it('returns an empty array when all items have invalid hex values', () => {
    const items = [{ id: '1', hex: 'bad', name: '' }]
    expect(colorItemsToColors(items)).toEqual([])
  })

  it('preserves order of valid items', () => {
    const items = [
      { id: '1', hex: '#ff0000', name: 'Red' },
      { id: '2', hex: '#00ff00', name: 'Green' },
      { id: '3', hex: '#0000ff', name: 'Blue' },
    ]
    const result = colorItemsToColors(items)
    expect(result.map((c) => c.hex)).toEqual(['#ff0000', '#00ff00', '#0000ff'])
  })
})

describe('paletteColorsToItems', () => {
  it('preserves the hex value from the palette color', () => {
    const [item] = paletteColorsToItems([{ hex: '#ff0000' }])
    expect(item.hex).toBe('#ff0000')
  })

  it('sets name to empty string when palette color has no name', () => {
    const [item] = paletteColorsToItems([{ hex: '#ff0000' }])
    expect(item.name).toBe('')
  })

  it('preserves the name from the palette color', () => {
    const [item] = paletteColorsToItems([{ hex: '#ff0000', name: 'Red' }])
    expect(item.name).toBe('Red')
  })

  it('assigns an id to each item', () => {
    const [item] = paletteColorsToItems([{ hex: '#ff0000' }])
    expect(item.id).toBe('test-id')
  })

  it('returns an empty array when colors is empty', () => {
    expect(paletteColorsToItems([])).toEqual([])
  })

  it('converts multiple colors preserving order', () => {
    const colors = [{ hex: '#ff0000', name: 'Red' }, { hex: '#0000ff' }]
    const items = paletteColorsToItems(colors)
    expect(items[0].hex).toBe('#ff0000')
    expect(items[0].name).toBe('Red')
    expect(items[1].hex).toBe('#0000ff')
    expect(items[1].name).toBe('')
  })
})

describe('toggleTagId', () => {
  it('adds the tag id when it is not present', () => {
    expect(toggleTagId(['t1', 't2'], 't3')).toEqual(['t1', 't2', 't3'])
  })

  it('removes the tag id when it is already present', () => {
    expect(toggleTagId(['t1', 't2', 't3'], 't2')).toEqual(['t1', 't3'])
  })

  it('adds the tag id to an empty array', () => {
    expect(toggleTagId([], 't1')).toEqual(['t1'])
  })

  it('removes the only element, leaving an empty array', () => {
    expect(toggleTagId(['t1'], 't1')).toEqual([])
  })

  it('does not mutate the original array', () => {
    const original = ['t1', 't2']
    toggleTagId(original, 't3')
    expect(original).toEqual(['t1', 't2'])
  })
})
