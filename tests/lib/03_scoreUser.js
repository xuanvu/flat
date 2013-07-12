'use strict';

process.env.NODE_ENV = 'test';
var assert = require('assert'),
    config = require('config'),
    async = require('async'),
    fse = require('fs-extra'),
    uuid = require('node-uuid'),
    flat = require('../../common/app'),
    utils = require('../../common/utils'),
    scoreUser = require('../../lib/scoreUser');

describe('lib/scoreUser', function () {
  var uid1, uid2, score1, score2, collabId;

  before(function (done) {
    async.waterfall([
      function (callback) {
        var db = config.dbs['db_' + (process.env.DB || config.db.type || 'couchdb')];
        global.schema = utils.getSchema(db, callback);
      },
      function (callback) {
        schema.models.User.destroyAll(callback);
      },
      function (callback) {
        var user1 = new schema.models.User();
        user1.username = 'user1';
        user1.email = 'user1@example.com';
        user1.password = '42';
        user1.save(callback);
      },
      function (user1, callback) {
        uid1 = user1.id;
        var user2 = new schema.models.User();
        user2.username = 'user2';
        user2.email = 'user2@example.com';
        user2.password = '42';
        user2.save(callback);
      },
      function (user2, callback) {
        uid2 = user2.id;
        var scoredb = new schema.models.Score();
        scoredb.sid = uuid.v4();
        scoredb.title = 'My public score';
        scoredb.public = true;
        scoredb.user(uid2);
        scoredb.save(callback);
      },
      function (res, callback) {
        score1 = res.id;
        var scoredb = new schema.models.Score();
        scoredb.sid = uuid.v4();
        scoredb.title = 'My private score';
        scoredb.public = false;
        scoredb.user(uid2);
        scoredb.save(callback);
      },
      function (res, callback) {
        score2 = res.id;
        callback();
      }
    ], done);
  });

  after(function (done) {
    async.waterfall([
      function (callback) {
        schema.models.Score.destroyAll(callback);
      },
      function (callback) {
        schema.models.User.destroyAll(callback);
      },
      function (callback) {
        schema.models.ScoreCollaborator.destroyAll(callback);
      }
    ], done);
  });

  it('should return that the score owner has all the rights', function (done) {
    scoreUser.getRights(score1, uid2, function (err, rights) {
      assert.ifError(err);
      assert.equal(rights, scoreUser.ADMIN | scoreUser.WRITE | scoreUser.READ);
      done();
    });
  });

  it('should return that the score owner can admin', function (done) {
    scoreUser.canAdmin(score1, uid2, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that the score owner can write', function (done) {
    scoreUser.canWrite(score1, uid2, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that the score owner can read', function (done) {
    scoreUser.canRead(score1, uid2, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that any user can not admin', function (done) {
    scoreUser.canAdmin(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should return that any user can not write', function (done) {
    scoreUser.canWrite(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should return that any user can read (public score)', function (done) {
    scoreUser.canRead(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that any user can not read (private score)', function (done) {
    scoreUser.canRead(score2, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should return only the owner in the collaborators', function (done) {
    scoreUser.getCollaborators(score1, uid2, function (err, collaborators) {
      assert.ifError(err);
      assert.equal(collaborators.length, 1);
      assert.equal(collaborators[0].userId, uid2);
      assert.ok(collaborators[0].aclWrite);
      assert.ok(collaborators[0].aclAdmin);
      done();
    });
  });

  it('should fail since the user does not have read rights', function (done) {
    scoreUser.getCollaborators(score2, uid1, function (err, collaborators) {
      assert.ok(err);
      assert.equal(err, "You don't have read rights of this score");
      assert.equal(collaborators, 403);
      done();
    });
  });

  it('should add read rights to a user', function (done) {
    scoreUser.addCollaborator(score2, uid2, uid1, false, false, function (err, collab) {
      assert.ifError(err);
      assert.ok(collab.id);
      assert.equal(collab.scoreId, score2);
      assert.equal(collab.userId, uid1);
      assert.ok(!collab.aclWrite);
      assert.ok(!collab.aclAdmin);
      collabId = collab.id;
      done();
    });
  });

  it('should return only the owner in the collaborators', function (done) {
    scoreUser.getCollaborators(score1, uid1, function (err, collaborators) {
      assert.ifError(err);
      assert.equal(collaborators.length, 1);
      assert.equal(collaborators[0].userId, uid2);
      assert.ok(collaborators[0].aclWrite);
      assert.ok(collaborators[0].aclAdmin);
      done();
    });
  });

  it('should return that collaborator can read', function (done) {
    scoreUser.canRead(score2, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that collaborator can not write', function (done) {
    scoreUser.canWrite(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should return that collaborator can not admin', function (done) {
    scoreUser.canAdmin(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should add write rights to a user', function (done) {
    scoreUser.addCollaborator(score1, uid2, uid1, true, false, function (err, collab) {
      assert.ifError(err);
      assert.ok(collab);
      assert.equal(collab.scoreId, score1);
      assert.equal(collab.userId, uid1);
      assert.ok(collab.aclWrite);
      assert.ok(!collab.aclAdmin);
      collabId = collab.id;
      done();
    });
  });

  it('should return that collaborator can read', function (done) {
    scoreUser.canWrite(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that collaborator can write', function (done) {
    scoreUser.canWrite(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that collaborator can not admin', function (done) {
    scoreUser.canAdmin(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should fail to add collaborator since the user does not have admin rights', function (done) {
    scoreUser.addCollaborator(score1, uid1, uid1, true, true, function (err, collab) {
      assert.ok(err);
      assert.equal(err, "You don't have administration rights of this score");
      assert.equal(collab, 403);
      done();
    });
  });

  it('should modify collaborator to add admin rights', function (done) {
    scoreUser.addCollaborator(score1, uid2, uid1, true, true, function (err, collab) {
      assert.ifError(err);
      assert.ok(collab.id);
      assert.equal(collab.id, collabId);
      assert.equal(collab.scoreId, score1);
      assert.equal(collab.userId, uid1);
      assert.ok(collab.aclWrite);
      assert.ok(collab.aclAdmin);
      done();
    });
  });

  it('should return that collaborator can read', function (done) {
    scoreUser.canRead(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });


  it('should return that collaborator can write', function (done) {
    scoreUser.canWrite(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return that collaborator can admin', function (done) {
    scoreUser.canAdmin(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });

  it('should return the collaborators', function (done) {
    scoreUser.getCollaborators(score1, uid2, function (err, collaborators) {
      assert.ifError(err);
      assert.equal(collaborators.length, 2);
      assert.equal(collaborators[0].userId, uid2);
      assert.ok(collaborators[0].aclWrite);
      assert.ok(collaborators[0].aclAdmin);
      assert.equal(collaborators[1].userId, uid1);
      assert.ok(collaborators[1].aclWrite);
      assert.ok(collaborators[1].aclAdmin);
      done();
    });
  });

  it('should remove the collaborator', function (done) {
    scoreUser.removeCollaborator(score1, uid2, uid1, function (err, collaborators) {
      assert.ifError(err);
      done();
    });
  });

  it('should return that old collaborator can read', function (done) {
    scoreUser.canRead(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(can);
      done();
    });
  });


  it('should return that old collaborator can not write', function (done) {
    scoreUser.canWrite(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should return that old collaborator can not admin', function (done) {
    scoreUser.canAdmin(score1, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should fail to remove collaborator since user does not have admin rights', function (done) {
    scoreUser.removeCollaborator(score2, uid1, uid1, function (err, collab) {
      assert.ok(err);
      assert.equal(err, "You don't have administration rights of this score");
      assert.equal(collab, 403);
      done();
    });
  });

  it('should remove the collaborator', function (done) {
    scoreUser.removeCollaborator(score2, uid2, uid1, function (err, collaborators) {
      assert.ifError(err);
      done();
    });
  });

  it('should return that old collaborator can not read', function (done) {
    scoreUser.canRead(score2, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });


  it('should return that old collaborator can not write', function (done) {
    scoreUser.canWrite(score2, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });

  it('should return that old collaborator can not admin', function (done) {
    scoreUser.canAdmin(score2, uid1, function (err, can) {
      assert.ifError(err);
      assert.ok(!can);
      done();
    });
  });
});
