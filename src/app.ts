import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import routes from './routes'

const app = express()

// middlewares
app.use(bodyParser.json())
app.use(morgan('dev'))

app.use('/api/v1', routes)

export default app
