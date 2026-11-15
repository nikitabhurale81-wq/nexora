/**
 * NEXORA API Client
 *
 * Centralized, typed fetch wrapper for talking to the NEXORA backend
 * (separate FastAPI service). While the backend is not connected yet,
 * `USE_MOCK` keeps the frontend fully functional with mock data.
 *
 * When the backend is ready, set NEXT_PUBLIC_USE_MOCK="false" and
 * NEXT_PUBLIC_API_BASE_URL to the FastAPI server URL.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? "true").toLowerCase() !== "false";

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip JSON serialization (e.g. for FormData uploads) */
  raw?: boolean;
}

/**
 * Low-level request helper. All service modules go through this so that
 * auth headers, error shaping, and base URL handling live in one place.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, raw, headers, ...rest } = options;

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const finalHeaders: Record<string, string> = {
    ...(raw ? {} : { "Content-Type": "application/json" }),
    ...(headers as Record<string, string>),
  };

  // Auth token will be wired up once the auth backend exists.
  const token = getAuthToken();
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: raw ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let details: unknown = null;
    try {
      details = await response.json();
    } catch {
      /* ignore non-JSON error bodies */
    }
    const error: ApiError = {
      status: response.status,
      message: `Request failed with status ${response.status}`,
      details,
    };
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Retrieve auth token — Supabase session first, then nexora_token fallback. */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Try nexora_token (guest / manually set)
  const nexoraToken = window.localStorage.getItem("nexora_token");
  if (nexoraToken) return nexoraToken;

  // 2. Try Supabase session token (key pattern: sb-<ref>-auth-token)
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && (key.startsWith("sb-") && key.endsWith("-auth-token"))) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const token =
            parsed?.access_token ??
            parsed?.currentSession?.access_token ??
            null;
          if (token) return token;
        }
      } catch {
        // ignore parse errors
      }
    }
  }

  return null;
}

/** Simulates network latency for mock responses. */
export function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
