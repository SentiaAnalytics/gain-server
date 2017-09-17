//@flow weak
import 'babel-polyfill'
import {graphiqlConnect} from 'apollo-server-express'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import licenceUpload from './licence-upload'
import uuid from 'uuid'
import config from './config'
import sentiaPnr from 'sentia-pnr'
import graphql from './graphql'
import http from 'http'
import { setupSockets } from './realtime'
import * as driversLicense from './driverslicense'
import * as sessions from './sessions'

process.on('unhandledRejection', r => console.log(r))

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
app.use(bodyParser.json())
app.use('/graphql', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post('/graphql', graphql);
app.get('/graphql', graphiqlConnect({endpointURL: '/graphql'}));
app.get('/health', (req, res) => res.send('ok'))

app.use((err, req, res, next) => {
  console.log(err.stack || err)
  res.status(500).send(err)
})

const server = http.Server(app);
const io = setupSockets(server);

server.listen(PORT, () => console.log(`listening on ${PORT}`))

module.exports = server
