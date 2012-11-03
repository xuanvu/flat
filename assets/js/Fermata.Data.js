var Fermata = Fermata || {};
 
(function () {
  "use strict";

  Fermata.Data = function (score) {
    this.score = score || {};
    this.scoreCache = { parts: null }; // derivated score object for faster access

    // Init new score
    if (this.score['score-partwise'] === undefined) {
      this.score['score-partwise'] = {'version': '3.0', 'part-list': {'score-part': null}};
    }
  };

  Fermata.Data.prototype = {
    // Cache fncs
    cacheParts: function () {
      // Only one part, converting into array of objects
      if (typeof this.score['score-partwise']['part-list']['score-part'] === 'object') {
        this.score['score-partwise']['part-list']['score-part'] = [this.score['score-partwise']['part-list']['score-part']];
      }

      if (typeof this.score['score-partwise'].part === 'object') {
        this.score['score-partwise'].part = [this.score['score-partwise'].part];
      }

      var cur, cached, i;

      // Index with 'part' idx, ids and names
      this.scoreCache.parts = { idx: [], id: {}, name: {} };
      for (i = 0 ; i < this.score['score-partwise']['part-list']['score-part'].length ; ++i) {
        cur = this.score['score-partwise']['part-list']['score-part'][i];
        cached = {id: cur.id, name: cur['part-name'].$t, measure: null};

        this.scoreCache.parts.id[cur.id] = cached;
        this.scoreCache.parts.name[cur['part-name'].$t] = cached;
        this.scoreCache.parts.idx.push(cached);
      }

      // Cache fast access to mesures
      for (i  = 0 ; i < this.score['score-partwise'].part.length ; ++i) {
        cur = this.score['score-partwise'].part[i];
        this.scoreCache.parts.id[cur.id].measure = cur.measure;
      }

      return this.scoreCache.parts;
    },

    // Getters
    getScorePartWise: function () { return this.score['score-partwise']; },
    getParts: function () { return this.scoreCache.parts || this.cacheParts(); }
  };

}).call(this);