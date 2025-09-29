import { z } from "zod";

export const trainedItemSchema = z.object({
  analysis_id: z.number(),
  media_id: z.number(),
  media_name: z.string(),
  media_type: z.string(),
  media_file: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  is_edited: z.boolean(),
  is_untrained: z.boolean(),
  created_at: z.string().datetime(),
});

export const trainedDataSchema = z.object({
  positive: z.array(trainedItemSchema).optional(),
  neutral: z.array(trainedItemSchema).optional(),
  negative: z.array(trainedItemSchema).optional(),
});

export const modelSchema = z.object({
  id: z.number(),
  user: z.number(),
  version: z.string(),
  created_at: z.string().datetime(),
  model_name: z.string(),
  module_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  status: z.string(),
  trainedData: trainedDataSchema,
});

export const sentimentSchema = z.object({
  results: z.array(modelSchema),
});

export type TrainedItem = z.infer<typeof trainedItemSchema>;
export type TrainedData = z.infer<typeof trainedDataSchema>;
export type Model = z.infer<typeof modelSchema>;
export type SentimentTrainedResponse = z.infer<typeof sentimentSchema>;
