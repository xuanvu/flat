'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    request = require('supertest'),
    flat = require('../../common/app'),
    utils = require('../../common/utils');

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
        .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.fr' })
        .expect(200)
        .end(function (err, res) {
          if (err) throw err;
          schema.models.User.findOne({ where: { username: 'myUsername' } }, function (err, user) {
            if (err) throw err;
            assert.equal(user.username, 'myUsername');
            assert.equal(user.email, 'user@domain.fr');
            done();
          });
        });
    });

    it('should return a bad request', function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send('1{}')
        .expect(400)
        .end(done);
    });

    it('should return a bad username', function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: '.', password: 'myPassword', email: 'user@domain.fr' })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description.username.msg, 'Use only alphanumeric characters');
          done();
        });
    });

    it('should return a bad password', function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: 'myUsername', password: '42', email: 'user@domain.fr' })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description.password.msg, '6 to 50 characters required');
          done();
        });
    });

    it('should return a bad email', function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: 'myUsername', password: 'myPassword', email: 'user@@domain.fr' })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description.email.msg, 'Valid email is required');
          done();
        });
    });

    it('should return already used email', function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.fr' })
        .expect(200)
        .end(function (err, res) {
          request(app)
            .post('/api/auth.json/signup')
            .send({ username: 'myUsername2', password: 'myPassword', email: 'user@domain.fr' })
            .expect(400)
            .end(function (err, res) {
              assert.ifError(err);
              assert.equal(res.body.description, 'Your username or e-mail is already used.');
              done();
            });
        });
    });

    it('should return already used username', function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.fr' })
        .expect(200)
        .end(function (err, res) {
          request(app)
            .post('/api/auth.json/signup')
            .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.com' })
            .expect(400)
            .end(function (err, res) {
              assert.ifError(err);
              assert.equal(res.body.description, 'Your username or e-mail is already used.');
              done();
            });
        });
    });
  });

  describe('POST /api/auth.{format}/signin', function () {
    beforeEach(function (done) {
      request(app)
        .post('/api/auth.json/signup')
        .send({ username: 'myUsername', password: 'myPassword', email: 'user@domain.fr' })
        .expect(200)
        .end(done);
    });

    it('should signin', function (done) {
      request(app)
        .post('/api/auth.json/signin')
        .send({ username: 'myUsername', password: 'myPassword' })
        .expect(200)
        .expect('Set-Cookie', /flat.sid=s%3A/)
        .end(done);
    });

    it('should return that a username is required', function (done) {
      request(app)
        .post('/api/auth.json/signin')
        .send({ password: 'myPassword' })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description.username.msg, 'Required');
          done();
        });
    });

    it('should return that a password is required', function (done) {
      request(app)
        .post('/api/auth.json/signin')
        .send({ username: 'myUsername' })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description.password.msg, 'Required');
          done();
        });
    });

    it('should return bad authenticaion', function (done) {
      request(app)
        .post('/api/auth.json/signin')
        .send({ username: 'myUsername', password: 'myPassworde' })
        .expect(400)
        .end(function (err, res) {
          assert.ifError(err);
          assert.equal(res.body.description, 'Error when authenticating, check your credentials.');
          done();
        });
    });
  });

  describe('POST /api/auth.{format}/logout', function () {
    it('should always return ok', function (done) {
      request(app)
        .post('/api/auth.json/logout')
        .expect(200)
        .end(done);
    });
  });
});