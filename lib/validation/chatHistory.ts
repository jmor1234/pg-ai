import { z } from "zod";

export const saveChatSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  label: z.string().min(1, { message: "Label is required" })
});

export type SaveChatType = z.infer<typeof saveChatSchema>;
