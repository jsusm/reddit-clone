import { z } from 'zod'

export const findParamsSchema = z.object({
  id: z.coerce.number().gte(0)
})

export const createPostSchema = z.object({
  title: z.string().max(200),
  content: z.string()
})

export const updatePostSchema = createPostSchema.partial()
