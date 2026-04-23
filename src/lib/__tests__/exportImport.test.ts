import { exportToJSON, importFromJSON } from '../exportImport'
import type { ExportData } from '@/types'

const readBlobAsText = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsText(blob)
  })

const makeExportData = (overrides: Partial<ExportData> = {}): ExportData => ({
  version: 1,
  exportedAt: '2024-01-01T00:00:00.000Z',
  images: [],
  palettes: [],
  groups: [],
  tags: [],
  ...overrides,
})

describe('exportToJSON', () => {
  let clickSpy: jest.Mock
  let capturedBlob: Blob | undefined
  let capturedAnchor: { href: string; download: string; click: jest.Mock }
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  beforeEach(() => {
    capturedBlob = undefined
    clickSpy = jest.fn()
    capturedAnchor = { href: '', download: '', click: clickSpy }

    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = jest.fn().mockImplementation((blob: Blob) => {
      capturedBlob = blob
      return 'blob:mock-url'
    })
    URL.revokeObjectURL = jest.fn()

    jest.spyOn(document, 'createElement').mockReturnValue(capturedAnchor as unknown as HTMLAnchorElement)
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    jest.restoreAllMocks()
  })

  it('creates a JSON blob and triggers a download click', () => {
    exportToJSON({ images: [], palettes: [], groups: [], tags: [] })

    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('revokes the object URL after clicking', () => {
    exportToJSON({ images: [], palettes: [], groups: [], tags: [] })

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('sets version to 1 and includes an exportedAt timestamp', async () => {
    exportToJSON({ images: [], palettes: [], groups: [], tags: [] })

    const text = await readBlobAsText(capturedBlob!)
    const parsed = JSON.parse(text)
    expect(parsed.version).toBe(1)
    expect(typeof parsed.exportedAt).toBe('string')
  })

  it('sets the download attribute to a filename matching pupila-export-<timestamp>.json', () => {
    exportToJSON({ images: [], palettes: [], groups: [], tags: [] })

    expect(capturedAnchor.download).toMatch(/^pupila-export-\d+\.json$/)
  })

  it('merges provided content into the export payload', async () => {
    const group = { id: 'g1', name: 'Brand', type: 'shared' as const }
    exportToJSON({ images: [], palettes: [], groups: [group], tags: [] })

    const text = await readBlobAsText(capturedBlob!)
    const parsed = JSON.parse(text)
    expect(parsed.groups).toEqual([group])
  })
})

describe('importFromJSON', () => {
  const createMockFile = (content: string, name = 'export.json'): File =>
    new File([content], name, { type: 'application/json' })

  it('resolves with the parsed export data for a valid file', async () => {
    const data = makeExportData()
    const file = createMockFile(JSON.stringify(data))

    await expect(importFromJSON(file)).resolves.toMatchObject({
      version: 1,
      images: [],
      palettes: [],
      groups: [],
      tags: [],
    })
  })

  it('rejects with "Unsupported export version" when version is not 1', async () => {
    const data = { ...makeExportData(), version: 2 }
    const file = createMockFile(JSON.stringify(data))

    await expect(importFromJSON(file)).rejects.toThrow('Unsupported export version')
  })

  it('rejects with "Invalid export file" when required fields are missing', async () => {
    const incomplete = { version: 1, exportedAt: '2024-01-01T00:00:00.000Z' }
    const file = createMockFile(JSON.stringify(incomplete))

    await expect(importFromJSON(file)).rejects.toThrow('Invalid export file: missing required fields')
  })

  it('rejects with "Invalid JSON file" when the content is not valid JSON', async () => {
    const file = createMockFile('not json at all')

    await expect(importFromJSON(file)).rejects.toThrow('Invalid JSON file')
  })

  it('rejects with "Failed to read file" on FileReader error', async () => {
    const OriginalFileReader = global.FileReader
    global.FileReader = class {
      onerror: (() => void) | null = null
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null
      readAsText() {
        this.onerror?.()
      }
    } as unknown as typeof FileReader

    const file = createMockFile('{}')
    await expect(importFromJSON(file)).rejects.toThrow('Failed to read file')

    global.FileReader = OriginalFileReader
  })
})
