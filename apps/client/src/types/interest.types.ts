export interface Interest {
  id: string;
  candidateName: string;
  candidatePhone: string | null;
  candidateCity: string;
  profileBadge: "COMPLETE" | "BASIC";
  candidateInterests: string[] | null;
  candidateExperience: string | null;
  candidateAvailability:
    | "IMMEDIATE"
    | "IN_15_DAYS"
    | "IN_30_DAYS"
    | "NEGOTIABLE"
    | null;
  candidateAcceptedContractTypes: string[] | null;
  candidateNeighborhood: string | null;
  jobTitle: string;
  jobSlug: string;
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
