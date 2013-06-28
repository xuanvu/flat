'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    flat = require('../../common/app'),
    utils = require('../../common/utils');


describe('API /account', function () {
  var uid, cookies;

  before(function () {
    global.schema = utils.getSchema(config.db);
    global.app = flat.getApp();
  });

  after(function (done) {
    schema.models.User.destroyAll(done);
  });

  beforeEach(function (done) {
    schema.models.User.destroyAll(function (err, res) {
      assert.ifError(err);
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.fr' })
        .end(function (err, res) {
          uid = res.body.id;
          assert.ifError(err);
          request(app)
            .post('/api/auth.json/signin')
            .send({ username: 'myUsername', password: 'myPassword' })
            .end(function (err, res) {
              assert.ifError(err);
              cookies = res.headers['set-cookie'][0].split(';')[0];
              done();
            });
        });
    });
  });

  describe('GET /account.{format}', function () {
    it('should return account details', function (done) {
      var rq = request(app).get('/api/account.json');
      rq.cookies = cookies;
      rq.expect(200)
        .end(function (err, res) {
          assert.equal(res.body.id, uid);
          assert.equal(res.body.email, 'user@domain.fr');
          assert.equal(res.body.email_md5, '1eac591a9df93e178ed48f5a2c65fcf3');
          assert.equal(res.body.username, 'myUsername');
          done();
        });
    });

    it('should return return a forbidden', function (done) {
      request(app)
        .get('/api/account.json')
        .expect(403)
        .end(done);
    });
  });
});