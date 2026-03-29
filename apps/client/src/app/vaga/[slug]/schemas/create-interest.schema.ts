import { z } from "zod";

export const createInterestSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "WhatsApp inválido").max(15, "WhatsApp inválido"),
  city: z.string().min(1, "Selecione uma cidade"),
});

export type CreateInterestData = z.infer<typeof createInterestSchema>;
