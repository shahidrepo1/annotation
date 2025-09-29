import { z } from "zod";

export const SentimentDataSchema = z.object({
  message: z.string(),
  data: z.object({
    analysis_id: z.number(),
    media_file_id: z.number(),
    sentiment: z.enum(["positive", "neutral", "negative"]),
    media_file: z.string(),
  }),
});

export type SentimentData = z.infer<typeof SentimentDataSchema>;
