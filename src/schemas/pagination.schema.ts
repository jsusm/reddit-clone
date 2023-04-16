import { z } from "zod"

export const paginationSchema = z.object({
  offset: z.coerce.number().gt(0).finite().default(0),
  limit: z.coerce.number().gt(0).finite().default(10)
}).partial()
