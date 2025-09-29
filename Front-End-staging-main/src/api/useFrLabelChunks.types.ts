import { z } from "zod";

const frImageSchema = z.object({
  id: z.number(),
  processedImage: z.string(),
});

export type FrImageType = z.infer<typeof frImageSchema>;

const frFolderSchema = z.object({
  label: z.string(),
  images: z.array(frImageSchema),
});

export type FrFolderType = z.infer<typeof frFolderSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const frProcessedDataSchema = z.object({
  trainedData: z.array(frFolderSchema),
  untrainedData: z.array(frFolderSchema),
});

export type FrProcessedDataType = z.infer<typeof frProcessedDataSchema>;
