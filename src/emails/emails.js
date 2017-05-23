import {createElement as h} from 'react'
import {renderToString} from 'react-dom/server'



const TestdriveConfirmation= testdrive =>
  <div>
    <h1> hello world</h1>
  </div>

export const testdriveConfirmation = testdrive =>
  ({
    from: 'noreply <noreply@gain.ai>',
    to: testdrive.email,
    subject: 'Testdrive confirmation',
    text: 'testdrive',
    html: renderToString(<TestdriveConfirmation testdrive={testdrive}/>)
  })
