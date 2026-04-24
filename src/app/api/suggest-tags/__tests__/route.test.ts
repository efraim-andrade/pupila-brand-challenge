import type { NextRequest } from 'next/server';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) => {
        return {
          status: init?.status || 200,
          ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
          headers: new Headers({ 'content-type': 'application/json' }),
          async json() {
            return body;
          },
        } as Response;
      },
    },
  };
});

describe('POST /api/suggest-tags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  function createMockRequest(body: unknown): NextRequest {
    return {
      json: async () => body,
    } as NextRequest;
  }

  describe('configuration errors', () => {
    it('returns 503 when GROQ_API_KEY is not set', async () => {
      delete process.env.GROQ_API_KEY;

      // Dynamic import to pick up the env var change
      const { POST } = await import('../route');

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toEqual({ error: 'AI suggestions not configured' });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('returns 400 when imageUrl is missing', async () => {
      process.env.GROQ_API_KEY = 'test-key';
      const { POST } = await import('../route');

      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'imageUrl is required' });
    });

    it('returns 400 when imageUrl is not a string', async () => {
      process.env.GROQ_API_KEY = 'test-key';
      const { POST } = await import('../route');

      const request = createMockRequest({ imageUrl: 123 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'imageUrl is required' });
    });

    it('returns 400 when imageUrl is empty string', async () => {
      process.env.GROQ_API_KEY = 'test-key';
      const { POST } = await import('../route');

      const request = createMockRequest({ imageUrl: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'imageUrl is required' });
    });
  });

  describe('successful responses', () => {
    beforeEach(() => {
      process.env.GROQ_API_KEY = 'test-key';
    });

    it('returns suggestions on successful API call', async () => {
      const { POST } = await import('../route');

      const mockGroqResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  '{"group": "nature", "tags": ["landscape", "mountains", "scenic"]}',
              },
            },
          ],
        }),
      };
      mockFetch.mockResolvedValue(mockGroqResponse as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        group: 'Nature',
        tags: ['landscape', 'mountains', 'scenic'],
      });
    });

    it('capitalizes the group name', async () => {
      const { POST } = await import('../route');

      const mockGroqResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: '{"group": "technology", "tags": ["ai", "code"]}',
              },
            },
          ],
        }),
      };
      mockFetch.mockResolvedValue(mockGroqResponse as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.group).toBe('Technology');
    });

    it('lowercases all tags', async () => {
      const { POST } = await import('../route');

      const mockGroqResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  '{"group": "fashion", "tags": ["Summer", "CASUAL", "Street-Wear"]}',
              },
            },
          ],
        }),
      };
      mockFetch.mockResolvedValue(mockGroqResponse as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.tags).toEqual(['summer', 'casual', 'street-wear']);
    });

    it('handles markdown-fenced JSON responses', async () => {
      const { POST } = await import('../route');

      const mockGroqResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  '```json\n{"group": "food", "tags": ["pizza", "italian"]}\n```',
              },
            },
          ],
        }),
      };
      mockFetch.mockResolvedValue(mockGroqResponse as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({
        group: 'Food',
        tags: ['pizza', 'italian'],
      });
    });

    it('handles responses with null group', async () => {
      const { POST } = await import('../route');

      const mockGroqResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: '{"group": null, "tags": ["test"]}',
              },
            },
          ],
        }),
      };
      mockFetch.mockResolvedValue(mockGroqResponse as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.group).toBeNull();
    });

    it('handles responses with missing tags', async () => {
      const { POST } = await import('../route');

      const mockGroqResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: '{"group": "travel"}',
              },
            },
          ],
        }),
      };
      mockFetch.mockResolvedValue(mockGroqResponse as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.tags).toEqual([]);
    });
  });

  describe('API errors', () => {
    beforeEach(() => {
      process.env.GROQ_API_KEY = 'test-key';
    });

    it('returns 502 when Groq API returns error', async () => {
      const { POST } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data).toEqual({ error: 'AI service error: 500' });
    });

    it('returns 502 when Groq API returns 401', async () => {
      const { POST } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data).toEqual({ error: 'AI service error: 401' });
    });
  });

  describe('parsing errors', () => {
    beforeEach(() => {
      process.env.GROQ_API_KEY = 'test-key';
    });

    it('returns 502 when Groq response is not valid JSON', async () => {
      const { POST } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'not valid json',
              },
            },
          ],
        }),
      } as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data).toEqual({ error: 'Failed to parse AI response' });
    });

    it('returns 502 when Groq response is empty', async () => {
      const { POST } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: '',
              },
            },
          ],
        }),
      } as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data).toEqual({ error: 'Failed to parse AI response' });
    });
  });

  describe('fetch is called with correct parameters', () => {
    beforeEach(() => {
      process.env.GROQ_API_KEY = 'test-key';
    });

    it('calls Groq API with correct URL and headers', async () => {
      const { POST } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: '{"group": "test", "tags": ["test"]}',
              },
            },
          ],
        }),
      } as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key',
          },
        })
      );
    });

    it('sends correct body with image URL and prompt', async () => {
      const { POST } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: '{"group": "test", "tags": ["test"]}',
              },
            },
          ],
        }),
      } as Response);

      const request = createMockRequest({
        imageUrl: 'https://example.com/image.jpg',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);

      expect(body.model).toBe('meta-llama/llama-4-scout-17b-16e-instruct');
      expect(body.messages[0].role).toBe('user');
      expect(body.messages[0].content[0].type).toBe('image_url');
      expect(body.messages[0].content[0].image_url.url).toBe(
        'https://example.com/image.jpg'
      );
      expect(body.messages[0].content[1].type).toBe('text');
      expect(body.temperature).toBe(0.1);
      expect(body.max_tokens).toBe(256);
    });
  });
});
