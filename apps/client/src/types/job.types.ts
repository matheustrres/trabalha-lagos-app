export type ContractType =
  | "CLT"
  | "PJ"
  | "FREELANCER"
  | "TEMPORARY"
  | "INTERNSHIP"
  | "OTHER";

export type JobStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "EXPIRED";

export interface JobCompany {
  id: string;
  name: string;
  city: string;
  logoUrl?: string;
  verified: boolean;
  whatsapp: string;
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  company: JobCompany;
  category: JobCategory;
  contractType: ContractType;
  salaryMin?: number;
  salaryMax?: number;
  city: string;
  distanceKm?: number;
  featured: boolean;
  urgent: boolean;
  status: JobStatus;
  createdAt: string;
  expiresAt: string;
}
