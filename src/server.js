//@flow
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import {authenticate, validate, getSession} from './auth'
import licenceUpload from './licence-upload'
import userId from './userid'
import s3 from './s3'
import * as dynamodb from './dynamodb'
import uuid from 'uuid'
const PORT = process.env.PORT || 8080

const upload = multer()

const app = express()

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.use(bodyParser.json())
app.use(cookieParser())

app.get('/health', (req, res) => res.send('ok'))
app.post('/auth', authenticate)
app.use(validate) // validate auth token. place all other endpoints after this line
app.get('/auth', getSession)

app.post('/ncg/userid', upload.single('license'), licenceUpload(s3.put, uuid.v4()))

app.put('/userid', userId(dynamodb.put))

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

app.listen(PORT, () => console.log(`listening on ${PORT}`))

module.exports = app
