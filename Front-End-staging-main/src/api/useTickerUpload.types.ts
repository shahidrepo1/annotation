import { z } from "zod";

export const labelSchema = z.object({
  id: z.number(),
  label_name: z.string(),
  user_email: z.string().email().nullable(),
});

export const detectionSchema = z.object({
  id: z.number(),
  processed_image: z.number(),
  label: labelSchema,
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number().nullable(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.string(),
});

export const tickerItemSchema = z.object({
  id: z.number(),
  media_file: z.number(),
  processed_image: z.string(),
  frame_time: z.string().nullable(),
  detections: z.array(detectionSchema),
  created_at: z.string(),
});

export const tickerResponseSchema = z.object({
  message: z.string(),
  data: z.array(z.array(tickerItemSchema)),
});

// Types
export type Label = z.infer<typeof labelSchema>;
export type Detection = z.infer<typeof detectionSchema>;
export type TickerItem = z.infer<typeof tickerItemSchema>;
export type TickerResponse = z.infer<typeof tickerResponseSchema>;
