//@flow weak
import * as emails from './emails'
import nodemailer from 'nodemailer'
import config from '../config'
import {compose} from 'ramda'
const emailTransport = nodemailer.createTransport(config.emailTransport)
const sendMail = x => emailTransport.sendMail(x)


export const sendTestdriveConfirmation =
  compose(sendMail, emails.testdriveConfirmation)

sendTestdriveConfirmation({email: 'andreas@sentia.io'})
  .then(console.log, console.log)
