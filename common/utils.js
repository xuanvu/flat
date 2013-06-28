'use strict';

var Schema = require('jugglingdb-gierschv').Schema,
    schemas = require('../schemas');

exports.merge = function (a, b) {
  var keys = Object.keys(b);
  for (var i = 0, len = keys.length; i < len; ++i) {
    var key = keys[i];
    a[key] = b[key];
  }
  return a;
};

exports.clone = function (obj) {
  if (null === obj || "object" !== typeof obj) {
    return obj;
  }

  var copy = {};
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = exports.clone(obj[attr]);
    }
  }

  return copy;
};

exports.getSchema = function (configDB, cb) {
  var schema = new Schema(configDB.type, {
    url: configDB.settings.url,
    host: configDB.settings.host,
    port: configDB.settings.port,
    database: configDB.settings.database,
    username: configDB.settings.username,
    password: configDB.settings.password,
    // debug: true
  });
  schemas.getSchemas(schema, cb);
  return schema;
};