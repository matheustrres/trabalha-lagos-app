import { z } from "zod";

export const AVAILABILITY_OPTIONS = [
  "IMMEDIATE",
  "IN_15_DAYS",
  "IN_30_DAYS",
  "NEGOTIABLE",
] as const;

export const CONTRACT_TYPE_OPTIONS = [
  "CLT",
  "PJ",
  "FREELANCER",
  "TEMPORARY",
  "INTERNSHIP",
  "OTHER",
] as const;

export const updateProfileSchema = z.object({
  interests: z.array(z.string()).max(10),
  experience: z.string().max(200),
  availability: z.enum(AVAILABILITY_OPTIONS).nullable(),
  acceptedContractTypes: z.array(z.enum(CONTRACT_TYPE_OPTIONS)).max(6),
  neighborhood: z.string().max(100),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
