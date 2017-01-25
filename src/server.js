//@flow
import express from 'express'
import config from 'config'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import {login, validate} from './auth'
import licenceUpload from './licence-upload'
import {put} from './s3'
import uuid from 'uuid'

const upload = multer()

const app = express()

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/health', (req, res) => res.send('ok'))
app.post('/auth', login)

app.get('/test', validate, (req, res) => res.send('ok'))

app.post('/ncg/userid', upload.single('licence'), licenceUpload(put, uuid.v4()))

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

app.listen(8080, () => console.log('listening on 8080'))

module.exports = app
