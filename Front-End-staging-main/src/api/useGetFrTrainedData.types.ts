import { z } from "zod";

const imageSchema = z.object({
  id: z.number(),
  processedImage: z.string(),
  label: z.string(),
  created_at: z.string().datetime(),
});

const trainedDataSchema = z.object({
  label: z.string(),
  images: z.array(imageSchema),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const modelSchema = z.object({
  id: z.number(),
  version: z.string(),
  modelName: z.string(),
  epoch: z.number(),
  totalEpochs: z.number(),
  status: z.string(),
  createdAt: z.string().datetime(),
  trainedData: z.array(trainedDataSchema),
});

export type ModelType = z.infer<typeof modelSchema>;
export type TrainedDataType = z.infer<typeof trainedDataSchema>;
export type ImageType = z.infer<typeof imageSchema>;
