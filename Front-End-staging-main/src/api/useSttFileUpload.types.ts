import { z } from "zod";

export const SttTranscriptionSchema = z.object({
  folderName: z.string().optional(),
  chunks: z.array(
    z.object({
      id: z.number(),
      chunk_name: z.string(),
      transcription: z.string(),
      created_at: z.string(),
      is_edited: z.boolean(),
      is_deleted: z.boolean(),
      uploaded_file: z.number(),
      is_trained: z.boolean(),
    })
  ),
});

export type SttTranscription = z.infer<typeof SttTranscriptionSchema>;

export const SttUpdatedTranscriptionSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      chunk_name: z.string(),
      transcription: z.string(),
      created_at: z.string(),
      is_edited: z.boolean(),
      is_deleted: z.boolean(),
      uploaded_file: z.number(),
    })
  ),
});

export type SttUpdatedTranscription = z.infer<
  typeof SttUpdatedTranscriptionSchema
>;
