import request from 'supertest'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import app from '../../app'
import { type SigninSchema } from '../../schemas/signin.schema'

const prisma = new PrismaClient()

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('randompassword', 8)
  await prisma.user.create({
    data: {
      name: 'testUser',
      email: 'test@user.com',
      password: passwordHash
    }
  })
})

afterAll(async () => {
  const deleteUsers = prisma.user.deleteMany()
  await prisma.$transaction([deleteUsers])
  await prisma.$disconnect()
})

describe('Singin route (/auth/signin)', () => {
  describe('Given an invalid payload', () => {
    it('Should return 400 Bad Request', async () => {
      const invalidPayload = {
        name: 'me',
        email: 'notAnEmail',
        password: 'pswd'
      }
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send(invalidPayload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })
  describe('Given a valid payload', () => {
    it('Should return 200 Created and token', async () => {
      const payload: SigninSchema = {
        email: 'test@user.com',
        password: 'randompassword'
      }
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(res.body).toHaveProperty('token')
    })
  })
  describe('Given a non existen email', () => {
    it('Should return 400 BadRequest', async () => {
      const payload: SigninSchema = {
        email: 'non_existent@test.com',
        password: 'randompassword'
      }
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })
  describe('Given the wrong password', () => {
    it('Should return 400 BadRequest', async () => {
      const payload: SigninSchema = {
        email: 'non_existent@email.com',
        password: 'randompassword'
      }
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })
})
