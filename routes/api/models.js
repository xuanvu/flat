exports.models = {
  'AuthSignup': {
    'id': 'AuthSignup',
    'properties': {
      'username': { type: 'string' },
      'email': { type: 'string' },
      'password': { type: 'string' }
    }
  },
  'AuthSignin': {
    'id': 'AuthSignin',
    'properties': {
      'username': { type: 'string' },
      'password': { type: 'string' }
    }
  }
};