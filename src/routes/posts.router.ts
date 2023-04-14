/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import { isAuthenticated } from '../middlewares/isAuthenticated.middleware'
import { createCommentSchema } from '../schemas/comments.schema'
import {
  createPostSchema,
  findParamsSchema,
  updatePostSchema
} from '../schemas/posts.schema'

const router = express.Router()
const prisma = new PrismaClient()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.status(200).json(posts)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = findParamsSchema.parse(req.params)
    const post = await prisma.post.findUnique({
      where: {
        id: params.id
      },
      include: {
        comments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    if (post == null) {
      res.status(404).json({ error: `Post with id: ${params.id} not found.` })
      return
    }
    res.status(200).json(post)
  } catch (error) {
    next(error)
  }
})

router.get('/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = findParamsSchema.parse(req.params)
    const comments = await prisma.comment.findMany({
      where: {
        postId: params.id
      }
    })
    res.status(200).json(comments)
  } catch (error) {
    next(error)
  }
})

router.post(
  '/',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId
    if (userId === undefined || typeof userId !== 'number') {
      res.sendStatus(401)
      return
    }
    try {
      const data = createPostSchema.parse(req.body)
      const post = await prisma.post.create({
        data: { ...data, authorId: userId }
      })
      res.status(201).json(post)
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/:id/comments',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId
    if (userId === undefined || typeof userId !== 'number') {
      res.sendStatus(401)
      return
    }
    try {
      const params = findParamsSchema.parse(req.params)
      const data = createCommentSchema.parse(req.body)
      const post = await prisma.post.findUnique({ where: { id: params.id } })
      if (post === null) {
        res.status(404).json({ error: `Post with id ${params.id} doesn't exist` })
        return
      }
      const comment = await prisma.comment.create({
        data: {
          ...data,
          postId: post.id,
          authorId: userId,
        }
      })
      res.status(201).json(comment)
    } catch (error) {
      next(error)
    }
  }
)

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
      const post = await prisma.post.findUnique({ where: { id: params.id } })
      if (post === null) {
        res
          .status(404)
          .json({ error: `Post with id: ${params.id} not found.` })
        return
      }
      // verify if post.authorId is the authenticated user
      if (post.authorId !== userId) {
        res
          .status(401)
          .json({
            error: "You don't have permissions to modify this resource"
          })
        return
      }
      const data = updatePostSchema.parse(req.body)
      const updatedPost = await prisma.post.update({
        data: { ...data },
        where: { id: post.id }
      })
      res.status(200).json(updatedPost)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
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
      const post = await prisma.post.findUnique({ where: { id: params.id } })
      if (post === null) {
        res
          .status(404)
          .json({ error: `Post with id: ${params.id} not found.` })
        return
      }
      // verify if post.authorId is the authenticated user
      if (post.authorId !== userId) {
        res
          .status(401)
          .json({
            error: "You don't have permissions to delete this resource"
          })
        return
      }
      await prisma.post.delete({ where: { id: params.id } })
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

export default router
