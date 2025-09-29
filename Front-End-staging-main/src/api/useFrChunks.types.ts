import { z } from "zod";

const faceSchema = z.object({
  id: z.number(),
  media_file: z.number(),
  processed_image: z.string(),
  label: z.string(),
  module_name: z.string(),
  created_at: z.string().datetime(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
});

export const faceExtractionResponseSchema = z.object({
  message: z.string(),
  faces: z.array(faceSchema),
});

export type FrDataType = z.infer<typeof faceSchema>;
export type FrType = z.infer<typeof faceExtractionResponseSchema>;
