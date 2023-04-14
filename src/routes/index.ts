import express from 'express'
import authRouter from './auth.router'
import postsRouter from './posts.router'
import commentRouter from './comments.router'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/posts', postsRouter)
router.use('/comments', commentRouter)

export default router
