import { z } from "zod";

const LogoLabelSchema = z.object({
  label_id: z.number(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
});

const LogoTrainedImageSchema = z.object({
  image_id: z.number(),
  image_name: z.string(),
  image_url: z.string().url(),
  is_deleted: z.boolean(),
  uploaded_at: z.string().datetime(),
  labels: z.array(LogoLabelSchema),
});

const LogoTrainedGroupSchema = z.object({
  date: z.string(),
  data: z.array(LogoTrainedImageSchema),
});

const LogoModelSchema = z.object({
  id: z.number(),
  user_name: z.string(),
  module_name: z.literal("LOGO"),
  model_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  f1_score: z.number(),
  status: z.string(),
  created_at: z.string().datetime(),
  version_name: z.string(),
  trainedData: z.array(LogoTrainedGroupSchema),
});

export const LogoModelListSchema = z.array(LogoModelSchema);

// Types
export type LogoLabel = z.infer<typeof LogoLabelSchema>;
export type LogoTrainedImage = z.infer<typeof LogoTrainedImageSchema>;
export type LogoTrainedGroup = z.infer<typeof LogoTrainedGroupSchema>;
export type LogoModel = z.infer<typeof LogoModelSchema>;
export type LogoModelList = z.infer<typeof LogoModelListSchema>;
