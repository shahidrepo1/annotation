import { z } from "zod";

const audioItemSchema = z.object({
  id: z.number(),
  chunk_name: z.string(),
  transcription: z.string(),
  created_at: z.string().datetime(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  is_trained: z.boolean(),
  uploaded_file: z.number(),
});

export type AudioItemType = z.infer<typeof audioItemSchema>;

const folderSchema = z.object({
  folderName: z.string(),
  data: z.array(audioItemSchema),
});

export type FolderType = z.infer<typeof folderSchema>;

export const audioDataSchema = z.array(folderSchema);

export type AudioDataType = z.infer<typeof audioDataSchema>;
