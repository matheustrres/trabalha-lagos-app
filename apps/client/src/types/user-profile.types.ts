export type CandidateAvailability =
  | "IMMEDIATE"
  | "IN_15_DAYS"
  | "IN_30_DAYS"
  | "NEGOTIABLE";

export interface UserProfile {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  interests: string[] | null;
  experience: string | null;
  availability: CandidateAvailability | null;
  acceptedContractTypes: string[] | null;
  neighborhood: string | null;
}

export interface UpdateUserProfilePayload {
  phone?: string | null;
  interests?: string[];
  experience?: string;
  availability?: CandidateAvailability;
  acceptedContractTypes?: string[];
  neighborhood?: string;
}
