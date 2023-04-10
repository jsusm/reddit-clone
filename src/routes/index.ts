import express from 'express'
import authRouter from './auth.router'
import postsRouter from './posts.router'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/posts', postsRouter)

export default router
