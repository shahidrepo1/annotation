import { z } from "zod";

const timestampSchema = z.object({
  start: z.number(),
  end: z.number(),
});

const chunkSchema = z.object({
  id: z.number(),
  timestamp: timestampSchema,
  media_file: z.string(),
});

const labelGroupSchema = z.object({
  label: z.string(),
  chunks: z.array(chunkSchema),
});

export type LabelGroup = z.infer<typeof labelGroupSchema>;

export const dataSchema = z.object({
  trainedData: z.array(labelGroupSchema),
  untrainedData: z.array(labelGroupSchema),
});

export type DataType = z.infer<typeof dataSchema>;
