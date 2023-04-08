import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { PORT } from './config'

const app = express()

// middlewares
app.use(bodyParser.json())
app.use(morgan('dev'))

app.listen(PORT, () => {
  console.log(`Listen on port: ${PORT}`)
})
