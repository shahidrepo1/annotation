import { z } from "zod";

const ODDectedBoxSchema = z.object({
  label: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number().nullable(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.string().datetime(),
});

const ODTrainedImageSchema = z.object({
  image_id: z.number(),
  processedImage: z.string(),
  frame_time: z.string().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  coverage_time: z.string().nullable(),
  detections: z.array(ODDectedBoxSchema),
  created_at: z.string().datetime(),
});

const ODModelSchema = z.object({
  id: z.number(),
  user: z.number(),
  version: z.string(),
  created_at: z.string().datetime(),
  model_name: z.string(),
  module_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  status: z.string(),
  trainedData: z.array(ODTrainedImageSchema),
});

export const ODModelListSchema = z.array(ODModelSchema);

export type ODDetectionBox = z.infer<typeof ODDectedBoxSchema>;
export type ODTrainedImage = z.infer<typeof ODTrainedImageSchema>;
export type ODModel = z.infer<typeof ODModelSchema>;
export type ODModelList = z.infer<typeof ODModelListSchema>;
