import { clearSession, getSession, setSession } from "@/lib/auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const inflightRequests = new Map<string, Promise<unknown>>();

const getAuthHeaders = (): HeadersInit => {
  const session = getSession();
  return session ? { Authorization: `Bearer ${session.accessToken}` } : {};
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const session = getSession();
  if (!session?.refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setSession(data);
    return data.accessToken as string;
  } catch {
    return null;
  }
};

interface ApiError extends Error {
  status: number;
  detail?: string[];
  error?: string;
}

const request = async <T>(
  path: string,
  options?: RequestInit,
  retry = true,
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (res.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) {
      return request<T>(path, options, false);
    }
    clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
    const err = new Error("Sessão expirada") as ApiError;
    err.status = 401;
    throw err;
  }

  if (res.status === 429) {
    const err = new Error(
      "Muitas requisições. Aguarde alguns segundos e tente novamente.",
    ) as ApiError;
    err.status = 429;
    throw err;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as {
      message?: string | string[];
      detail?: string[];
      error?: string;
    };

    const detail = Array.isArray(body.detail)
      ? body.detail.filter((item) => typeof item === "string")
      : [];

    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message) && body.message.length > 0
          ? body.message[0]
          : detail[0] || `API Error: ${res.status}`;

    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.detail = detail.length > 0 ? detail : undefined;
    err.error = body.error;

    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
};

const deduplicatedGet = async <T>(path: string): Promise<T> => {
  const inflightRequest = inflightRequests.get(path);

  if (inflightRequest) {
    return inflightRequest as Promise<T>;
  }

  const promise = request<T>(path).finally(() => {
    inflightRequests.delete(path);
  });

  inflightRequests.set(path, promise);

  return promise;
};

export const api = {
  get: <T>(path: string) => deduplicatedGet<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
};
