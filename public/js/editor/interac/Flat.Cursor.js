var Flat = Flat || {};

(function() {
  "use strict";

  Flat.Cursor = function (data, ctx, socket, color) {
    this.curPart = 0;
    this.curMeasure = 0;
    this.curVoice = 0;
    this.curNote = 0;
    this.Socket = socket;
    this.data = data['score'];
    this.context = ctx;
    this.color = color;
    this.CurTick = this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote];
    this.g = null; // to store the glow and remove it 
    this.draw();
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
        if (charCode === 74 || charCode === 75 || (charCode >= 37 && charCode <= 40)) {
          _this.Socket.emit('position', _this.curPart, _this.curMeasure, _this.curNote);
        }
      }
    }, false);
  };

  Flat.Cursor.prototype.getCursorPos = function() {
    var res = {
      curPart : 0,
      curMeasure : 0,
      curVoice : 0,
      curNote : 0
    };
    res.curPart = this.curPart;
    res.curMeasure = this.curMeasure;
    res.curVoice = this.curVoice;
    res.curNote = this.curNote;
    return res;
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
    this.g.remove();
  };

  Flat.Cursor.prototype.draw = function() {
    if (this.curMeasure !== null && this.curVoice !== null && this.curNote !== null) {
      this.CurTick = this.data['score-partwise']['part'][this.curPart]['measure'][this.curMeasure]['$fermata']['vexVoices'][this.curVoice]['tickables'][this.curNote];
      this.g = this.CurTick.st.glow({width: 6, color: this.color});
    }
  };
}).call(this);