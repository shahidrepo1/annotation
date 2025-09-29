import { z } from "zod";

const TimestampSchema = z.object({
  start: z.number(),
  end: z.number(),
});

const ChunkSchema = z.object({
  id: z.number(),
  timestamp: TimestampSchema,
  media_file: z.string(),
});

const AdGroupSchema = z.object({
  label: z.string(),
  chunks: z.array(ChunkSchema),
});

export const AdSegmentsDataSchema = z.object({
  trainedData: z.array(AdGroupSchema),
  untrainedData: z.array(AdGroupSchema),
});

export type Timestamp = z.infer<typeof TimestampSchema>;
export type Chunk = z.infer<typeof ChunkSchema>;
export type AdGroup = z.infer<typeof AdGroupSchema>;
export type AdSegmentsData = z.infer<typeof AdSegmentsDataSchema>;
