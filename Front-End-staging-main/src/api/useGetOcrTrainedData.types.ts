import { z } from "zod";

const FrameSchema = z.object({
  id: z.number(),
  image_file: z.string().url(),
  label: z.string(),
  extracted_text: z.string(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.string().datetime(),
  media_file: z.number(),
});

const MediaDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_type: z.string(),
  module: z.string(),
  submodule: z.string(),
  language: z.string(),
  file: z.string().url(),
  uploaded_at: z.string().datetime(),
  frames: z.array(FrameSchema),
});

const TrainedDataItemSchema = z.object({
  date: z.string().date(),
  data: z.array(MediaDataSchema),
});

const TrainingModelSchema = z.object({
  id: z.number(),
  user_name: z.string(),
  module_name: z.string(),
  submodule_name: z.string(),
  model_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  f1_score: z.number().nullable(),
  status: z.string(),
  created_at: z.string().datetime(),
  version_name: z.string(),
  trainedData: z.array(TrainedDataItemSchema),
});

export const TrainingModelListSchema = z.array(TrainingModelSchema);

export type Frame = z.infer<typeof FrameSchema>;
export type MediaData = z.infer<typeof MediaDataSchema>;
export type TrainedDataItem = z.infer<typeof TrainedDataItemSchema>;
export type TrainingModel = z.infer<typeof TrainingModelSchema>;
