import { z } from "zod";

export const FrameSchema = z.object({
  id: z.number(),
  image_file: z.string(),
  label: z.string(),
  extracted_text: z.string(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.string(),
  media_file: z.number(),
});

export const MediaFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_type: z.string(),
  module: z.string(),
  submodule: z.string(),
  language: z.string(),
  file: z.string(),
  uploaded_at: z.string(),
  frames: z.array(FrameSchema),
});

export const ProcessingResponseSchema = z.object({
  message: z.string(),
  media_file: MediaFileSchema,
  updated_frames: z.array(z.number()),
});

export type OCRMediaResponse = z.infer<typeof ProcessingResponseSchema>;
