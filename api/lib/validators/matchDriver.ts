import { z } from "zod";

export const matchDriverSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type MatchDriverInput = z.infer<typeof matchDriverSchema>;
