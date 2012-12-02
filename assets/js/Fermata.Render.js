var Fermata = Fermata || {};

(function () {
  "use strict";

  Fermata.Render = function (data, container) {
    this.data = data;
    this.container = container;

    // Client-side, jQuery selector
    if (container !== null) {
      this.container = $(container)[0];
      this.renderer = new Vex.Flow.Renderer(this.container, Vex.Flow.Renderer.Backends.CANVAS);
    }
    // Server-side // TODO
    else {
      this.renderer = new Vex.Flow.Renderer(this.container, Vex.Flow.Renderer.Backends.SVG);
    }

    this.ctx = this.renderer.getContext();

  //data.sortMeasure();
  //console.log(data.getMesure(1, 'P1'));
  };

  Fermata.Render.prototype.renderAll = function() {
    var parts = this.data.getParts();

    for (var i = 0 ; i < parts.idx.length ; i++) {
      var part = parts.idx[i];
      this.renderPart(part);
    }
    this.render();
  }

  Fermata.Render.prototype.render = function () {
    var stave = new Vex.Flow.Stave(10, 0, 800);
    var clefName = Fermata.Mapping.Clef.getVexflow(this.Attributesdata.clef.sign);
    stave.addClef(clefName).setContext(this.ctx).draw();
    stave.addTimeSignature("C");

 

    // Create the notes
    var notes = [
    // A quarter-note C.
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q" }),

    // A quarter-note D.
    new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }),

    // A quarter-note rest. Note that the key (b/4) specifies the vertical
    // position of the rest.
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr" }),

    // A C-Major chord.
    new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
    ];

    stave.setContext(this.ctx);

     // Create a voice in 4/4
  var voice = new Vex.Flow.Voice({
    num_beats: 4,
    beat_value: 4,
    resolution: Vex.Flow.RESOLUTION
  });

  // Add notes to voice
  voice.addTickables(notes);

  // Format and justify the notes to 500 pixels
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 700);

  // Render voice
  voice.draw(this.ctx, stave);



  //TODO: to be continued...
  }

  //Note: info in score element
  Fermata.Render.prototype.renderScorePartwise = function (scorePartwise)
  {
    //TODO: process document-attributes
    this.renderScoreHeader(scorePartwise);
    var obj = this;
    var processes = [
    {
      key: "part",
      type: this.FuncTypes.PLUS,
      func: function(){
        obj.renderPart();
      }
    }
    ];

    this.exploreSubNodes(scorePartwise, processes);
  }

  Fermata.Render.prototype.renderScoreHeader = function (scoreHeader)
  {
    var processes = [
    {
      key: "work",
      type: this.FuncTypes.QUESTION,
      func: null//TODO: implement the function
    },

    {
      key: "movement-number",
      type: this.FuncTypes.QUESTION,
      func: null//TODO: implement the function
    },

    {
      key: "movement-title",
      type: this.FuncTypes.QUESTION,
      func: null//TODO: implement the function
    },

    {
      key: "identification",
      type: this.FuncTypes.QUESTION,
      func: null//TODO: implement the function
    },

    {
      key: "defaults",
      type: this.FuncTypes.QUESTION,
      func: null//TODO: implement the function
    },
    {
      key: "credit",
      type: this.FuncTypes.STAR,
      func: null//TODO: implement the function
    },

    {
      key: "part-list",
      type: this.FuncTypes.DEFAULT,
      func: null//TODO: implement the function
    }
    ]

    this.exploreSubNodes(scoreHeader, processes);
  }

  Fermata.Render.prototype.renderPart = function (part)
  {
    var obj = this;
    var processes = [
    {
      key: "measure",
      type: this.FuncTypes.PLUS,
      func: function(arg){
        obj.renderMeasure(arg);
      }
    }
    ];

    this.exploreSubNodes(part, processes);
  }

  Fermata.Render.prototype.renderMeasure = function (measure)
  {
    Fermata.Render.prototype.renderMeasureAttributes(measure);

    var obj = this;
    var processes = [
    {
      key: "note",
      type: this.FuncTypes.STAR,
      func: function(arg){
        obj.renderNote(arg);
      }
    },

    {
      key: "backup",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },

    {
      key: "forward",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },

    {
      key: "direction",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },
    {
      key: "attributes",
      type: this.FuncTypes.STAR,
      func: function(arg){
        obj.renderAttributes(arg);
      }
    },
    {
      key: "harmony",
      type: this.FuncTypes.STAR,
      func: function(){
        obj.renderHarmony();
      }
    },
    {
      key: "figured-bass",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },
    {
      key: "print",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },    {
      key: "sound",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },    {
      key: "barline",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },
    {
      key: "grouping",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },
    {
      key: "link",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },
    {
      key: "bookmark",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
    },
    ];
    this.exploreSubNodes(measure, processes);
  }

  Fermata.Render.prototype.renderMeasureAttributes = function(measure)
  {
    //TODO : do the rest
    var number = measure["number"];
    var implicit = false;
    var nonControlling = false;
    var width = 0; //TODO: default value unknown. We have to lnow which one it is


    //TODO: refactor the verification
    if (typeof(measure["implicit"]) !== "undefined")
    {
      if (measure["implicit"] === "yes")
      {
        implicit = true;
      }
      else if (measure["implicit"] !== "no")
      {
      //invalid value
      //TODO: should we raise an exception ?
      }
    }

    if (typeof(measure["non-controlling"]) !== "undefined")
    {
      if (measure["non-controlling"] === "yes")
      {
        nonControlling = true;
      }
      else if (measure["non-controlling"] !== "no")
      {
      //invalid value
      //TODO: should we raise an exception ?
      }
    }

    if (typeof(measure["width"]) !== "undefined")
    {
      width = measure["width"]; //TODO: check if the value is a number
    }
  }

}).call(this);
