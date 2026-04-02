import { api } from "@/lib/api";
import type { Company } from "@/types/company.types";
import type { InterestListResponse } from "@/types/interest.types";
import type { EmployerJob, JobStatus } from "@/types/job.types";

export const employerService = {
  getMyCompany: () => api.get<Company>("/companies/me"),
  updateCompany: (id: string, data: unknown) =>
    api.patch<Company>(`/companies/${id}`, data),
  getMyJobs: () => api.get<EmployerJob[]>("/employer/jobs"),
  createJob: (data: unknown) => api.post("/jobs", data),
  updateJobStatus: (id: string, status: JobStatus) =>
    api.patch(`/jobs/${id}/status`, { status }),
  getInterests: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return api.get<InterestListResponse>(`/employer/interests${query}`);
  },
  updateInterestStatus: (id: string, status: string) =>
    api.patch(`/interests/${id}/status`, { status }),
};
