//@flow weak
import React from 'react'
import D from 'date-fp'
import {renderToString} from 'react-dom/server'

const TestdriveConfirmation = ({testdrive}, token)=>
  <div>
    <h1>Køreseddel</h1>
    <p>{D.format('DD/MM/YYYY', new Date(testdrive.date))}</p>
    <a href={`https://gain.ai:8080/testdrives/${token}`}>Se køreseddel</a>
  </div>

export const testdriveConfirmation = (testdrive, token) =>
  ({
    from: 'noreply <noreply@gain.ai>',
    to: testdrive.email,
    subject: 'Køreseddel',
    text: `https://gain.ai:8080/testdrives/${token}`,
    html: renderToString(<TestdriveConfirmation testdrive={testdrive} token={token}/>),
  })
