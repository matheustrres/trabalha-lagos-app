import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "WhatsApp inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme a senha"),
  city: z.string().min(1, "Selecione uma cidade"),
});

export const candidateSchema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: "Senhas não coincidem", path: ["confirmPassword"] },
);

export const employerSchema = baseSchema
  .extend({
    companyName: z.string().min(2, "Nome da empresa obrigatório"),
    document: z
      .union([
        z.literal(""),
        z
          .string()
          .regex(
            /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/,
            "CPF ou CNPJ inválido",
          ),
      ])
      .optional(),
    segment: z.string().optional().or(z.literal("")),
    whatsappBusiness: z
      .string()
      .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "WhatsApp da empresa obrigatório"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CandidateFormData = z.infer<typeof candidateSchema>;
export type EmployerFormData = z.infer<typeof employerSchema>;
