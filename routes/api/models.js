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
  UserPublicDetails: {
    id: 'UserPublicDetails',
    properties: {
      username: { type: 'string' },
      email_md5: { type: 'string' },
      registrationDate: { type: 'string' },
      id: { type: 'string' }
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
      'public': {
        type: 'boolean',
        description: 'True if the score is public'
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
  },
  ScoreDb: {
    id: 'ScoreDb',
    properties: {
      sid: { type: 'string', description: 'The Score identifier' },
      title: { type: 'string', description: 'The title of the score' },
      public: { type: 'boolean', description: 'True if the score is public' },
      score: { type: 'string', description: 'The score JSON' }
    }
  },
  ScoreRevisionAuthor: {
    id: 'ScoreRevisionAuthor',
    properties: {
      email: { type: 'string', properties: 'The author email' },
      name: { type: 'string', properties: 'The author name' }
    }
  },
  ScoreRevision: {
    id: 'ScoreRevision',
    properties: {
      id: { type: 'string', description: 'The revision identifier' },
      author: { type: 'ScoreRevisionAuthor', description: 'The revision author' },
      message: { type: 'string', description: 'The revision message' },
      short_message: { type: 'string', description: 'The revision short message' }
    }
  },
  ScoreDetails: {
    id: 'ScoreDetails',
    properties: {
      properties: { type: 'ScoreDb', description: 'The score properties' },
      revisions: { type: 'ScoreRevision', description: 'The score revisions' }
    }
  }
};