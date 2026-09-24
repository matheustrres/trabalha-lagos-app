export type CompanyPlan = "FREE" | "PRO" | "SEASON";

export type CompanySegment =
  | "RETAIL"
  | "TOURISM"
  | "CONSTRUCTION"
  | "FOOD"
  | "HEALTH"
  | "EDUCATION"
  | "TECHNOLOGY"
  | "SERVICES"
  | "OTHER";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  whatsapp: string;
  email: string;
  city: string;
  segment: CompanySegment;
  plan: CompanyPlan;
  verified: boolean;
  activeJobsCount: number;
  createdAt: string;
}
