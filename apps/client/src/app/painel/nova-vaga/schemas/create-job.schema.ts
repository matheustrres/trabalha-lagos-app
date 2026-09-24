import { z } from "zod";

export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(120, "Máximo 120 caracteres"),
    description: z
      .string()
      .min(20, "Descreva a vaga com pelo menos 20 caracteres")
      .max(5000),
    categoryId: z.string().min(1, "Selecione uma categoria"),
    contractType: z.enum(
      ["CLT", "PJ", "FREELANCER", "TEMPORARY", "INTERNSHIP", "OTHER"] as const,
      {
        error: () => ({ message: "Selecione o tipo de contrato" }),
      },
    ),
    city: z.string().min(1, "Selecione uma cidade"),
    address: z.string().optional().or(z.literal("")),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    salaryHidden: z.boolean(),
    whatsappContact: z.string().optional(),
    contactEmail: z.string().optional(),
    contactMethod: z.enum(["WHATSAPP", "EMAIL"]),
    requirements: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, context) => {
    if (data.contactMethod === "WHATSAPP") {
      const digits = data.whatsappContact?.replace(/\D/g, "") ?? "";
      if (digits.length < 10 || digits.length > 11) {
        context.addIssue({
          code: "custom",
          path: ["whatsappContact"],
          message: "Informe um WhatsApp válido",
        });
      }
    } else if (!z.email().safeParse(data.contactEmail).success) {
      context.addIssue({
        code: "custom",
        path: ["contactEmail"],
        message: "Informe um email válido",
      });
    }
  });

export type CreateJobData = z.infer<typeof createJobSchema>;
