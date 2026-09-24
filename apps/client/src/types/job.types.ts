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

export interface InternalJob {
  sourceType?: "INTERNAL";
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
  contactEmail?: string | null;
  contactMethod?: "WHATSAPP" | "EMAIL";
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

export interface ExternalJob {
  sourceType: "EXTERNAL";
  id: string;
  externalSource: string;
  title: string;
  description: string;
  companyName: string;
  redirectUrl: string | null;
  categoryName: string | null;
  contractType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPredicted: boolean;
  locationText: string;
  city: string;
  distanceKm: number | null;
  publishedAt: string;
  expiresAt: string | null;
}

export type Job = InternalJob;
export type SearchJob = InternalJob | ExternalJob;

export interface EmployerJob extends Omit<InternalJob, "company"> {
  companyId: string;
  viewCount?: number;
  interestCount: number;
  address?: string | null;
  salaryHidden: boolean;
  contactMethod: "WHATSAPP" | "EMAIL";
}
