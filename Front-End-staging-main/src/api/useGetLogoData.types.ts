import { z } from "zod";

const labelSchema = z.object({
  id: z.number(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
});
export type LabelType = z.infer<typeof labelSchema>;

const imageSchema = z.object({
  id: z.number(),
  labels: z.array(labelSchema),
  image: z.string().url(),
  module_name: z.string(),
  uploaded_at: z.string().datetime(),
  is_deleted: z.boolean(),
  user: z.number().nullable(),
  media_file: z.number(),
});
export type ImageType = z.infer<typeof imageSchema>;

const datedImagesSchema = z.object({
  date: z.string(),
  data: z.array(imageSchema),
});
export type DatedImagesType = z.infer<typeof datedImagesSchema>;

export const logoDetectionDataSchema = z.object({
  results: z.object({
    trainedData: z.array(datedImagesSchema),
    untrainedData: z.array(datedImagesSchema),
  }),
  pagination_data: z.object({
    count: z.number(),
    next: z.string().url().nullable(),
    previous: z.string().url().nullable(),
    page_size: z.number(),
    current_page: z.number(),
    total_pages: z.number(),
  }),
});

export type LogoDetectionDataType = z.infer<typeof logoDetectionDataSchema>;
