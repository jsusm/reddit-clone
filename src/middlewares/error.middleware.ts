import type { Request, Response, NextFunction } from 'express'

export function defaultErrorMiddleware (error: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(error)
  res.status(500).json({ error: error.message })
}
