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
  verified: boolean;
  whatsapp?: string;
}

export interface JobCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  company: JobCompany;
  category: JobCategory;
  contractType: ContractType;
  salaryMin?: number;
  salaryMax?: number;
  whatsappContact?: string;
  city: string;
  distanceKm: number | null;
  featured: boolean;
  urgent: boolean;
  status: JobStatus;
  createdAt: string;
  expiresAt: string;
  viewCount?: number;
  interestCount?: number;
}

export interface EmployerJob extends Job {
  viewCount: number;
  interestCount: number;
}
