//@flow weak
import Task from 'data.task'
import fetch from 'node-fetch'

export default html =>
  new Task((reject, resolve) =>
    fetch('http://localhost:8088/pdf',{
      method: 'POST',
      body: html,
      headers: {
        'content-type': 'text/plain'
      }
    })
    .then(resolve, reject)
  ).map(x => x.body)
