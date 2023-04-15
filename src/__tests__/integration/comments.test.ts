import request from 'supertest'
import app from '../../app'
import { type User, type Post, PrismaClient } from '@prisma/client'
import { type z } from 'zod'
import { createJWT } from '../../lib/createJWT'
import { type createCommentSchema } from '../../schemas/comments.schema'

const prisma = new PrismaClient()

let dummyPost: Post
let token: string
let author: User

beforeAll(async () => {
  author = await prisma.user.create({
    data: {
      name: 'Post test user',
      email: 'user@test.com',
      password: 'randompassword'
    }
  })
  token = await createJWT(author)
  dummyPost = await prisma.post.create({
    data: {
      title: 'Dummy Post',
      content: 'This post is for testing purposes',
      authorId: author.id
    }
  })
})
afterAll(async () => {
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany()
  ])
})

describe('GET /posts/:id/comments', () => {
  describe('Guiven an existent id', () => {
    it('Should return a list of comments', async () => {
      const comment = await prisma.comment.create({
        data: {
          authorId: author.id,
          postId: dummyPost.id,
          content: '',
        }
      })
      const res = await request(app)
        .get(`/api/v1/posts/${dummyPost.id}/comments`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body instanceof Array).toBe(true)
      expect(res.body[0]).toHaveProperty('id', comment.id)
    })
  })
})

describe('POST /posts/:id/comments', () => {
  describe('Given a valid payload', () => {
    it('Should return a comment instance', async () => {
      const payload: z.infer<typeof createCommentSchema> = {
        content: 'TestComment'
      }
      const res = await request(app)
        .post(`/api/v1/posts/${dummyPost.id}/comments`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(201)
      expect(res.body).toBeDefined()
    })
  })
  describe('Given an invalid payload', () => {
    it('Should return a 400 Bad Request', async () => {
      const payload = {}
      const res = await request(app)
        .post(`/api/v1/posts/${dummyPost.id}/comments`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(400)
      expect(res.body).toHaveProperty('error')
    })
  })
  describe('Given an non-existent post id payload', () => {
    it('Should return a 404 Not Found', async () => {
      const payload: z.infer<typeof createCommentSchema> = {
        content: 'TestComment'
      }
      const res = await request(app)
        .post('/api/v1/posts/1000000/comments')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(404)
      expect(res.body).toHaveProperty('error')
    })
  })
})

describe('PATCH /comments/:id', () => {
  describe('Given a valid payload', () => {
    it('Should return an updated instance', async () => {
      const comment = await prisma.comment.create({
        data: {
          content: 'TestComment',
          postId: dummyPost.id,
          authorId: author.id
        }
      })
      const payload: z.infer<typeof createCommentSchema> = {
        content: 'TestCommentUpdated'
      }
      const res = await request(app)
        .patch(`/api/v1/comments/${comment.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body).toHaveProperty('content', 'TestCommentUpdated')
    })
  })
  describe('Given an non-existent id', () => {
    it('Should return a 404 Not Found', async () => {
      const payload = {}
      const res = await request(app)
        .patch('/api/v1/comments/1000000')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(404)
      expect(res.body).toHaveProperty('error')
    })
  })
  describe("Try to update a comment that signed user don't own", () => {
    it('Should return a 401 Unauthorized', async () => {
      const user = await prisma.user.create({
        data: { email: 'post_user1@test.com', password: 'randompassword' }
      })
      const post = await prisma.post.create({
        data: { title: 'CommentTestPost', content: '', authorId: user.id }
      })
      const anotherUserComment = await prisma.comment.create({
        data: {
          content: 'TestComment',
          authorId: user.id,
          postId: post.id
        }
      })
      const res = await request(app)
        .patch(`/api/v1/comments/${anotherUserComment.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(401)
      expect(res.body).toHaveProperty('error')
    })
  })
})

describe('DELETE /comments/:id', () => {
  describe('Given a existent id', () => {
    it('Should return a 200 Ok', async () => {
      const commentToDelete = await prisma.comment.create({
        data: {
          content: '',
          authorId: author.id,
          postId: dummyPost.id
        }
      })
      await request(app)
        .delete(`/api/v1/comments/${commentToDelete.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })
  describe('Given a non-existent id', () => {
    it('Should return a 404 Not Found', async () => {
      const res = await request(app)
        .delete('/api/v1/comments/1000000')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(404)
      expect(res.body).toHaveProperty('error')
    })
  })
  describe('Try to delete a comment that signed user don\'t own', () => {
    it('Should return a 401 Unauthorized', async () => {
      const user = await prisma.user.create({
        data: { email: 'post_user2@test.com', password: 'randompassword' }
      })
      const post = await prisma.post.create({
        data: { title: 'CommentTestPost', content: '', authorId: user.id }
      })
      const anotherUserComment = await prisma.comment.create({
        data: {
          content: 'TestComment',
          authorId: user.id,
          postId: post.id
        }
      })
      const res = await request(app)
        .delete(`/api/v1/comments/${anotherUserComment.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(401)
      expect(res.body).toHaveProperty('error')
    })
  })
})
