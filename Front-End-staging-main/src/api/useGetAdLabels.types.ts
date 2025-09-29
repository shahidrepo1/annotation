import { z } from "zod";

export const AdLabelSchema = z.object({
  message: z.string(),
  video_id: z.number(),
  chunk: z.array(
    z.object({
      id: z.number(),
      media_file: z.number(),
      frame: z.string(),
      media_file_url: z.string(),
      label: z.string(),
      start_time: z.number(),
      end_time: z.number(),
      created_at: z.string().datetime(),
      is_edited: z.boolean(),
    })
  ),
});

export type AdLabelType = z.infer<typeof AdLabelSchema>;
