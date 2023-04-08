import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { PORT } from './config'
import routes from './routes'

const app = express()

// middlewares
app.use(bodyParser.json())
app.use(morgan('dev'))

app.use('/api/v1', routes)

app.listen(PORT, () => {
  console.log(`Listen on port: ${PORT}`)
})
