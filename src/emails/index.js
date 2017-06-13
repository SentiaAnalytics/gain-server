//@flow weak
import * as emails from './emails'
import nodemailer from 'nodemailer'
import config from '../config'
import {compose} from 'ramda'
import Task from 'data.task'
const emailTransport = nodemailer.createTransport(config.emailTransport)
const sendMail = x => emailTransport.sendMail(x)


export const sendTestdriveConfirmation = testdrive => testdrivePDF =>
  new Task((reject, resolve) =>
    sendMail(emails.testdriveConfirmation(testdrive, testdrivePDF))
      .then(resolve, reject)
  )
