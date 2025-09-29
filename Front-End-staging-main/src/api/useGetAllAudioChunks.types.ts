import { z } from "zod";
const audioChunkSchema = z.object({
  id: z.number(),
  audioChunk: z.string(),
});

export const speakerDataSchema = z.object({
  speaker: z.string(),
  chunks: z.array(audioChunkSchema),
});

export const audioDataSchema = z.object({
  noneTrainedData: z.array(speakerDataSchema),
  trainedData: z.array(speakerDataSchema),
});

export const speakerDataListSchema = z.array(speakerDataSchema);

export type SpeakerData = z.infer<typeof speakerDataListSchema>;

export type AllAudioData = z.infer<typeof audioDataSchema>;
