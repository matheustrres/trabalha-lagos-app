import { api } from "@/lib/api";
import type {
  EmployerJob,
  InternalJob,
  SearchJob,
} from "@/types/job.types";

interface JobsResponse {
  data: SearchJob[];
  meta: { total: number; page: number; limit: number };
}

const normalizeJobsResponse = (
  payload: JobsResponse | SearchJob[],
  page: number,
  limit: number,
): JobsResponse => {
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

export const jobsService = {
  search: async (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const payload = await api.get<JobsResponse | SearchJob[]>(`/jobs?${query}`);
    const page = Number(params.page ?? "1");
    const limit = Number(params.limit ?? "20");

    return normalizeJobsResponse(payload, page, limit);
  },

  findBySlug: (slug: string) => api.get<InternalJob>(`/jobs/${slug}`),

  findByCompany: () => api.get<EmployerJob[]>("/employer/jobs"),
};

export type { JobsResponse };
