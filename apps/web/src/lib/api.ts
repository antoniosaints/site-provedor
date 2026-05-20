const rawApiBase = import.meta.env.VITE_API_URL?.trim() ?? '';

export const API_BASE = rawApiBase.replace(/\/+$/, '');

export type ApiList<T> = {
  data: T[];
  total?: number;
  page?: number;
  take?: number;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(error.message ?? 'Erro inesperado.');
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('Resposta invalida da API. Verifique a URL configurada para o backend.');
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' })
};

export function assetUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
