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
    func: function(){
      this.Attributedivision();
    }
  },
  {
    key: "key",
    type: this.FuncTypes.STAR,
    func: function(){
      this.AttributesKeys();
    }
  },
  {
    key: "time",
    type: this.FuncTypes.STAR,
    func: function(){
      this.AttributesTime();
    }
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
    func: function(){
      this.AttributeInstrument();
    }
  },
  {
    key: "clef",
    type: this.FuncTypes.STAR,
    func: this.AttributesClef // TODO
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

Fermata.Render.prototype.AttributesClef = function (node)
{
  // TOdo beaucoup d'Entities ici !
  var process = [
  {
    key: "sign",
    type: this.FuncTypes.DEFAULT,
    func: function(){
      this.AttributesClefSign()
      }
  },
  {
    key: "line",
    type: this.FuncTypes.QUESTION,
    func: function(){
      this.AttributesClefLine()
      }
  },
  {
    key: "clef-octave-change",
    type: this.FuncTypes.QUESTION,
    func: null
  }
  ];
  this.exploreSubNodes(node, process);
}

Fermata.Render.prototype.AttributesClefLine = function (node)
{
  this.Attributesdata.clef.line = node["line"];
}

Fermata.Render.prototype.AttributesClefSign = function (node)
{
  this.Attributesdata.clef.sign = node["sign"];
}

Fermata.Render.prototype.AttributesTime = function (node)
{
  //To do géré la multidefinition de beat
  var process = [
  {
    key: "beats",
    type: this.FuncTypes.DEFAULT,
    func: function(){
      this.AttributesTimeBeats()
      }
  },
  {
    key: "beat-types",
    type: this.FuncTypes.DEFAULT,
    func: function(){
      this.renderAttributesTimeTypes()
      }
  },
  ];
  this.exploreSubNodes(node, process);
}

Fermata.Render.prototype.renderAttributesTimeBeats = function (node)
{
  this.Attributesdata.beat.beats = node["beats"];
}

Fermata.Render.prototype.renderAttributesTimeTypes = function (node)
{
  this.Attributesdata.beat.type = node["beat-type"];
}

Fermata.Render.prototype.AttributesKeys = function (node)
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
    this.exploreSubNodes(node, process);
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
    this.exploreSubNodes(node, process);
  }
  var process = [
  {
    key: "key-octave",
    type: this.FuncTypes.STAR,
    func: null
  }
  ];
  this.exploreSubNodes(node, process);
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
  },
  clef: {
    sign: null,
    line: null,
    change: null
  }
};

