//@flow weak
import React from 'react'
import D from 'date-fp'
import {createElement as h} from 'react'
import {renderToString} from 'react-dom/server'

const TestdriveConfirmation = ({testdrive})=>
  <div>
    <h1>Testdrive</h1>
    <p>{D.format('DD/MM/YYYY', new Date(testdrive.date))}</p>
    <p>{testdrive.firstname} {testdrive.lastname}</p>
    <p>{testdrive.carBrand} {testdrive.carModel}</p>
  </div>

export const testdriveConfirmation = (testdrive, testdrivePDF) =>
  ({
    from: 'noreply <noreply@gain.ai>',
    to: testdrive.email,
    subject: 'Testdrive confirmation',
    text: 'testdrive',
    html: renderToString(<TestdriveConfirmation testdrive={testdrive}/>),
    attachments: [
      {
        filename: 'testdrive.pdf',
        content: testdrivePDF
      }
    ]
  })
