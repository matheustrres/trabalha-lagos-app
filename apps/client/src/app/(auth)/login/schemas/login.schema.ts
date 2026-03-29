import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(10, "WhatsApp inválido").max(15, "WhatsApp inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
