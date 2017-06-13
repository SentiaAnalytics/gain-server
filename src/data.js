//@flow
import assert from 'assert'

export type SessionId = {
  userId: string,
  token: string
}

export type Credentials = {
  email: string,
  password: string
}
