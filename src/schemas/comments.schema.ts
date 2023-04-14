import { z } from 'zod'

const id = z.coerce.number().gte(0)

export const findParamsSchema = z.object({
  id: z.coerce.number().gte(0)
})

export const createCommentSchema = z.object({
  content: z.string().max(255),
})

export const updateCommentSchema = createCommentSchema.partial()
