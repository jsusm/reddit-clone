/* eslint-disable @typescript-eslint/no-misused-promises */
import type { Request, Response, NextFunction } from 'express'
import express from 'express'
import bcrypt from 'bcrypt'
import * as jose from 'jose'
import { signupSchema } from '../schemas/signup.schema'
import { PrismaClient } from '@prisma/client'
import { JWT_SECRET } from '../config'
import { signinSchema } from '../schemas/signin.schema'

const router = express.Router()
const prisma = new PrismaClient()

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
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
    next(error)
  }
})

router.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = signinSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (user === null) {
      res.status(400).json({ error: 'Email and password don\'t match' })
      return
    }
    const passwordMatch = await bcrypt.compare(data.password, user.password)
    if (!passwordMatch) {
      res.status(400).json({ error: 'Email and password don\'t match' })
      return
    }

    const token = await new jose.SignJWT({ name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setSubject(user.id.toString())
      .setExpirationTime('2h')
      .sign(JWT_SECRET)

    res.status(200).json({ token })
  } catch (error) {
    next(error)
  }
})

export default router
