import request from 'supertest'
import config from '../src/config'
import path from 'path'
import app from '../src/server'
import S3rver from 's3rver';
import dynalite from 'dynalite'
import fs from 'fs-extra'
import {assert} from 'chai'

import AWS from 'aws-sdk'

const dynamodb = new AWS.DynamoDB(config.aws.dynamodb)
const docclient = new AWS.DynamoDB.DocumentClient(config.aws.dynamodb)

const getFromDb = tableName => keys => {
  return docclient.get({
                         TableName: tableName,
                         Key: {
                           ...keys
                         }
                       }).promise();
}

describe.skip('server', () => {

  describe('/ncg/userid', () => {

    const s3Dir = path.resolve('test/tmp')
    const Bucket = 'sentiatestDrive'
    let client;
    let s3rver;

    before(function (done) {

      fs.removeSync(s3Dir)
      fs.mkdirpSync(s3Dir)

      s3rver = new S3rver({
        port: 4569,
        hostname: 'localhost',
        silent: true,
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

  describe('/userid', function () {

    const dbDir = path.resolve('test/mydb')
    const dynaliteServer = dynalite({path: dbDir, createTableMs: 0});

    const getTestDrive = getFromDb(config.userid.tableName)

    before(done => {
      fs.removeSync(dbDir);
      dynaliteServer.listen(4567, function (err) {
        if (err) done(err);

        dynamodb.createTable({
                               TableName: config.userid.tableName,
                               ProvisionedThroughput: {
                                 ReadCapacityUnits: 10,
                                 WriteCapacityUnits: 10
                               },
                               AttributeDefinitions: [
                                 {
                                   AttributeName: "dealership",
                                   AttributeType: "S"
                                 },
                                 {
                                   AttributeName: "date",
                                   AttributeType: "S"
                                 }
                               ],
                               KeySchema: [
                                 {
                                   AttributeName: "dealership",
                                   KeyType: "HASH"
                                 },
                                 {
                                   AttributeName: "date",
                                   KeyType: "RANGE"
                                 }
                               ]
                             }, done);
      });
    });

    it('should insert data into dynamodb', (done) => {
      const driver = {
        cpr: 'cpr',
          firstName: 'andreas',
          lastName: 'moeller',
          email: 'test@email.com',
          phone: '1234567',
          addressLine1: '123 fake street',
          addressLine2: 'faketown',
          postcode: 'DK-1401',
          city: 'copenhagen',
          country: 'denmark'
      }

      const car = {
        make: 'BMW',
        model: '323',
        licensePlate: '123dh234'
      }

      const consent = {
        base64Signature: '644EFFBLAH'
      }

      const body = {
        user: 'user1',
        date: '2017-04-09T01:00:00+01:00',
        dealership: 'dealership',
        driver,
        car,
        consent
      };

      const expected = {
        user: body.user,
        date: body.date,
        dealership: body.dealership,
        ...driver,
        ...car,
        ...consent
      }

      request(app)
        .put('/userid')
        .send(body)
        .expect(200)
        .then(res => {
          getTestDrive({dealership: res.body.dealership, date: res.body.date})
            .then(actual => {
              assert.deepEqual(actual.Item, expected)
              done()
            })
            .catch(done)
        })
    })

    after(done => {
      dynaliteServer.close(() => {
        fs.removeSync(dbDir);
        done();
      });
    });

  })
});
