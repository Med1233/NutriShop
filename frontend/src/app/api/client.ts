export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  }
  return process.env.BACKEND_URL || 'http://localhost:4000';
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${getBackendUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
