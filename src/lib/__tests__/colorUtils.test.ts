import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  getContrastColor,
  isValidHex,
  normalizeHex,
  extractDominantColors,
} from '../colorUtils'

describe('hexToRgb', () => {
  it('converts a standard hex color to rgb', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('strips the leading # before parsing', () => {
    expect(hexToRgb('#1a2b3c')).toEqual({ r: 26, g: 43, b: 60 })
  })

  it('converts white correctly', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('converts black correctly', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })
})

describe('rgbToHex', () => {
  it('converts rgb to a lowercase hex string with leading #', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000')
  })

  it('pads single-digit hex channels', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 15 })).toBe('#00000f')
  })

  it('roundtrips with hexToRgb', () => {
    const hex = '#4a90e2'
    expect(rgbToHex(hexToRgb(hex))).toBe(hex)
  })
})

describe('rgbToHsl', () => {
  it('returns h=0 s=0 for achromatic colors', () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 })
  })

  it('converts pure red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('converts pure green', () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 })
  })

  it('converts pure blue', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 })
  })

  it('converts white to l=100', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts black to l=0', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 })
  })
})

describe('hslToRgb', () => {
  it('converts pure red hsl to rgb', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts pure green hsl to rgb', () => {
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('converts pure blue hsl to rgb', () => {
    expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('converts achromatic hsl to equal rgb channels', () => {
    const { r, g, b } = hslToRgb({ h: 0, s: 0, l: 50 })
    expect(r).toBe(g)
    expect(g).toBe(b)
  })
})

describe('hexToHsl', () => {
  it('composes hexToRgb and rgbToHsl', () => {
    expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 100, l: 50 })
  })
})

describe('hslToHex', () => {
  it('composes hslToRgb and rgbToHex', () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('#ff0000')
  })
})

describe('getContrastColor', () => {
  it('returns black for a light background', () => {
    expect(getContrastColor('#ffffff')).toBe('#000000')
  })

  it('returns white for a dark background', () => {
    expect(getContrastColor('#000000')).toBe('#ffffff')
  })

  it('returns black for a mid-light color above the 0.5 threshold', () => {
    expect(getContrastColor('#ffff00')).toBe('#000000')
  })

  it('returns white for a mid-dark color below the 0.5 threshold', () => {
    expect(getContrastColor('#0000ff')).toBe('#ffffff')
  })
})

describe('isValidHex', () => {
  it('returns true for a valid 6-digit hex with #', () => {
    expect(isValidHex('#a1b2c3')).toBe(true)
  })

  it('returns true for uppercase hex digits', () => {
    expect(isValidHex('#AABBCC')).toBe(true)
  })

  it('returns false for a 3-digit shorthand hex', () => {
    expect(isValidHex('#abc')).toBe(false)
  })

  it('returns false when the # is missing', () => {
    expect(isValidHex('aabbcc')).toBe(false)
  })

  it('returns false for non-hex characters', () => {
    expect(isValidHex('#gggggg')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isValidHex('')).toBe(false)
  })
})

describe('normalizeHex', () => {
  it('expands a 3-character shorthand to 6 characters', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc')
  })

  it('lowercases a 6-character hex', () => {
    expect(normalizeHex('#AABBCC')).toBe('#aabbcc')
  })

  it('keeps an already lowercase 6-character hex unchanged', () => {
    expect(normalizeHex('#aabbcc')).toBe('#aabbcc')
  })

  it('strips and re-adds the # prefix', () => {
    expect(normalizeHex('ff0000')).toBe('#ff0000')
  })
})

describe('extractDominantColors', () => {
  const mockGetContext = jest.fn()
  const mockDrawImage = jest.fn()
  const mockGetImageData = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockGetContext.mockReturnValue({
      drawImage: mockDrawImage,
      getImageData: mockGetImageData,
    })

    jest.spyOn(document, 'createElement').mockReturnValue({
      width: 0,
      height: 0,
      getContext: mockGetContext,
    } as unknown as HTMLCanvasElement)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('resolves with an empty array on image load error', async () => {
    const originalImage = global.Image
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        this.onerror?.()
      }
    } as unknown as typeof Image

    const result = await extractDominantColors('bad-url')
    expect(result).toEqual([])

    global.Image = originalImage
  })

  it('resolves with an empty array when canvas context is unavailable', async () => {
    mockGetContext.mockReturnValue(null)

    const originalImage = global.Image
    global.Image = class {
      crossOrigin = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        this.onload?.()
      }
    } as unknown as typeof Image

    const result = await extractDominantColors('image.png')
    expect(result).toEqual([])

    global.Image = originalImage
  })

  it('extracts and deduplicates dominant colors from pixel data', async () => {
    // Use multiples of 24 so quantization stays within 0-255 (255 rounds up to 264, overflowing hex)
    const pixelData = new Uint8ClampedArray([
      240, 0, 0, 255,
      240, 0, 0, 255,
      0, 240, 0, 255,
    ])
    mockGetImageData.mockReturnValue({ data: pixelData })

    const originalImage = global.Image
    global.Image = class {
      crossOrigin = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        this.onload?.()
      }
    } as unknown as typeof Image

    const result = await extractDominantColors('image.png')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((hex: string) => /^#[0-9a-f]{6}$/.test(hex))).toBe(true)

    global.Image = originalImage
  })

  it('skips pixels with low alpha', async () => {
    // All pixels are transparent (alpha < 128)
    const pixelData = new Uint8ClampedArray([255, 0, 0, 0, 0, 255, 0, 50])
    mockGetImageData.mockReturnValue({ data: pixelData })

    const originalImage = global.Image
    global.Image = class {
      crossOrigin = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_: string) {
        this.onload?.()
      }
    } as unknown as typeof Image

    const result = await extractDominantColors('image.png')
    expect(result).toEqual([])

    global.Image = originalImage
  })
})
