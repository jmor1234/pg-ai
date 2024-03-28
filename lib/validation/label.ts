import {z} from "zod"

export const createLabelSchema = z.object({
    name: z.string().min(1, { message: "A Label name is required"}),
})

export type CreateLabelType = z.infer<typeof createLabelSchema>

export const updateLabelSchema = createLabelSchema.extend({
    id: z.string().min(1)
})

export const deleteLabelSchema = z.object({
    id: z.string().min(1)
})

