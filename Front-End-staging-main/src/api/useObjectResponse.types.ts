import { z } from "zod";

const LabelSchema = z.object({
  id: z.number(),
  label_name: z.string(),
  user_email: z.string().nullable(),
});

const DetectionSchema = z.object({
  id: z.number(),
  label: LabelSchema,
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.string(),
});

const ProcessedItemSchema = z.object({
  id: z.number(),
  media_file: z.number(),
  processed_image: z.string(),
  frame_time: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  coverage_time: z.string().nullable(),
  detections: z.array(DetectionSchema),
  created_at: z.string(),
});

export const ProcessedDataResponseSchema = z.object({
  message: z.string(),
  data: z.array(ProcessedItemSchema),
});

export type Label = z.infer<typeof LabelSchema>;
export type Detection = z.infer<typeof DetectionSchema>;
export type ProcessedItem = z.infer<typeof ProcessedItemSchema>;
export type ProcessedDataResponse = z.infer<typeof ProcessedDataResponseSchema>;
