import { z } from "zod";

export const createSchema = z.object({
    title: z.string().max(100, "Max title length is 100 chars"),
    description: z.string().max(500, "Max description length is 500 chars").optional(),
    isCompleted: z.boolean().default(false)
})

export const taskSchema = z.object({
    title: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    isCompleted: z.boolean().optional()
})

export const paramsSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
})

export const queryParamsSchema = z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    search: z.string().max(100)
})