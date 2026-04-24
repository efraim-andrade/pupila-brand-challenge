import { renderHook, waitFor } from '@testing-library/react'
import { useTagSuggestions } from '../useTagSuggestions'
import { act } from 'react'

global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('useTagSuggestions', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('with invalid inputs', () => {
    it('returns no loading state when imageUrl is empty', async () => {
      const { result } = renderHook(() => useTagSuggestions(''))

      expect(result.current.isLoading).toBe(false)
      expect(result.current.suggestions).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('returns no loading state when imageUrl is invalid URL', async () => {
      const { result } = renderHook(() => useTagSuggestions('not-a-url'))

      expect(result.current.isLoading).toBe(false)
      expect(result.current.suggestions).toBeNull()
    })
  })

  describe('with valid URL', () => {
    it('returns suggestions on successful fetch', async () => {
      const mockSuggestions = {
        group: 'Nature',
        tags: ['ocean', 'sunset', 'landscape'],
      }
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSuggestions,
      } as Response)

      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(1300)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.suggestions).toEqual(mockSuggestions)
      expect(result.current.error).toBeNull()
    })

    it('returns error on failed fetch', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as Response)

      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(1300)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Server error')
      expect(result.current.suggestions).toBeNull()
    })

    it('handles non-ok responses with error message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      } as Response)

      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(1300)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Bad request')
    })

    it('returns null suggestions when service unavailable (503)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({}),
      } as Response)

      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(1300)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.suggestions).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(1300)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.suggestions).toBeNull()
    })
  })

  describe('dismiss', () => {
    it('clears suggestions when dismiss is called', async () => {
      const mockSuggestions = {
        group: 'Nature',
        tags: ['ocean'],
      }
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockSuggestions,
      } as Response)

      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(1300)
      })

      await waitFor(() => {
        expect(result.current.suggestions).toEqual(mockSuggestions)
      })

      await act(async () => {
        result.current.dismiss()
      })

      expect(result.current.suggestions).toBeNull()
    })
  })

  describe('debounce', () => {
    it('does not call fetch before debounce delay', async () => {
      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(500)
      })

      expect(mockFetch).not.toHaveBeenCalled()
      expect(result.current.isLoading).toBe(true)
    })

    it('calls fetch after debounce delay', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ group: 'Test', tags: ['tag'] }),
      } as Response)

      const { result } = renderHook(() => useTagSuggestions('https://example.com/image.jpg'))

      await act(async () => {
        jest.advanceTimersByTime(1300)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})