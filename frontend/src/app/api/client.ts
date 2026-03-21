export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  }
  return process.env.BACKEND_URL || 'http://localhost:4000';
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfToken(): Promise<string | null> {
  const token = getCsrfToken();
  if (token) return token;
  try {
    await fetch(`${getBackendUrl()}/api/auth/csrf-token`, {
      credentials: 'include',
    });
    return getCsrfToken();
  } catch {
    return null;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (method !== 'GET' && method !== 'HEAD') {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return fetch(`${getBackendUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}
