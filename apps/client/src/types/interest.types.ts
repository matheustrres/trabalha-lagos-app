export interface Interest {
  id: string;
  candidateName: string;
  candidatePhone: string | null;
  candidateCity: string;
  jobTitle: string;
  jobId: string;
  status: "SENT" | "VIEWED" | "CONTACTED" | "REJECTED";
  createdAt: string;
}

export interface InterestListResponse {
  data: Interest[];
  meta: {
    total: number;
    plan: string;
    phoneRestricted: boolean;
  };
}
