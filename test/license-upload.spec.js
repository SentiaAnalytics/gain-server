import licenceUpload from '../src/licence-upload'
import {assert} from 'chai'
import sinon from 'sinon'
import path from 'path'
import type {S3Record} from './model'
import Task from 'data.task'

describe('licence', () => {

  it('should return the s3 bucket url', done => {
    const s3PutStub = sinon.stub().returns(Task.of('ignored'));

    const reqStub = {
      file: {path: path.resolve('test/fixtures/licence.png')}
    }

    const resSendStub = sinon.stub().returns(Task.of('ignored'));
    const resStatusStub = sinon.stub().returns({send: resSendStub});

    const resStub = {
      status: resStatusStub
    }

    licenceUpload(s3PutStub, 'myUuid')(reqStub, resStub, () => {
      sinon.assert.calledWith(resStatusStub, 200)
      sinon.assert.calledWith(resSendStub, {url: 'https://sentiatestDrive.s3.amazonaws.com/test/userid/myUuid'})
      done()
    })

  })

})
