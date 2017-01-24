//@flow
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import {login, validate} from './auth'
const app = express()

app.use(bodyParser.json())
app.use(cookieParser())

app.get('/health', (req, res) => res.send('ok'))
app.post('/auth', login)

app.get('/test', validate, (req, res) => res.send('ok'))

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

app.listen(8080, () => console.log('listening on 8080'))
