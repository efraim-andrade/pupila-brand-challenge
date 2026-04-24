import type { NextRequest } from 'next/server';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

jest.mock('next/server', () => {
  return {
    NextResponse: class {
      status: number;
      body: unknown;
      headers: Headers;
      private _bodyText?: string;

      constructor(
        body?: unknown,
        init?: { status?: number; headers?: Record<string, string> }
      ) {
        this.status = init?.status || 200;
        this.headers = new Headers(init?.headers || {});

        if (typeof body === 'string') {
          this._bodyText = body;
          this.body = body;
        } else if (body instanceof ArrayBuffer) {
          this.body = body;
        } else {
          this.body = body;
        }
      }

      async text() {
        return this._bodyText ?? '';
      }

      async arrayBuffer() {
        if (this.body instanceof ArrayBuffer) return this.body;
        return new ArrayBuffer(0);
      }
    },
  };
});

describe('GET /api/image-proxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  function createMockRequest(
    searchParams: Record<string, string>
  ): NextRequest {
    const params = new URLSearchParams(searchParams);
    return {
      nextUrl: {
        searchParams: params,
      },
    } as unknown as NextRequest;
  }

  describe('validation errors', () => {
    it('returns 400 when url parameter is missing', async () => {
      const { GET } = await import('../route');

      const request = createMockRequest({});
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toBe('Missing url parameter');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns 400 when url parameter is empty string', async () => {
      const { GET } = await import('../route');

      const request = createMockRequest({ url: '' });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toBe('Missing url parameter');
    });

    it('returns 400 when url is not a valid URL', async () => {
      const { GET } = await import('../route');

      const request = createMockRequest({ url: 'not-a-valid-url' });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toBe('Invalid url parameter');
    });

    it('returns 400 when url uses ftp protocol', async () => {
      const { GET } = await import('../route');

      const request = createMockRequest({ url: 'ftp://example.com/image.jpg' });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toBe('Only http/https URLs are allowed');
    });

    it('returns 400 when url uses javascript protocol', async () => {
      const { GET } = await import('../route');

      const request = createMockRequest({ url: 'javascript:alert(1)' });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(400);
      expect(text).toBe('Only http/https URLs are allowed');
    });
  });

  describe('fetch errors', () => {
    it('returns remote status when fetch fails', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers(),
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/not-found.jpg',
      });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(404);
      expect(text).toBe('Failed to fetch image');
    });

    it('returns 500 when remote server returns 500', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers(),
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/image.jpg',
      });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(500);
      expect(text).toBe('Failed to fetch image');
    });

    it('returns 502 when fetch throws a network error', async () => {
      const { GET } = await import('../route');

      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const request = createMockRequest({
        url: 'https://example.com/image.jpg',
      });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(502);
      expect(text).toBe('Failed to fetch image');
    });
  });

  describe('content type validation', () => {
    it('returns 422 when content type is not an image', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/html' }),
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/page.html',
      });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(422);
      expect(text).toBe('URL does not point to an image');
    });

    it('returns 422 when content type is application/json', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/data.json',
      });
      const response = await GET(request);
      const text = await response.text();

      expect(response.status).toBe(422);
      expect(text).toBe('URL does not point to an image');
    });
  });

  describe('successful responses', () => {
    it('returns image with correct content type and cache headers', async () => {
      const { GET } = await import('../route');

      const imageBuffer = new Uint8Array([137, 80, 78, 71]).buffer;

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/png' }),
        arrayBuffer: async () => imageBuffer,
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/image.png',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');
      expect(response.headers.get('Cache-Control')).toBe(
        'public, max-age=3600'
      );
    });

    it('defaults content type to image/jpeg when not provided', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response);

      const request = createMockRequest({ url: 'https://example.com/image' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    });

    it('returns image body as array buffer', async () => {
      const { GET } = await import('../route');

      const imageBuffer = new Uint8Array([255, 216, 255, 224]).buffer;

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/jpeg' }),
        arrayBuffer: async () => imageBuffer,
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/photo.jpg',
      });
      const response = await GET(request);
      const body = await response.arrayBuffer();

      expect(body).toBe(imageBuffer);
    });

    it('accepts http URLs', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/jpeg' }),
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response);

      const request = createMockRequest({
        url: 'http://example.com/photo.jpg',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('accepts various image content types', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/webp' }),
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/photo.webp',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/webp');
    });
  });

  describe('fetch is called with correct parameters', () => {
    it('calls fetch with the URL and custom User-Agent header', async () => {
      const { GET } = await import('../route');

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'image/jpeg' }),
        arrayBuffer: async () => new ArrayBuffer(0),
      } as Response);

      const request = createMockRequest({
        url: 'https://example.com/photo.jpg',
      });
      await GET(request);

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/photo.jpg', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; image-proxy/1.0)' },
      });
    });
  });
});
