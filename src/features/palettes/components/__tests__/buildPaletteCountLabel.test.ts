import { buildPaletteCountLabel } from '../PalettesToolbar'

describe('buildPaletteCountLabel', () => {
  describe('when no filter is active (filteredCount equals totalCount)', () => {
    it('uses singular "palette" for a single item', () => {
      expect(buildPaletteCountLabel(1, 1)).toBe('1 palette')
    })

    it('uses plural "palettes" for zero items', () => {
      expect(buildPaletteCountLabel(0, 0)).toBe('0 palettes')
    })

    it('uses plural "palettes" for more than one item', () => {
      expect(buildPaletteCountLabel(5, 5)).toBe('5 palettes')
    })
  })

  describe('when a filter is active (filteredCount differs from totalCount)', () => {
    it('returns "M of N" format', () => {
      expect(buildPaletteCountLabel(3, 10)).toBe('3 of 10')
    })

    it('returns "0 of N" when no palettes match the filter', () => {
      expect(buildPaletteCountLabel(0, 8)).toBe('0 of 8')
    })
  })
})
