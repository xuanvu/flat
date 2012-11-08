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
      func: this.Attributedivision // TODO implement function to treat division
    },
    {
      key: "key",
      type: this.FuncTypes.STAR,
      func: null // TODO
    },
    {
      key: "time",
      type: this.FuncTypes.STAR,
      func: null // TODO
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
      func: this.AttributeInstrument
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

  Fermata.render.prototype.renderAttributes.keys = function (node)
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
    ];
    dump(this.Attributesdata);
  }
  
  Fermata.render.prototype.Attributedivision = function(node)
  {
    this.Attributesdata.division = node["division"];
  }

  Fermata.render.prototype.AttributeInstrument = function(node)
  {
    this.Attributesdata.instrument = node["instruments"];
  }

  Fermata.render.prototype.AttributeKeyFifth = function(node)
  {
    this.Attributesdata.key.fifths = node["fifths"];
  }

  Fermata.render.prototype.Attributesdata = {
    division: null,
    instrument: null,
    keys:  {
      cancel: null,
      fifths: null,
      mode: null
    }
  };