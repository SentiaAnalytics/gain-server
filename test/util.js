import 'babel-polyfill'
global.fetch = require('node-fetch')
import ApolloClient, { createNetworkInterface } from 'apollo-client';

export const createClient = (headers={}) => {
  return new ApolloClient({
    networkInterface: createNetworkInterface({
      uri: 'http://localhost:8080/graphql',
      opts: {
        headers
      }
    }),
  });
}