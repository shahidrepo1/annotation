import { z } from "zod";

export const SentimentLabelsSchema = z.object({
  labels: z.array(
    z.object({
      id: z.number(),
      label: z.string(),
    })
  ),
});

export type SentimentLabels = z.infer<typeof SentimentLabelsSchema>;
