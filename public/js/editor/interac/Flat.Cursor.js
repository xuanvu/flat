var Flat = Flat || {};

(function() {
  "use strict";

  Flat.Cursor = function (data, ctx) {
    this.curPart = 0;
    this.curMeasure = 0;
    this.curVoice = 0;
    this.curNote = 0;
    this.data = data['score'];
    this.context = ctx;
    this.CurTick = this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote];
    this.draw();
    this.initKeyEvents();
  };

  Flat.Cursor.prototype.initKeyEvents = function() {
    this.charfield = document;
    var _this = this;
    this.charfield.addEventListener("keydown", function(e, element) {
      e = e || window.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
      if (charCode > 0) {
        if (charCode === 74) _this.nextVoice();
        if (charCode === 75) _this.prevVoice();
        if (charCode === 37) _this.cursorLeft();
        if (charCode === 38) _this.cursorUp();
        if (charCode === 39) _this.cursorRight();
        if (charCode === 40) _this.cursorDown();
      }
    }, false);
  };

  Flat.Cursor.prototype.cursorUp = function() {
    this.undraw();
    if (this.curVoice > 0) {
      this.curVoice = this.curVoice - 1;
      while (this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote] === undefined
        && this.curNote > 0) {
        this.curNote = this.curNote - 1;
      }
    }
    else if (this.curVoice == 0 && this.curPart > 0) {
      this.curPart = this.curPart -1;
      this.curVoice = this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'].length -1;
      while (this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote] === undefined
        && this.curNote > 0) {
        this.curNote = this.curNote - 1;
      }
    }
    else {
      console.log("up not available");
    }
    this.draw();
  };

  Flat.Cursor.prototype.cursorDown = function() {
    this.undraw();
    if (this.curVoice < this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'].length -1) {
      this.curVoice = this.curVoice + 1;
    while (this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote] === undefined
        && this.curNote > 0) {
        this.curNote = this.curNote - 1;
      }
    }
    else if (this.curVoice == this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'].length - 1
        && this.curPart < this.data['score-partwise']['part'].length - 1) {
      this.curPart = this.curPart + 1;
      this.curVoice = 0;
      while (this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote] === undefined
        && this.curNote > 0) {
        this.curNote = this.curNote - 1;
      }
    }
    else {
      console.log("cannot go down anymore !");
    }
    this.draw();
  };

  Flat.Cursor.prototype.cursorLeft = function() {
    this.undraw();
    console.log("Cursor left");
    if (this.curNote == 0 && this.curMeasure > 0) {
      this.curMeasure = this.curMeasure - 1;
      this.curNote = this.x_first_tick = this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'].length - 1;
    }
    else if (this.curNote == 0 && this.curMeasure == 0) {
      console.log("can't go back");
      }
    else {
      this.curNote = this.curNote - 1;
    }
    this.draw();
  };

  Flat.Cursor.prototype.cursorRight = function() {
    this.undraw();
    if (this.curNote == this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'].length - 1 &&
      this.curMeasure < this.data['score-partwise']['part'][this.curPart]['measure'].length - 1) {
      this.curMeasure = this.curMeasure + 1;
      this.curNote = 0;
    }
    else if ((this.curNote == this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'].length - 1 &&
      this.curMeasure == this.data['score-partwise']['part'][this.curPart]['measure'].length - 1)) {
      console.log("end of voice")
    }
    else {
      this.curNote = this.curNote +1;
    }
    this.draw();
  };

  Flat.Cursor.prototype.setFocus = function(newPos) {
    this.undraw();
    this.curPart = newPos.nbPart;
    this.curMeasure = newPos.nbMeasure;
    this.curVoice = newPos.nbVoice;
    this.curNote = newPos.nbTick;
    this.draw();
  };

  Flat.Cursor.prototype.nextVoice = function() {
  };

  Flat.Cursor.prototype.prevVoice = function() {
  };
  
  // Flat.Cursor.prototype.getPosition = function() {
  //   return this.pos;
  // };

  Flat.Cursor.prototype.undraw = function() {
    this.CurTick.st.attr({fill: 'black', 'stroke-width': '0'});
  };

  Flat.Cursor.prototype.draw = function() {
    console.log(this.CurTick);
    this.CurTick = this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote];
    this.CurTick.st.attr({fill: 'green', 'stroke-width': '2.5'});
  };
}).call(this);