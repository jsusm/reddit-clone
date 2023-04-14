import { PrismaClient } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated.middleware'
import { findParamsSchema, updateCommentSchema } from '../schemas/comments.schema'

const router = express.Router()
const prisma = new PrismaClient()

router.patch(
  '/:id',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId
    if (userId === undefined || typeof userId !== 'number') {
      res.sendStatus(401)
      return
    }
    try {
      const params = findParamsSchema.parse(req.params)
      const data = updateCommentSchema.parse(req.body)
      const comment = await prisma.comment.findUnique({
        where: {
          id: params.id
        }
      })
      if (comment === null) {
        res
          .status(404)
          .json({ error: `Comment with id ${params.id} doesn't exist` })
        return
      }
      if (comment.authorId !== userId) {
        res
          .status(401)
          .json({ error: 'You don\'t have access to modify this resource' })
        return
      }
      const updatedComment = await prisma.comment.update({ data, where: { id: params.id } })
      res
        .status(200)
        .json(updatedComment)
    } catch (error) {
      next(error)
    }
  }
)

router.delete('/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.userId
  if (userId === undefined || typeof userId !== 'number') {
    res.sendStatus(401)
    return
  }
  try {
    const params = findParamsSchema.parse(req.params)
    const comment = await prisma.comment.findUnique({ where: { id: params.id } })
    if (comment === null) {
      res
        .status(404)
        .json({ error: `Comment with id ${params.id} doesn't exists` })
      return
    }
    if (comment.authorId !== userId) {
      res
        .status(401)
        .json({ error: 'You don\'t have access to delete this resource' })
      return
    }
    await prisma.comment.delete({ where: { id: comment.id } })
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})


export default router
