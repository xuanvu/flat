'use strict';

var _sw = require('swagger-node-express');

exports.jsonResponse = function (res, sw, body, httpCode) {
  (sw || _sw).setHeaders(res);
  res.send(httpCode || 200, JSON.stringify(body));
};

exports.stringResponse = function (res, sw, body, httpCode) {
  (sw || _sw).setHeaders(res);
  res.send(httpCode || 200, body);
};

exports.errorResponse = function (res, sw, body, errorCode) {
  (sw || _sw).stopWithError(
    res, {'description': body || 'Bad request', 'code': errorCode || 400}
  );
};