import { z } from "zod";

const TrainedImageSchema = z.object({
  id: z.number(),
  processedImage: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  created_at: z.string().datetime(),
});

const TrainedLabelGroupSchema = z.object({
  label: z.string(),
  images: z.array(TrainedImageSchema),
});

export const ModelInfoSchema = z.object({
  id: z.number(),
  user: z.number(),
  version: z.string(),
  created_at: z.string().datetime(),
  model_name: z.string(),
  module_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  status: z.string(),
  trainedData: z.array(TrainedLabelGroupSchema),
});

export const ModelListSchema = z.array(ModelInfoSchema);

export type ModelInfoType = z.infer<typeof ModelInfoSchema>;
export type ModelListType = z.infer<typeof ModelListSchema>;
