import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(256)
})

export type SingupSchema = z.infer<typeof signupSchema>
