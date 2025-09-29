import { z } from "zod";

const trainedDataItemSchema = z.object({
  audio: z.string(),
  transcription: z.string(),
});

export type TrainedDataItemType = z.infer<typeof trainedDataItemSchema>;

const progressSchema = z.object({
  id: z.number(),
  user: z.number(),
  module_name: z.string(),
  model_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  f1_score: z.number(),
  is_completed: z.boolean(),
  created_at: z.string().datetime(),
  trainedData: z.array(trainedDataItemSchema),
});
export type trainedDataType = z.infer<typeof trainedDataItemSchema>;
export type ProgressType = z.infer<typeof progressSchema>;

const versionSchema = z.object({
  version_name: z.string(),
  version_module: z.string(),
  version_created_at: z.string().datetime(),
  progress: z.array(progressSchema),
});

export type VersionType = z.infer<typeof versionSchema>;

const dailyVersionSchema = z.object({
  date: z.string(),
  versions: z.array(versionSchema),
});

export type DailyVersionType = z.infer<typeof dailyVersionSchema>;

export const sttTrainedDataSchema = z.array(dailyVersionSchema);

export type SttTrainedDataType = z.infer<typeof sttTrainedDataSchema>;
