//@flow
import twilio from 'twilio'
import config from './config'

const messagingServiceSid = config.sms.messagingServiceSid
const client = twilio(config.sms.accountSid, config.sms.authToken);

export const send = (to:string, body:string) =>
  config.sms.sendSms ? client.messages.create({ messagingServiceSid, to, body})
    : Promise.resolve('Sent fake sms')
