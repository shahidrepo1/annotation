import { z } from "zod";

const audioChunkSchema = z.array(
  z.object({
    speaker: z.string(),
    chunks: z.array(
      z.object({
        id: z.number(),
        audioChunk: z.array(z.string()),
      })
    ),
  })
);

export type AudioChunkType = z.infer<typeof audioChunkSchema>;

export const srTrainedObject = z.object({
  id: z.number(),
  version_name: z.string(),
  user: z.number(),
  module_name: z.string(),
  model_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  f1_score: z.number(),
  is_completed: z.boolean(),
  created_at: z.string().datetime(),
  version_speakers: z.array(z.string()),
  trainedData: audioChunkSchema,
});

export type SrTrainedDataObjectType = z.infer<typeof srTrainedObject>;

export const SrTrainedDataSchema = z.array(srTrainedObject);

export type SrTrainedDataType = z.infer<typeof SrTrainedDataSchema>;
