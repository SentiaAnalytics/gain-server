//@flow weak
import * as emails from './emails'
import nodemailer from 'nodemailer'
import config from '../config'
import {compose} from 'ramda'
import Task from 'data.task'
import aws from 'aws-sdk'

let transporter = nodemailer.createTransport({
  SES: new aws.SES({
      apiVersion: '2010-12-01'
  })
});

const sendMail = x => transporter.sendMail(x)


export const sendTestdriveConfirmation = (testdrive, token) => sendMail(emails.testdriveConfirmation(testdrive, token))
export const sendResetPassword = (user, token) => sendMail(emails.resetPassword(user, token))
