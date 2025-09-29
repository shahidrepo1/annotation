import { z } from "zod";

export const SentimentLabelSchema = z.object({
  id: z.number(),
  label: z.enum(["positive", "negative", "neutral"]),
});

export const MediaFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  media_type: z.enum(["audio", "video", "text"]),
  media_file: z.string(),
  module_name: z.string(),
  uploaded_at: z.string(),
  is_annotated: z.boolean(),
});

export const SentimentEntrySchema = z.object({
  id: z.number(),
  media_file: MediaFileSchema,
  sentiment: SentimentLabelSchema,
  unique_id: z.string(),
  created_at: z.string(),
  is_edited: z.boolean(),
  is_untrained: z.boolean(),
  is_deleted: z.boolean(),
  user: z.number(),
});

export const SentimentGroupSchema = z.object({
  positive: z.array(SentimentEntrySchema).optional(),
  negative: z.array(SentimentEntrySchema).optional(),
  neutral: z.array(SentimentEntrySchema).optional(),
});

export const SentimentDataSchema = z.object({
  trainedData: SentimentGroupSchema,
  untrainedData: SentimentGroupSchema,
});

export type SentimentLabel = z.infer<typeof SentimentLabelSchema>;
export type MediaFile = z.infer<typeof MediaFileSchema>;
export type SentimentVideoEntry = z.infer<typeof SentimentEntrySchema>;
// export type SentimentGroup = z.infer<typeof SentimentGroupSchema>;
export type SentimentVideo = z.infer<typeof SentimentDataSchema>;
