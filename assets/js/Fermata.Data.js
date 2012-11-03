var Fermata = Fermata || {};

Fermata.Data = function(score) {
  this.score = score || {};
  this.render = []; 

  console.log(score);
};

Fermata.Data.prototype = {
  getScore: function() { return this.score; },
};