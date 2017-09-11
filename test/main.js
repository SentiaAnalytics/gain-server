import test from 'tape'
import gql from 'graphql-tag';
import {createClient} from './util'


let dealershipQuery = gql`
query Dealership {
  session {
    dealership {
      id,
      name
    }
  }
}`

test('dealership', async t => {
  t.plan(1)

  let client = await createClient({authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdXNlciI6IjkyODAyZDdmLTAwZDAtNGU0Zi05YTg1LTkwMzU2ODE3ZWZhMiIsIl9kZWFsZXJzaGlwIjoiNjRiMWZlMWQtMmQzZC00MWQzLWJkZjktMzZhMTZmYjkwNzcyIiwiaWF0IjoxNTAzNjcxNzMzLCJleHAiOjE1MDQ1MzU3MzN9.D2NjrqWibh_cCpDXUf6x89KtWJSyzAVVi1BJAzx4HNI"})
  let {data} = await client.query({query:dealershipQuery})

  t.equal(data.session.dealership.name, "Andreas")
  
})