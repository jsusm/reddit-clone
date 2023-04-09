import { z } from 'zod'

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(256)
})

export type SigninSchema = z.infer<typeof signinSchema>
