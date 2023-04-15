import request from 'supertest'
import app from '../../app'
import { type User, type Post, PrismaClient } from '@prisma/client'
import { type z } from 'zod'
import {
  type updatePostSchema,
  type createPostSchema
} from '../../schemas/posts.schema'
import { createJWT } from '../../lib/createJWT'

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
    prisma.post.deleteMany(),
    prisma.user.deleteMany()
  ])
})

describe('GET /posts', () => {
  it('Should return a list of posts', async () => {
    const res = await request(app)
      .get('/api/v1/posts')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(res.body instanceof Array).toBe(true)
  })
})

describe('GET /posts/:id', () => {
  describe('Given an existent id', () => {
    it('Should return a post instance', async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${dummyPost.id}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body).toBeDefined()
    })
  })
  describe('Given a non-existent id', () => {
    it('Should return a 404 not found', async () => {
      const res = await request(app)
        .get('/api/v1/posts/100000')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
      expect(res.body).toHaveProperty('error')
    })
  })
})

describe('POST /posts/', () => {
  describe('Given a valid payload', () => {
    it('Should return a post instance', async () => {
      const payload: z.infer<typeof createPostSchema> = {
        title: 'TestPost',
        content: 'Post created for tests purposes'
      }
      const res = await request(app)
        .post('/api/v1/posts')
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
        .post('/api/v1/posts')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(400)
      expect(res.body).toHaveProperty('error')
    })
  })
})

describe('PATCH /posts/', () => {
  describe('Given an existent id and a valid payload', () => {
    it('Should return an updated post instance', async () => {
      const updatedTitle = 'Updated Test Post'
      const payload: z.infer<typeof updatePostSchema> = {
        title: updatedTitle
      }
      const res = await request(app)
        .patch(`/api/v1/posts/${dummyPost.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(200)
      expect(res.body).toHaveProperty('title', updatedTitle)
    })
  })
  describe('Given an non-existent id and a valid payload', () => {
    it('Should return a 404 Not Found', async () => {
      const updatedTitle = 'Updated Test Post'
      const payload: z.infer<typeof updatePostSchema> = {
        title: updatedTitle
      }
      const res = await request(app)
        .patch('/api/v1/posts/100000')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect('Content-Type', /json/)
        .expect(404)
      expect(res.body).toHaveProperty('error')
    })
  })
  describe("Try to update a post that signed user don't own", () => {
    it('Should return a 401 Unauthorized', async () => {
      const user = await prisma.user.create({
        data: { email: 'post_user1@test.com', password: 'randompassword' }
      })
      const anotherUserPost = await prisma.post.create({
        data: { title: 'Test Post', content: '', authorId: user.id }
      })
      const res = await request(app)
        .patch(`/api/v1/posts/${anotherUserPost.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(401)
      expect(res.body).toHaveProperty('error')
    })
  })
})

describe('DELETE /posts/', () => {
  describe('Given an existent id', () => {
    it('Should return a 200 Ok', async () => {
      const postToDelete = await prisma.post.create({
        data: { title: '', content: '', authorId: author.id }
      })
      await request(app)
        .delete(`/api/v1/posts/${postToDelete.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })
  describe('Given an non-existent id', () => {
    it('Should return a 404 Not Found', async () => {
      await request(app)
        .delete('/api/v1/posts/100000')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(404)
    })
  })
  describe("Try to update a post that signed user don't own", () => {
    it('Should return a 401 Unauthorized', async () => {
      const user = await prisma.user.create({
        data: { email: 'post_user2@test.com', password: 'randompassword' }
      })
      const anotherUserPost = await prisma.post.create({
        data: { title: 'Test Post', content: '', authorId: user.id }
      })
      const res = await request(app)
        .delete(`/api/v1/posts/${anotherUserPost.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(401)
      expect(res.body).toHaveProperty('error')
    })
  })
})
