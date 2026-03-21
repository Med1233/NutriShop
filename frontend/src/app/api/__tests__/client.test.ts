import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBackendUrl, apiFetch } from '../client';

describe('getBackendUrl', () => {
  it('returns NEXT_PUBLIC_BACKEND_URL in browser context', () => {
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', 'http://custom:5000');
    expect(getBackendUrl()).toBe('http://custom:5000');
    vi.unstubAllEnvs();
  });

  it('falls back to localhost:4000', () => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    delete process.env.BACKEND_URL;
    expect(getBackendUrl()).toBe('http://localhost:4000');
  });
});

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls fetch with credentials and content-type', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/api/test', { method: 'POST', body: '{}' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/test');
    expect(opts.credentials).toBe('include');
    expect(opts.headers['Content-Type']).toBe('application/json');
    expect(opts.method).toBe('POST');
  });

  it('merges custom headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/api/x', { headers: { 'X-Custom': 'val' } });

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers['X-Custom']).toBe('val');
    expect(opts.headers['Content-Type']).toBe('application/json');
  });
});
