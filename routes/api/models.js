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
      picture: { type: 'string' },
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
  ScoreImport: {
    id: 'ScoreImport',
    properties: {
      title: {
        type: 'string',
        description: 'The (optional) title of the score'
      },
      'public': {
        type: 'boolean',
        description: 'True if the score is public'
      },
      'score': {
        type: 'string',
        description: 'The content of the score'
      }
    }
  },
  ScoreSave: {
    id: 'ScoreSave',
    properties: {
      'type': {
        type: 'string',
        description: 'The save type',
        allowableValues: {
          valueType: 'LIST',
          values: [
            'json'
          ],
        }
      },
      'score': {
        type: 'string',
        description: 'The content of the score'
      },
      'message': {
        type: 'string',
        description: 'The save message (optional)'
      }
    }
  },
  ScoreSaveResult: {
    id: 'ScoreSaveResult',
    properties: {
      'revision': {
        type: 'string',
        description: 'The new revision identifier'
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
      parents: { type: 'List[String]', description: 'The revisions parents' },
      author: { type: 'ScoreRevisionAuthor', description: 'The revision author' },
      message: { type: 'string', description: 'The revision message' },
      short_message: { type: 'string', description: 'The revision short message' },
      authored_date: { type: 'string', description: 'The authored date' }
    }
  },
  ScoreDetails: {
    id: 'ScoreDetails',
    properties: {
      properties: { type: 'ScoreDb', description: 'The score properties' },
      revisions: { type: 'ScoreRevision', description: 'The score revisions' }
    }
  },
  ScoreCollaborator: {
    id: 'ScoreCollaborator',
    properties: {
      id: { type: 'string', description: 'The user identifier' },
      aclWrite: { type: 'boolean', description: 'True if the user may edit' },
      aclAdmin: { type: 'boolean', description: 'True if the user may administrate' }
    }
  },
  CollaboratorRights: {
    id: 'CollaboratorRights',
    properties: {
      aclWrite: { type: 'boolean', description: 'True if the user may edit' },
      aclAdmin: { type: 'boolean', description: 'True if the user may administrate' }
    }
  },
  News: {
    id: 'News',
    properties: {
      id: { type: 'string', description: 'The news identifier' },
      event: { type: 'String', description: 'The event text' },
      parameters: { type: 'String', description: 'A JSON containing the event parameters' },
      date: { type: 'Date', description: 'The publication date' },
      userId: { type: 'string', description: 'The news owner' }
    }
  }
};