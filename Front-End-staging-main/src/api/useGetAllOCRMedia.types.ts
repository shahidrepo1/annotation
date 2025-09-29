import { z } from "zod";

export const frameSchema = z.object({
  id: z.number(),
  image_file: z.string(),
  label: z.string(),
  extracted_text: z.string(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.string(),
  media_file: z.number(),
});

export const framesWithPaginationSchema = z.object({
  results: z.array(frameSchema),
  pagination_data: z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    page_size: z.number(),
    current_page: z.number(),
    total_pages: z.number(),
  }),
});

export const resultSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_type: z.string(),
  module: z.string().optional().nullable(),
  submodule: z.string().optional().nullable(),
  language: z.string(),
  file: z.string().optional().nullable(),
  uploaded_at: z.string(),
  frames: framesWithPaginationSchema,
});

export const paginationSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  page_size: z.number(),
  current_page: z.number(),
  total_pages: z.number(),
});

export const ocrMediaResponseSchema = z.object({
  results: z.array(resultSchema),
  pagination_data: paginationSchema,
});

export type Frame = z.infer<typeof frameSchema>;
export type FramesWithPagination = z.infer<typeof framesWithPaginationSchema>;
export type OCRMediaResult = z.infer<typeof resultSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type OCRMediaData = z.infer<typeof ocrMediaResponseSchema>;
