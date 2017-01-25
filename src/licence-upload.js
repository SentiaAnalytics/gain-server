// @flow

import fs from 'fs'
import type {S3Record} from './model'
import config from 'config'

export default function(put, uuid) {
  return (req, res, next) => {
    const s3Params:S3Record = {Bucket: 'sentiatestDrive', Key: `test/userid/${uuid}`, Body: req.file.buffer}
    put(s3Params)
      .fork(e => {
        res.status(401).send(e)
        next(e)
      }, () => {
        res.status(200).send({url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`})
        next()
      })
  }
}