'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    async = require('async'),
    flat = require('../../common/app'),
    utils = require('../../common/utils'),
    tpa = require('../../routes/tpa');

describe('API /user', function () {
  var uid;

  before(function (done) {
    async.waterfall([
      function (callback) {
        var db = config.dbs['db_' + (process.env.DB || config.db.type || 'couchdb')];
        global.schema = utils.getSchema(db, callback);
      },
      function (callback) {
        global.app = flat.getApp();
        schema.models.User.destroyAll(callback);
      },
      function (callback) {
        schema.models.News.destroyAll(callback);
      }
    ], done);
  });

  after(function (done) {
    async.waterfall([
      function (callback) {
        schema.models.User.destroyAll(callback);
      },
      function (callback) {
        schema.models.News.destroyAll(callback);
      }
    ], done);
  });

  it('sould create an account using a facebook auth', function (done) {
    var profile = {
      provider: 'facebook',
      id: '42',
      displayName: 'Bob',
      emails: [ { value: '42@42.42' } ],
    };

    async.waterfall([
      async.apply(tpa.providerReturn, null, null, profile),
      function (profile, callback) {
        schema.models.User.findOne({ where: { facebookId: '42' } }, callback);
      },
      function (user, callback) {
        assert.equal(user.username, 42);
        assert.equal(user.email, '42@42.42');
        assert.equal(user.name, 'Bob');
        callback();
      }
    ], done);
  });

  it('sould create an account using a facebook auth', function (done) {
    var profile = {
      provider: 'facebook',
      id: '42',
      displayName: 'Bob',
      emails: [ { value: '42@42.42' } ],
    };

    async.waterfall([
      async.apply(tpa.providerReturn, null, null, profile),
      function (profile, callback) {
        schema.models.User.findOne({ where: { facebookId: '42' } }, callback);
      },
      function (user, callback) {
        assert.equal(user.username, 42);
        assert.equal(user.email, '42@42.42');
        assert.equal(user.name, 'Bob');
        uid = user.id;
        callback();
      }
    ], done);
  });

  it('sould create an account using a google auth and assoc with existing', function (done) {
    var profile = {
      provider: 'google',
      id: '42',
      displayName: 'Bob',
      emails: [ { value: '42@42.42' } ],
    };

    async.waterfall([
      async.apply(tpa.providerReturn, null, null, profile),
      function (profile, callback) {
        schema.models.User.findOne({ where: { googleId: '42' } }, callback);
      },
      function (user, callback) {
        assert.equal(user.username, 42);
        assert.equal(user.email, '42@42.42');
        assert.equal(user.name, 'Bob');
        assert.equal(user.id, uid);
        callback();
      }
    ], done);
  });
});