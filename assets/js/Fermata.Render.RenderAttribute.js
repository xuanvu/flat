/*
  Files that is containing all functions to treat with measures 
  attributes
  */


  /*
    this functions takes a node of attribute using to
    describes a measure.
    it's not the same as renderMeasureAttributes using to parse
    attribute in XML declaration !!
   */
  Fermata.Render.prototype.renderAttributes = function(attributes)
  {
    // Elements entities will be implement later
    var process = [
    {
      key: "division",
      type: this.FuncTypes.QUESTION,
      func: function(){this.Attributedivision()}
    },
    {
      key: "key",
      type: this.FuncTypes.STAR,
      func: function(){this.renderAttributes.keys()}
    },
    {
      key: "time",
      type: this.FuncTypes.STAR,
      func: function(){this.renderAttributes.time()}
    },
    {
      key: "staves",
      type: this.FuncTypes.QUESTION,
      func: null // TODO 
    },
    {
      key: "part-symbol",
      type: this.FuncTypes.QUESTION,
      func: null // TODO
    },
    {
      key: "instruments",
      type: this.FuncTypes.QUESTION,
      func: function(){this.AttributeInstrument()}
    },
    {
      key: "clef",
      type: this.FuncTypes.STAR,
      func: null // TODO
    },
    {
      key: "staff-details",
      type: this.FuncTypes.STAR,
      func: null // TODO
    },
    {
      key: "transpose",
      type: this.FuncTypes.STAR,
      func: null // TODO
    },
    {
      key: "directive",
      type: this.FuncTypes.STAR,
      func: null // TODO
    },
    {
      key: "measure-style",
      type: this.FuncTypes.STAR,
      func: null
    }
    ];

    this.exploreSubNodes(attributes, process);
  }

  Fermata.Render.prototype.renderAttributes.time = function (node)
  {
    //To do géré la multidefinition de beat
    var process = [
      {
        key: "beats",
        type: this.FuncTypes.DEFAULT,
        func: this.renderAttributes.time.beats
      },
      {
        key: "beat-types",
        type: this.FuncTypes.DEFAULT,
        func:this.renderAttributes.time.types
      },
    ];
  }

  Fermata.Render.prototype.renderAttributes.time.beats = function (node)
  {
    this.Attributesdata.beat.beats = node["beats"];
  }

    Fermata.Render.prototype.renderAttributes.time.types = function (node)
  {
    this.Attributesdata.beat.type = node["beat-type"];
  }

  Fermata.Render.prototype.renderAttributes.keys = function (node)
  {
    if (typeof(node["fifths"]) !== "undefined")
    {
      var process = [
      {
        key: "cancel",
        type: this.FuncTypes.QUESTION,
        func: null // TODO
      },
      {
        key: "fifths",
        type: this.FuncTypes.DEFAULT,
        func: this.AttributeKeyFifth
      },
      {
        key: "mode",
        type: this.FuncTypes.QUESTION,
        func: null
      }
      ];
      this.exploreSubNodes(attributes, process);
    }
    else
    {
      // TODO manage fact that this key can appaears many times
      var process = [
      {
        key: "key-step",
        type: this.FuncTypes.DEFAULT,
        func: null // TODO
      },
      {
        key: "key-alter",
        type: this.FuncTypes.DEFAULT,
        func: null // TODO
      },
      {
        key: "key-accidental",
        type: this.FuncTypes.QUESTION,
        func: null // TODO
      }
      ];
      this.exploreSubNodes(attributes, process);
    }
      var process = [
      {
        key: "key-octave",
        type: this.FuncTypes.STAR,
        func: null
      }
      ];
  }
  
  Fermata.Render.prototype.Attributedivision = function(node)
  {
    this.Attributesdata.division = node["division"];
  }

  Fermata.Render.prototype.AttributeInstrument = function(node)
  {
    this.Attributesdata.instrument = node["instruments"];
  }

  Fermata.Render.prototype.AttributeKeyFifth = function(node)
  {
    this.Attributesdata.key.fifths = node["fifths"];
  }

  Fermata.Render.prototype.Attributesdata = {
    division: null,
    instrument: null,
    keys:  {
      cancel: null,
      fifths: null,
      mode: null
    },
    beat: {
      beats: null,
      type: null,
      interchangeable: null
    }
  };
  