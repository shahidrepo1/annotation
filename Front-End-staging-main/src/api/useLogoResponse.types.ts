import { z } from "zod";

export const LogoLabelSchema = z.object({
  id: z.number(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
});

export const LogoImageSchema = z.object({
  id: z.number(),
  media_file: z.number(),
  image: z.string(),
  module_name: z.string(),
  labels: z.array(LogoLabelSchema),
  uploaded_at: z.string(),
  is_annotated: z.boolean().optional(),
});

export const LogoImageResponseSchema = z.object({
  message: z.string(),
  data: z.array(LogoImageSchema),
});

export type LogoLabel = z.infer<typeof LogoLabelSchema>;
export type LogoImage = z.infer<typeof LogoImageSchema>;
export type LogoImageList = z.infer<typeof LogoImageResponseSchema>;
