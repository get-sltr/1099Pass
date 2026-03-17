/**
 * API client for the lender portal
 * Handles authentication, token refresh, and error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TIMEOUT_MS = 30_000;

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('lender-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${API_URL}${path}`;
  const token = getToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.error || res.statusText;
      throw new ApiError(res.status, data?.error?.code || 'ERROR', errorMsg);
    }

    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export { ApiError };
