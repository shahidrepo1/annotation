import { z } from "zod";

const DetectionSchema = z.object({
  detection_id: z.number(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number().nullable(),
  is_edited: z.boolean(),
});

const ImageDataSchema = z.object({
  image_id: z.number(),
  processedImage: z.string(),
  detections: z.array(DetectionSchema),
});

const DataGroupSchema = z.object({
  label: z.string(),
  images: z.array(ImageDataSchema),
});

export const TrainingDataSchema = z.object({
  trainedData: z.array(DataGroupSchema),
  untrainedData: z.array(DataGroupSchema),
});

export type DetectionType = z.infer<typeof DetectionSchema>;
export type ImageDataType = z.infer<typeof ImageDataSchema>;
export type TickerDataGroupType = z.infer<typeof DataGroupSchema>;
export type TickerTrainingDataType = z.infer<typeof TrainingDataSchema>;
