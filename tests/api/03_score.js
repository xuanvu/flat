'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    fse = require('fs-extra'),
    flat = require('../../common/app'),
    utils = require('../../common/utils'),
    api = require('../../routes/api');


describe('API /score', function () {
  var schema, app, cookies;

  before(function (done) {
    schema = utils.getSchema(config.db);
    app = flat.getApp(schema);
    schema.models.User.destroyAll(function (err, res) {
      if (err) throw err;
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.fr' })
        .end(function (err, res) {
          if (err) throw err;
          request(app)
            .post('/api/auth.json/signin')
            .send({ username: 'myUsername', password: 'myPassword' })
            .end(function (err, res) {
              if (err) throw err;
              cookies = res.headers['set-cookie'][0].split(';')[0];
              done();
            });
        });
    });
  });

  beforeEach(function (done) {
    schema.models.Score.destroyAll(done);
  });

  // after(function (done) {
  //   fse.remove(config.flat.score_storage, done);
  // });

  describe('POST /score.{format}', function () {
    it('should return account details', function (done) {
      var rq = request(app).post('/api/score.json');
      rq.cookies = cookies;
      rq.send({
          title: 'Für Elise',
          instruments: [{ group: 'keyboards', instrument: 'piano' }],
          fifths: 0,
          beats: 3,
          beatType: 8
        })
        .expect(200)
        .end(function (err, res) {
          assert.ok(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(res.body.sid));
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