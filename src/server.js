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

app.get('/health', (req, res) => res.send('ok'))

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

app.listen(PORT, () => console.log(`listening on ${PORT}`))

module.exports = app
