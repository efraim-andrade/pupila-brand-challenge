import { createColorItem } from '../ColorEditor'

jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'test-id') }))

describe('createColorItem', () => {
  it('returns an item with the provided hex color', () => {
    const item = createColorItem('#ff0000')
    expect(item.hex).toBe('#ff0000')
  })

  it('uses the default hex #6366f1 when no argument is given', () => {
    const item = createColorItem()
    expect(item.hex).toBe('#6366f1')
  })

  it('sets an empty name by default', () => {
    expect(createColorItem().name).toBe('')
  })

  it('assigns the id from nanoid', () => {
    const item = createColorItem()
    expect(item.id).toBe('test-id')
  })
})
