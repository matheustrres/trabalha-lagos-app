import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "WhatsApp inválido"),
  email: z
    .string()
    .min(1, "E-mail obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter ao menos 1 letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter ao menos 1 letra minúscula")
    .regex(/\d/, "A senha deve conter ao menos 1 número")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos 1 símbolo"),
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
      .string()
      .min(1, "CNPJ obrigatório")
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
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
