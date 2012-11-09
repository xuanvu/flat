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
  var obj = this;
  var process = [
  {
    key: "divisions",
    type: this.FuncTypes.QUESTION,
    func: function(arg){
      obj.Attributedivision(arg);
    }
  },
  {
    key: "key",
    type: this.FuncTypes.STAR,
    func: function(arg){
      obj.AttributesKeys(arg);
    }
  },
  {
    key: "time",
    type: this.FuncTypes.STAR,
    func: function(arg){
      obj.AttributesTime(arg);
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
    func: function(arg){
      obj.AttributeInstrument(arg);
    }
  },
  {
    key: "clef",
    type: this.FuncTypes.STAR,
    func: function(arg){
      obj.AttributesClef(arg)
      }
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
  var obj = this;
  var process = [
  {
    key: "sign",
    type: this.FuncTypes.DEFAULT,
    func: function(arg){
      obj.AttributesClefSign(arg)
      }
  },
  {
    key: "line",
    type: this.FuncTypes.QUESTION,
    func: function(arg){
      obj.AttributesClefLine(arg)
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
  this.Attributesdata.clef.line = node["$t"];
}

Fermata.Render.prototype.AttributesClefSign = function (node)
{
  this.Attributesdata.clef.sign = node["$t"];
}

Fermata.Render.prototype.AttributesTime = function (node)
{
  //To do géré la multidefinition de beat
  var obj = this;
  var process = [
  {
    key: "beats",
    type: this.FuncTypes.DEFAULT,
    func: function(arg){
      obj.renderAttributesTimeBeats(arg)
      }
  },
  {
    key: "beat-type",
    type: this.FuncTypes.DEFAULT,
    func: function(arg){
      obj.renderAttributesTimeTypes(arg);
      }
  },
  ];
  this.exploreSubNodes(node, process);
}

Fermata.Render.prototype.renderAttributesTimeBeats = function (node)
{
  this.Attributesdata.beat.beats = node["$t"];
}

Fermata.Render.prototype.renderAttributesTimeTypes = function (node)
{
  this.Attributesdata.beat.type = node["$t"];
}

Fermata.Render.prototype.AttributesKeys = function(node)
{
  var obj = this;
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
      func: function(arg){
        obj.AttributeKeyFifth(arg)
      }
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
  this.Attributesdata.division = node["$t"];
}

Fermata.Render.prototype.AttributeInstrument = function(node)
{
  this.Attributesdata.instrument = node["$t"];
}

Fermata.Render.prototype.AttributeKeyFifth = function(node)
{
  this.Attributesdata.keys.fifths = node["$t"];
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

