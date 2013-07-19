![Flat](https://raw.github.com/FlatIO/flat/master/public/img/logo-header.png)

Flat is an Open-source web-based collaborative music score editor.

Tested with Node v0.11 (https://travis-ci.org/FlatIO/flat).
Works on Linux, MacOS and Windows.

[![NPM](https://nodei.co/npm/flat.io.png)](https://nodei.co/npm/flat.io/)

[![Build Status](https://travis-ci.org/FlatIO/flat.png)](https://travis-ci.org/FlatIO/flat)
[![Dependencies](https://david-dm.org/FlatIO/flat.png)](https://david-dm.org/FlatIO/flat)

# Readme Contents

- [Installation](#a1)
- [Project architecture](#a2)
- [REST API specifications](#a3)
- [Database architecture](#a4)
- [Team](#a5)
- [Contributors](#a6)
- [Licence](#a7)

<a name="a1"/>
# Installation

```bash
$ npm install flat.io && cd node_modules/flat.io
$ npm install -g grunt-cli && grunt
```
You can configure the application using the configurations files stored in `/config` ([node-config](https://npmjs.org/package/config)).

<a name="a2"/>
# Project technologies

## Server-side
- [express](http://expressjs.com/): Runs the HTTP server, handles two applications: `/` and `/api` ;
- [node-swagger](https://github.com/wordnik/swagger-node-express): The server-side is mainly based on a REST API based on Node Swagger (see [REST API specifications](#a3)) ;
- [jugglingdb](https://github.com/1602/jugglingdb): The database API, tested with CouchDB and MySQL ;
- [passport](http://passportjs.org/): Authentication ;
- [node-git](https://github.com/christkv/node-git): Versioning of the music scores ;
- [flat-musicjson](http://github.com/FlatIO/musicjson): The conversion library from [MusicXML](http://www.musicxml.com/) to a JSON format and inverse ;
- [flat-fermata](https://npmjs.org/FlatIO/fermata): The render library from a MusicJSON format using [Vexflow](http://www.vexflow.com/).

## Client side
The client side is designed into three [AngularJS](http://angularjs.org/) applications: the authentication, the dashboard and the editor.

The editor uses [fermata](https://npmjs.org/FlatIO/fermata) too, the library code is shared between the client and the server (designed to render PDF scores in the future).

<a name="a3"/>
# REST API

*Will be added soon, you can show the specifications using a [swagger-ui](https://github.com/wordnik/swagger-ui) (e.g. [dev.flat.io](http://dev.flat.io)).*

<a name="a4"/>
# Database architecture

Models used in the project (see [/schemas/index.js](https://github.com/FlatIO/flat/blob/master/schemas/index.js) for more details).

### User

- `username`
- `email`
- `password`: The password in bcrypt
- `registrationDate`

### Follow

- `follower`
- `followed`
- `date`

### Score

- `sid`: The storage identitifer (the git repository name)
- `title`: The score title
- `public`: True if the score is public
- `userId`

### ScoreCollaborator
The different collaborators of a score.

- `aclWrite`: True if the user has write rights
- `aclAdmin`: True if the user has admin rights
- `scoreId`
- `userId`

### News
The activity of the users.

- `event`: The event name (a i18next key)
- `parameters`: A JSON of the parameters of the news string (e.g. a title, score, user, ...)
- `date`
- `userId`

### NewsFeed
The news feed of the users.

- `newsId`
- `userId`

<a name="a5"/>
# The team
<img align="right" src="http://eip.epitech.eu/2014/flat/assets/img/eip.png" />
Flat is MSc project of a french CS school, [Epitech](http://www.epitech.eu/) and is an [Epitech Innovative Project](https://eip.epitech.eu). Here is our team:

- @gierschv : Project manager and lead developer ;
- @rannoup : Database Architect, developper ;
- @cyrilcoutelier: Fermata / editor developer
- @corentingurtner: Fermata / editor developer
- @vbouchaud: developer

<a name="a6">
# Contributors

<a name="a6">
# License

Flat is freely distributable under the terms of the GPLv3 license.

```
Flat
Copyright (C) 2013 Flat team <contact@flat.io>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```