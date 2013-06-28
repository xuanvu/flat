exports.jsonResponse = function (res, sw, body, httpCode) {
  sw.setHeaders(res);
  res.send(httpCode || 200, JSON.stringify(body));
};

exports.stringResponse = function (res, sw, body, httpCode) {
  sw.setHeaders(res);
  res.send(httpCode || 200, body);
};

exports.errorResponse = function (res, sw, body, errorCode) {
  sw.stopWithError(res, {'description': body || 'Bad request', 'code': errorCode || 400});
};