//@flow
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import {login, validate} from './auth'
import licenceUpload from './licence-upload'
import userId from './userid'
import s3 from './s3'
import dynamodb from './dynamodb'
import uuid from 'uuid'
const PORT = process.env.PORT || 8080

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

app.post('/ncg/userid', upload.single('licence'), licenceUpload(s3.put, uuid.v4()))

app.put('/userid', userId(dynamodb.put))

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

app.listen(PORT, () => console.log(`listening on ${PORT}`))

module.exports = app
