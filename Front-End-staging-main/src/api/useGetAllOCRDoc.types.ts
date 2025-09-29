import { z } from "zod";

export const MediaFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_type: z.string(),
  module: z.string(),
  submodule: z.string(),
  language: z.string(),
  file: z.string(),
  uploaded_at: z.string().datetime(),
});

export const OCRDocSchema = z.object({
  id: z.number(),
  extracted_text: z.string(),
  processed_at: z.string().datetime(),
  media_file: MediaFileSchema,
});

export const PaginationSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  page_size: z.number(),
  current_page: z.number(),
  total_pages: z.number(),
});

export const OCRDocsResponseSchema = z.object({
  results: z.array(OCRDocSchema),
  pagination_data: PaginationSchema,
});

export type OCRDocsResponse = z.infer<typeof OCRDocsResponseSchema>;
