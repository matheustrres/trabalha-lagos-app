export const SERVER_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api/v1";

export const fetchServerJson = async <T>(
  url: string,
  fallback: T,
  init?: RequestInit,
): Promise<T> => {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
};

interface PaginatedResponse<T> {
  data?: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export const normalizePaginatedResponse = <T>(
  payload: PaginatedResponse<T> | T[],
  page: number,
  limit: number,
) => {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: {
        total: payload.length,
        page,
        limit,
      },
    };
  }

  return {
    data: payload.data ?? [],
    meta: {
      total: payload.meta?.total ?? payload.data?.length ?? 0,
      page: payload.meta?.page ?? page,
      limit: payload.meta?.limit ?? limit,
    },
  };
};
