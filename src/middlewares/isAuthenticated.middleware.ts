import * as jose from 'jose'
import type { Request, Response, NextFunction } from 'express'
import { JWT_SECRET } from '../config'

export async function isAuthenticated (req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorization = req.headers.authorization
  if (authorization === undefined) {
    res.status(401).json({
      error: 'No token is provided'
    })
    return
  }
  if (!authorization.startsWith('Bearer')) {
    res.status(401).json({
      error: 'Invalid token format'
    })
    return
  }
  const rawToken = authorization.slice('Bearer '.length)
  try {
    const { payload } = await jose.jwtVerify(rawToken, JWT_SECRET, {})
    if (payload.sub === undefined) {
      res.status(401).json({
        error: 'Invalid token'
      })
      return
    }
    res.locals.userId = parseInt(payload.sub)
    next()
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token'
    })
  }
}
