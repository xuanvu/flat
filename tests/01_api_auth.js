'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    flat = require('../common/app'),
    utils = require('../common/utils'),
    api = require('../routes/api');

describe('API /auth', function () {
  var schema, app;

  before(function () {
    schema = utils.getSchema(config.db);
    app = flat.getApp(schema);
  });

  beforeEach(function (done) {
    schema.models.User.destroyAll(done);
  });

  describe('POST /api/auth.{format}/signup', function () {
    it('should create an account', function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send({
          username: 'myUsername',
          password: 'myPassword',
          email: 'user@domain.fr'
        })
        .expect(200)
        .end(function (err, res) {
          assert.ok(!err, res.body.description);
          done();
        });
    });
  });
});