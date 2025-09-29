import { z } from "zod";

export const SegmentSchema = z.object({
  id: z.number(),
  media_file: z.number(),
  media_file_url: z.string(),
  label: z.string(),
  start_time: z.number(),
  end_time: z.number(),
  created_at: z.string().datetime(),
  is_edited: z.boolean(),
});

export const AudioProcessingResponseSchema = z.object({
  message: z.string(),
  audio_id: z.number(),
  total_segments: z.number(),
  segments: z.array(SegmentSchema),
});

export type Segment = z.infer<typeof SegmentSchema>;
export type AudioProcessingResponse = z.infer<
  typeof AudioProcessingResponseSchema
>;
