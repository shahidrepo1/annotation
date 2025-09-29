import { z } from "zod";

const labelSchema = z.object({
  id: z.number(),
  label_name: z.string(),
  user_email: z.string().email(),
});

export type OdLabel = z.infer<typeof labelSchema>;

export const labelsSchema = z.array(labelSchema);

export type OdLabels = z.infer<typeof labelsSchema>;
