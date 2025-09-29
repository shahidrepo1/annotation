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

const ImageWithDetectionsSchema = z.object({
  image_id: z.number(),
  processedImage: z.string(),
  detections: z.array(DetectionSchema),
});

const LabeledImageGroupSchema = z.object({
  label: z.string(),
  images: z.array(ImageWithDetectionsSchema),
});

export const TrainingDataResponseSchema = z.object({
  trainedData: z.array(LabeledImageGroupSchema),
  untrainedData: z.array(LabeledImageGroupSchema),
});

export type OdDetection = z.infer<typeof DetectionSchema>;
export type OdImageWithDetections = z.infer<typeof ImageWithDetectionsSchema>;
export type OdLabeledImageGroup = z.infer<typeof LabeledImageGroupSchema>;
export type OdTrainingDataType = z.infer<typeof TrainingDataResponseSchema>;
