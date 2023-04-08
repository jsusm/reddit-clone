/* eslint-disable @typescript-eslint/no-misused-promises */
import type { Request, Response } from 'express'
import express from 'express'
import bcrypt from 'bcrypt'
import * as jose from 'jose'
import { signupSchema } from '../schemas/signup.schema'
import { PrismaClient } from '@prisma/client'
import { JWT_SECRET } from '../config'

const router = express.Router()
const prisma = new PrismaClient()

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body)
    const passwordHash = await bcrypt.hash(data.password, 8)
    const user = await prisma.user.create({ data: { ...data, password: passwordHash } })

    const token = await new jose.SignJWT({ name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setSubject(user.id.toString())
      .setExpirationTime('2h')
      .sign(JWT_SECRET)

    res.status(201).json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).send('Something whent wrong.')
  }
})

export default router
