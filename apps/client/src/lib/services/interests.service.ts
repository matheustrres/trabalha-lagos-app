import { api } from "@/lib/api";

interface CreateInterestPayload {
  name: string;
  phone: string;
  city: string;
}

export const interestsService = {
  create: (jobId: string, data: CreateInterestPayload) =>
    api.post(`/jobs/${jobId}/interest`, data),
};
