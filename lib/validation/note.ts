import {z} from "zod"

export const createNoteSchema = z.object({
    title: z.string().min(1, { message: "A Title is required"}),
    content: z.string().min(1, { message: "Content of Note is required"}),
    labelId: z.string().optional()
})

export type CreateNoteType = z.infer<typeof createNoteSchema>

export const updateNoteSchema = createNoteSchema.extend({
    id: z.string().min(1)
})

export const deleteNoteSchema = z.object({
    id: z.string().min(1)
})