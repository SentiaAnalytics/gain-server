//@flow
import twilio from 'twilio'
import config from './config'

const setup = () => {
  if (config.sms.sendSms) {
    const messagingServiceSid = config.sms.messagingServiceSid
    const client = twilio(config.sms.accountSid, config.sms.authToken);

    return (to:string, body:string) => client.messages.create({ messagingServiceSid, to, body});
  } else {
    return (to:string, body:string) => Promise.resolve('Sent fake sms')
  }
}

export const send = setup()