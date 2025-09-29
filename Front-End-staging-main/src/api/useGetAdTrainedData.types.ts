import { z } from "zod";

const TrainedData = z.object({
  label: z.string(),
  segments: z.array(
    z.object({
      id: z.number(),
      media_file: z.string(),
      start_time: z.number(),
      end_time: z.number(),
      created_at: z.string().datetime(),
    })
  ),
});

export const Model = z.object({
  id: z.number(),
  version: z.string(),
  created_at: z.string().datetime(),
  model_name: z.string(),
  epoch: z.number(),
  total_epochs: z.number(),
  status: z.boolean(),
  module_name: z.string(),
  trainedData: z.array(TrainedData),
});

export type Models = z.infer<typeof Model>;
