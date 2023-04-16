import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import app from '../../app'
import { type SingupSchema } from '../../schemas/signup.schema'

const prisma = new PrismaClient()

afterAll(async () => {
  const deleteUsers = prisma.user.deleteMany()
  await prisma.$transaction([deleteUsers])
  await prisma.$disconnect()
})

describe('Singup route (/auth/signup)', () => {
  describe('Given an invalid payload', () => {
    it('Should return 400 Bad Request', async () => {
      const invalidPayload = {
        name: 'me',
        email: 'notAnEmail',
        password: 'pswd'
      }
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(invalidPayload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)

      expect(res.body).toHaveProperty('error')
    })
  })
  describe('Given a valid payload', () => {
    it('Should return 201 Created', async () => {
      const payload: SingupSchema = {
        name: 'testUser',
        email: 'test@user.com',
        password: 'randompassword'
      }
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(payload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)

      expect(res.body).toHaveProperty('token')
    })
  })
  describe('Given an email that is already in use', () => {
    it('Should return 400 Bad Request', async () => {
      const user = await prisma.user.create({
        data: {
          email: "email_in_user@test.com",
          password: "password",
          name: 'testUser',
        }
      })
      const payload: SingupSchema = {
        name: 'testUser',
        email: user.email,
        password: 'randompassword'
      }
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(payload)
        .set('Accept', 'application/json')
        .expect(400)
      expect(res.body).toHaveProperty('error')
    })
  })
})
