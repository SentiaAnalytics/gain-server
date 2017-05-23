//@flow
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import * as auth from './auth'
import licenceUpload from './licence-upload'
import * as testdrives from './testdrives'
import s3 from './s3'
import uuid from 'uuid'
import config from './config'
import sentiaPnr from 'sentia-pnr'

const pnr = sentiaPnr(config.pnr)

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
app.post('/auth', auth.authenticate)
app.use(auth.validate) // validate auth token. place all other endpoints after this line
app.get('/auth', auth.getSession)

app.get('/pnr/:pnr', (req, res) =>
  pnr(req.params.pnr)
    .then(x => x.body['001'])
    .then(
      r => res.send(r),
      e => res.status(500).send(e)
    )
)

app.post('/ncg/userid', upload.single('license'), licenceUpload(s3.put, uuid.v4()))

app.get('/testdrives', testdrives.getAll)
app.post('/testdrives', testdrives.create)

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

app.listen(PORT, () => console.log(`listening on ${PORT}`))

module.exports = app
