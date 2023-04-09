import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import routes from './routes'
import { defaultErrorMiddleware } from './middlewares/error.middleware'

const app = express()

// middlewares
app.use(bodyParser.json())
app.use(morgan('dev'))

app.use('/api/v1', routes)

// error handling
app.use(defaultErrorMiddleware)

export default app
