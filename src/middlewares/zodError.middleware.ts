import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { zodErrorFormat } from '../lib/zodErrorFormat'

export function zodErrorMiddleware (error: Error, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof ZodError) {
    res
      .status(400)
      .json({ error: zodErrorFormat(error) })
    return
  }
  next(error)
}
