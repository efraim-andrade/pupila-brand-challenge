import { filterPalettes } from '../../lib/filterPalettes'
import type { ColorPalette, FilterState } from '@/types'

const makeComment = (text: string) => ({
  id: 'c1',
  text,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
})

const makePalette = (overrides: Partial<ColorPalette> = {}): ColorPalette => ({
  id: 'pal1',
  name: 'Ocean Depths',
  colors: [{ hex: '#0f172a' }],
  groupId: null,
  tagIds: [],
  comments: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

const noFilter: FilterState = { search: '', groupId: null, tagIds: [] }

describe('filterPalettes', () => {
  describe('with no active filters', () => {
    it('returns all palettes when filter is empty', () => {
      const palettes = [makePalette({ id: 'p1' }), makePalette({ id: 'p2' })]
      expect(filterPalettes(palettes, noFilter, {})).toEqual(palettes)
    })

    it('returns an empty array when there are no palettes', () => {
      expect(filterPalettes([], noFilter, {})).toEqual([])
    })
  })

  describe('groupId filter', () => {
    it('keeps only palettes whose groupId matches', () => {
      const palettes = [
        makePalette({ id: 'p1', groupId: 'g1' }),
        makePalette({ id: 'p2', groupId: 'g2' }),
        makePalette({ id: 'p3', groupId: 'g1' }),
      ]
      const filter: FilterState = { ...noFilter, groupId: 'g1' }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p1', 'p3'])
    })

    it('excludes palettes with a null groupId when a groupId filter is active', () => {
      const palettes = [
        makePalette({ id: 'p1', groupId: null }),
        makePalette({ id: 'p2', groupId: 'g1' }),
      ]
      const filter: FilterState = { ...noFilter, groupId: 'g1' }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p2'])
    })

    it('returns all palettes when groupId filter is null', () => {
      const palettes = [
        makePalette({ id: 'p1', groupId: 'g1' }),
        makePalette({ id: 'p2', groupId: null }),
      ]
      expect(filterPalettes(palettes, noFilter, {}).length).toBe(2)
    })
  })

  describe('tagIds filter', () => {
    it('keeps palettes that include at least one of the selected tag ids', () => {
      const palettes = [
        makePalette({ id: 'p1', tagIds: ['t1', 't2'] }),
        makePalette({ id: 'p2', tagIds: ['t3'] }),
        makePalette({ id: 'p3', tagIds: ['t2', 't4'] }),
      ]
      const filter: FilterState = { ...noFilter, tagIds: ['t2'] }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p1', 'p3'])
    })

    it('keeps a palette that matches any of multiple selected tag ids', () => {
      const palettes = [
        makePalette({ id: 'p1', tagIds: ['t1'] }),
        makePalette({ id: 'p2', tagIds: ['t2'] }),
        makePalette({ id: 'p3', tagIds: ['t3'] }),
      ]
      const filter: FilterState = { ...noFilter, tagIds: ['t1', 't2'] }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p1', 'p2'])
    })

    it('excludes palettes with no matching tag ids', () => {
      const palettes = [makePalette({ id: 'p1', tagIds: ['t3'] })]
      const filter: FilterState = { ...noFilter, tagIds: ['t1', 't2'] }
      expect(filterPalettes(palettes, filter, {})).toEqual([])
    })

    it('does not filter by tags when tagIds is empty', () => {
      const palettes = [makePalette({ id: 'p1', tagIds: [] }), makePalette({ id: 'p2', tagIds: ['t1'] })]
      expect(filterPalettes(palettes, noFilter, {}).length).toBe(2)
    })
  })

  describe('search filter', () => {
    it('matches palettes whose name contains the query (case-insensitive)', () => {
      const palettes = [
        makePalette({ id: 'p1', name: 'Ocean Depths' }),
        makePalette({ id: 'p2', name: 'Sunset Warm' }),
      ]
      const filter: FilterState = { ...noFilter, search: 'ocean' }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p1'])
    })

    it('matches palettes whose tag name contains the query', () => {
      const palettes = [
        makePalette({ id: 'p1', name: 'Alpha', tagIds: ['t1'] }),
        makePalette({ id: 'p2', name: 'Beta', tagIds: ['t2'] }),
      ]
      const tagNamesById = { t1: 'minimal', t2: 'bold' }
      const filter: FilterState = { ...noFilter, search: 'minim' }
      const result = filterPalettes(palettes, filter, tagNamesById)
      expect(result.map((p) => p.id)).toEqual(['p1'])
    })

    it('matches palettes whose comment text contains the query', () => {
      const palettes = [
        makePalette({ id: 'p1', comments: [makeComment('Perfect for SaaS product')] }),
        makePalette({ id: 'p2', comments: [makeComment('Great for hero sections')] }),
      ]
      const filter: FilterState = { ...noFilter, search: 'saas' }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p1'])
    })

    it('excludes palettes that match none of name, tag, or comment', () => {
      const palettes = [makePalette({ id: 'p1', name: 'Ocean', tagIds: ['t1'], comments: [] })]
      const tagNamesById = { t1: 'minimal' }
      const filter: FilterState = { ...noFilter, search: 'zzznomatch' }
      expect(filterPalettes(palettes, filter, tagNamesById)).toEqual([])
    })

    it('returns all palettes when search is an empty string', () => {
      const palettes = [makePalette({ id: 'p1' }), makePalette({ id: 'p2' })]
      expect(filterPalettes(palettes, { ...noFilter, search: '' }, {}).length).toBe(2)
    })
  })

  describe('combined filters', () => {
    it('applies groupId and search together (AND logic)', () => {
      const palettes = [
        makePalette({ id: 'p1', name: 'Ocean', groupId: 'g1' }),
        makePalette({ id: 'p2', name: 'Ocean', groupId: 'g2' }),
        makePalette({ id: 'p3', name: 'Forest', groupId: 'g1' }),
      ]
      const filter: FilterState = { search: 'ocean', groupId: 'g1', tagIds: [] }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p1'])
    })

    it('applies tagIds and search together (AND logic)', () => {
      const palettes = [
        makePalette({ id: 'p1', name: 'Ocean', tagIds: ['t1'] }),
        makePalette({ id: 'p2', name: 'Forest', tagIds: ['t1'] }),
        makePalette({ id: 'p3', name: 'Ocean', tagIds: ['t2'] }),
      ]
      const filter: FilterState = { search: 'ocean', groupId: null, tagIds: ['t1'] }
      const result = filterPalettes(palettes, filter, {})
      expect(result.map((p) => p.id)).toEqual(['p1'])
    })
  })
})
