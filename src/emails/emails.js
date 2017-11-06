//@flow weak
import React from 'react'
import D from 'date-fp'
import {renderToString} from 'react-dom/server'

const log =(value) => {
  console.log(value);
  return value;
}

const TestdriveConfirmation = ({testdrive, token})=>
  <div>
    <h1>Køreseddel</h1>
    <p>{D.format('DD/MM/YYYY', new Date(testdrive.date))}</p>
    <a href={`https://gain.ai:8080/testdrives/${token}`}>Se køreseddel</a>
  </div>

const ResetPassword = ({user, token})=>
<div>
  <h1>Nulstil Password</h1>
  <p> Vi har modtaget en forespørgsel om at nulstille dit password. Hvis du ikke har anmodet om at nulstille dit password kontakt da venligst kundeservice på <a href="mailto:info@gain.ai">info@gain.ai</a></p>
  <a href={`https://gain.ai:8080/resetpassword/${token}`}>Nulstil Password</a>
</div>


export const testdriveConfirmation = (testdrive, token) =>
  ({
    from: 'noreply <noreply@gain.ai>',
    to: testdrive.email,
    subject: 'Køreseddel',
    text: `https://gain.ai:8080/testdrives/${token}`,
    html: renderToString(<TestdriveConfirmation testdrive={testdrive} token={token}/>),
  })

  export const resetPassword = (user, token) =>
    log({
      from: 'noreply <noreply@gain.ai>',
      to: user.email,
      subject: 'Glemt Password?',
      text: `https://gain.ai:8080/testdrives/${token}`,
      html: renderToString(<ResetPassword user={user} token={token}/>),
    })