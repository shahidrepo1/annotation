import { z } from "zod";

export const KeywordListSchema = z.object({
  data: z.array(z.string()),
});

export type LabelList = z.infer<typeof KeywordListSchema>;
