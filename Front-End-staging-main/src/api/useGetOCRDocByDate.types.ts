import { z } from "zod";

const ResultSchema = z.object({
  date: z.string(),
  count: z.number(),
});

const PaginationSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  page_size: z.number(),
  current_page: z.number(),
  total_pages: z.number(),
});

const DataBlockSchema = z.object({
  results: z.array(ResultSchema),
  pagination_data: PaginationSchema,
});

export const TrainedUntrainedSchema = z.object({
  trained: DataBlockSchema,
  untrained: DataBlockSchema,
});

export type DocDataResponse = z.infer<typeof TrainedUntrainedSchema>;
