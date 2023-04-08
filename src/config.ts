import dotenv from 'dotenv'
dotenv.config()
export const PORT = process.env.PORT ?? 8080
const jwtSecret = process.env.JWT_SECRET
if (jwtSecret === undefined) {
  throw new Error('JWT_SECRET environmental variable is not defined.')
}
export const JWT_SECRET = new TextEncoder().encode(jwtSecret)
