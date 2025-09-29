import { z } from "zod";

export const mediaFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_type: z.string(),
  module: z.string(),
  submodule: z.string(),
  language: z.string(),
  file: z.string(),
  uploaded_at: z.string().datetime(),
});

export const documentSchema = z.object({
  id: z.number(),
  extracted_text: z.string(),
  processed_at: z.string().datetime(),
  media_file: mediaFileSchema,
});

export type MediaFile = z.infer<typeof mediaFileSchema>;
export type DocumentDataResponse = z.infer<typeof documentSchema>;
