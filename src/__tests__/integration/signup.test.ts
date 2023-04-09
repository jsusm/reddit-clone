import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import app from '../../app'

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

      console.log(res)
      expect(res.body).toHaveProperty('token')
    })
  })
})
