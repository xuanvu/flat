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
      func: function(){
        obj.renderMeasure();
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
      func: function(){
        obj.renderNote();
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
      func: function(){
        obj.renderAttributes();
      }
    },
    {
      key: "harmony",
      type: this.FuncTypes.STAR,
      func: null//TODO implement this function
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

  Fermata.Render.prototype.render = function (measure) {
    var stave = new Vex.Flow.Stave(10, 0, 500);
    var clef = measure["attributes"].clef.sign.$t;
    var clefName = Fermata.Mapping.Clef.getVexflow(clef);
    stave.addClef(clefName);
    stave.setContext(this.ctx);
    stave.draw();

  //TODO: to be continued...
  }

}).call(this);
