//@flow weak
import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import licenceUpload from './licence-upload'
import s3 from './s3'
import uuid from 'uuid'
import config from './config'
import sentiaPnr from 'sentia-pnr'
import graphql from './graphql'
import http from 'http'
import { setupIO } from './realtime-queue'

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

app.use(cookieParser())
app.use('/graphql', graphql);

app.get('/queue/:visitorId', (req, res) => {
  console.log(req.params.visitorId)
  getQueueInfo(req.params.visitorId)
    .then(result => {
      res.send(result)
    })
    .catch(
      error => {
        res.status(500).send(error)
      }
  )
})

app.get('/health', (req, res) => res.send('ok'))

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

const server = http.Server(app);
const io = setupIO(server);

server.listen(PORT, () => console.log(`listening on ${PORT}`))

module.exports = server
