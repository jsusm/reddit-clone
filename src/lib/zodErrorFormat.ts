import { type ZodError } from 'zod'

export function zodErrorFormat (error: ZodError): Record<string, any> {
  const out: Record<string, any> = {}
  for (const i of error.issues) {
    // Create the path in output object
    for (let l = 0; l < i.path.length; l++) {
      const endPath = l === i.path.length - 1
      const path = i.path[l]

      if (out[path] === undefined && !endPath) {
        out[path] = {}
      } else {
        out[path] = i.message
      }
    }
  }
  return out
}
