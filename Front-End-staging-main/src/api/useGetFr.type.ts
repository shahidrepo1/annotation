import { z } from "zod";

export const NameListSchema = z.array(z.string());

export type FrLabelList = z.infer<typeof NameListSchema>;
