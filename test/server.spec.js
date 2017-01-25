import request from 'supertest'
import config from 'config'
import path from 'path'
import app from '../src/server'
import S3rver from 's3rver';
import fs from 'fs-extra'

import AWS from 'aws-sdk'

describe('server', () => {

  describe('/ncg/userid', () => {

    const s3Dir = 'tmp/s3'
    const Bucket = 'sentiatestDrive'
    let client;
    let s3rver;

    before(function (done) {

      fs.removeSync(s3Dir)
      fs.mkdirpSync(s3Dir)

      s3rver = new S3rver({
        port: 4569,
        hostname: 'localhost',
        silent: false,
        directory: s3Dir
      }).run(function (err, host, port) {
        if(err) {
          return done(err);
        }

        client = new AWS.S3({
          endpoint: 'http://localhost:4569',
          region: 'eu-west-1',
          accessKeyId: 'blah',
          secretAccessKey: 'blah'
        });

        client.createBucket({Bucket}, (err, data) => {
          if(err) done(err)
          done()
        });

      });
    });

    after(function (done) {
      fs.removeSync(s3Dir);
      s3rver.close(done)
    });

    it('should upload a licence to s3', () => {

      return request(app)
        .post('/ncg/userid/')
        .attach('licence', path.resolve('test/fixtures/licence.png'))
        .then(res => {
          const Key = res.body.url.replace(/https:.*\.s3\.amazonaws\.com\//, '')
          return client
            .getObject({Bucket, Key})
            .promise()
        })
    });

  });
});