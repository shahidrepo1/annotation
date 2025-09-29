import { z } from "zod";

export const UserDetailSchema = z
  .object({
    uuid: z.number(),
    profileId: z.number(),
    userName: z.string(),
    userEmail: z.string().email(),
    userType: z.union([
      z.literal("admin"),
      z.literal("user"),
      z.literal("annotator"),
      z.literal("trainer"),
    ]),
    accessToken: z.string(),
    refreshToken: z.string(),
    profilePic: z.nullable(z.string()),
  })
  .strict();

export type UserDetailType = z.infer<typeof UserDetailSchema>;
