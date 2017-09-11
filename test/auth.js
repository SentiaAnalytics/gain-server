import test from 'tape'
import gql from 'graphql-tag';
import {createClient} from './util'
let authQuery = gql`
query Auth($email:String!, $password:String!) {
  authenticate(email: $email, password:$password) {
    token,
    user {
      id,
      email
    }
  }
}`

test('authenticate should return a session token and a user', async t => {
  t.plan(2)
  let client = await createClient()
  let variables = {email: "andreas@sentia.io", password: "password"}
  let {data} = await client.query({query:authQuery, variables})
  t.assert(data.authenticate.token)
  t.equal(data.authenticate.user.email, "andreas@sentia.io")
})
