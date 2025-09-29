import { z } from "zod";

export const trainingDataEntrySchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const paginationDataSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  page_size: z.number(),
  current_page: z.number(),
  total_pages: z.number(),
});

export const trainingDataBlockSchema = z.object({
  results: z.array(trainingDataEntrySchema),
  pagination_data: paginationDataSchema,
});

export const trainingDataResponseSchema = z.object({
  trained: trainingDataBlockSchema,
  untrained: trainingDataBlockSchema,
});

export type TrainingDataEntry = z.infer<typeof trainingDataEntrySchema>;
export type PaginationData = z.infer<typeof paginationDataSchema>;
export type TrainingDataBlock = z.infer<typeof trainingDataBlockSchema>;
export type TrainingDataResponse = z.infer<typeof trainingDataResponseSchema>;
