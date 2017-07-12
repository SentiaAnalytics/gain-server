//@flow
import twilio from 'twilio'
// Twilio Credentials 
const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_TOKEN
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE
 
//require the Twilio module and create a REST client 
const client = twilio(accountSid, authToken); 
 
export const send = (to:string, body:string) =>
  client.messages.create({ messagingServiceSid, to, body})