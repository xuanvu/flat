exports.models = {
  AuthSignup: {
    id: 'AuthSignup',
    properties: {
      username: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' }
    }
  },
  AuthSignin: {
    id: 'AuthSignin',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    }
  },
  ScoreInstrument: {
    id: 'ScoreInstrument',
    group: { type: 'string' },
    instrument: { type: 'string'}
  },
  ScoreCreation: {
    id: 'ScoreCreation',
    properties: {
      title: {
        type: 'string',
        description: 'The title of the score'
      },
      instruments: {
        type: 'Array',
        description: 'The instruments parts of the score',
        items: {
          $ref: 'ScoreInstrument'
        }
      },
      fifths: {
        type: 'int',
        description: 'The key signature, from -7 (flat) to 7 (sharp).',
        allowableValues: {
          valueType: 'RANGE',
          min: -7,
          max: 7
        }
      },
      beats: {
        type: 'int',
        description: 'The beat of the score (equivalent to "beats" in MusicXML)'
      },
      beatType: {
        type: 'int',
        description: 'The beat type of the score (equivalent to "beat-type" in MusicXML)'
      }
    }
  }
};