import { config } from '../config';

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw { status: 0, message: 'Unable to reach the server. Please check your connection and try again.' } as ApiError;
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response (e.g. proxy error page).
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: (body && body.detail) || 'Something went wrong. Please try again.',
      fieldErrors: body?.field_errors,
    } as ApiError;
  }
  return body as T;
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: 'GET', headers }),
  post: <T>(path: string, data: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data), headers }),
  patch: <T>(path: string, data: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data), headers }),
};
