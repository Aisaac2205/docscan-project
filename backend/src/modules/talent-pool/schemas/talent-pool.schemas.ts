import { z } from 'zod';

export const TalentPoolRankResponseSchema = z.object({
  candidatos: z.array(
    z.object({
      nombre: z.string(),
      score: z.number().min(0).max(100),
      explicacion: z.string(),
      alertas: z.array(z.string()).optional(),
    }),
  ),
  resumen_general: z.string().optional(),
});

export type TalentPoolRankResponse = z.infer<typeof TalentPoolRankResponseSchema>;
