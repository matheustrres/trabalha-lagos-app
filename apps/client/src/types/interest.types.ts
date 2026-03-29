export interface Interest {
  id: string;
  candidateName: string;
  candidatePhone: string;
  candidateCity: string;
  jobTitle: string;
  jobId: string;
  status: "SENT" | "VIEWED" | "CONTACTED" | "REJECTED";
  createdAt: string;
}
