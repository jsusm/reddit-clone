import * as jose from 'jose'
import { JWT_SECRET } from '../config'
import { type User } from '@prisma/client'

export async function createJWT (user: User): Promise<string> {
  const token = await new jose.SignJWT({ name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setSubject(user.id.toString())
    .setExpirationTime('2h')
    .sign(JWT_SECRET)
  return token
}
