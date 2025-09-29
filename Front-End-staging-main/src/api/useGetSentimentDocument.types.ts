import { z } from "zod";

const SentimentLabelEnum = z.enum(["positive", "negative", "neutral"]);

const SentimentSchema = z.object({
  id: z.number(),
  label: SentimentLabelEnum,
});

const MediaFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  media_type: z.string(),
  media_file: z.string(),
  module_name: z.string(),
  uploaded_at: z.string(),
  is_annotated: z.boolean(),
});

const AnnotatedItemSchema = z.object({
  id: z.number(),
  media_file: MediaFileSchema,
  sentiment: SentimentSchema,
  unique_id: z.string(),
  created_at: z.string(),
  is_edited: z.boolean(),
  is_untrained: z.boolean(),
  is_deleted: z.boolean(),
  user: z.number(),
});

const SentimentMapSchema = z.record(
  SentimentLabelEnum,
  z.array(AnnotatedItemSchema)
);

export const SentimentTrainingDataSchema = z.object({
  trainedData: SentimentMapSchema,
  untrainedData: SentimentMapSchema,
});

export type SentimentDocument = z.infer<typeof SentimentTrainingDataSchema>;
export type DocumentAnnotatedItem = z.infer<typeof AnnotatedItemSchema>;
export type SentimentDocumentLabel = z.infer<typeof SentimentLabelEnum>;
