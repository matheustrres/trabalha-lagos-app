import { api } from "@/lib/api";
import type { Company } from "@/types/company.types";
import type { InterestListResponse } from "@/types/interest.types";
import type { EmployerJob, JobStatus } from "@/types/job.types";
import type { CompanyPlan } from "@/types/company.types";

export interface EmployerDashboard {
  plan: CompanyPlan;
  permissions: { totalViews: boolean; jobViews: boolean; comparison: boolean };
  metrics: {
    activeJobs: number;
    expiredJobs: number;
    interestsCount: number;
    newInterestsCount: number;
    totalViews?: number;
  };
  recentJobs: Pick<
    EmployerJob,
    | "id"
    | "title"
    | "city"
    | "status"
    | "createdAt"
    | "expiresAt"
    | "interestCount"
    | "viewCount"
  >[];
  recentInterests: {
    id: string;
    candidateName: string;
    candidateCity: string;
    jobId: string;
    jobTitle: string;
    status: string;
    createdAt: string;
  }[];
  comparison?: {
    jobId: string;
    title: string;
    viewCount: number;
    interestCount: number;
    interestViewRatio: number | null;
  }[];
}

export const employerService = {
  getMyCompany: () => api.get<Company>("/companies/me"),
  updateCompany: (id: string, data: unknown) =>
    api.patch<Company>(`/companies/${id}`, data),
  getMyJobs: () => api.get<EmployerJob[]>("/employer/jobs"),
  getMyJob: (id: string) => api.get<EmployerJob>(`/employer/jobs/${id}`),
  getDashboard: () => api.get<EmployerDashboard>("/employer/dashboard"),
  createJob: (data: unknown) => api.post("/jobs", data),
  updateJob: (id: string, data: unknown) => api.patch(`/jobs/${id}`, data),
  updateJobStatus: (id: string, status: JobStatus) =>
    api.patch(`/jobs/${id}/status`, { status }),
  getInterests: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    return api.get<InterestListResponse>(`/employer/interests${query}`);
  },
  updateInterestStatus: (id: string, status: string) =>
    api.patch(`/interests/${id}/status`, { status }),
};
