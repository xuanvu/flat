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
      
      this.render(part.measure[0]);
    }
  }
  
  
  //Note: info in score element
  Fermata.Render.prototype.renderScorePartwise = function (scorePartwise)
  {
    //TODO: process document-attributes
    this.renderScoreHeader(scorePartwise);
    var processes = [
    {
      key: "part", 
      type: this.FuncTypes.PLUS, 
      func: this.renderPart
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
    var processes = [
    {
      key: "measure", 
      type: this.FuncTypes.PLUS, 
      func: this.renderMeasure
    }
    ];
    
    this.exploreSubNodes(part, processes);
  }
  
  Fermata.Render.prototype.renderMeasure = function (measure)
  {
    this.renderMeasureAttributes(measure);
    
    
    var processes = [
    {
      key: "note", 
      type: this.FuncTypes.STAR, 
      func: this.renderNote
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
      func: null//TODO implement this function
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
    
    this.exploreSubNodes(part, processes);
  }
  
  Fermata.Render.prototype.NoteType = 
  {
    NORMAL: "normal",
    CUE: "cue",
    GRACE: "grace"
  };
  
  
  
  Fermata.Render.prototype.renderNote = function(note)
  {
    var noteType = this.getNoteType(note);
    
    var processes = [
    {
      val: this.NoteType.NORMAL,
      func: this.renderNormalNote
    },
    {
      val: this.NoteType.CUE,
      func: this.renderCueNote
    },
    {
      val: this.NoteType.GRACE,
      func: this.renderGraceNote
    }];
  
    for (var i = 0 ; i < processes.length ; i++)
    {
      var process = processes[i];
      
      if (process.val === noteType)
      {
        process.func(note);
      }
    }
  }
  
  Fermata.Render.prototype.getNoteType = function (note)
  {
    if (typeof(note["grace"]) !== "undefined")
    {
      return this.NoteType.GRACE;
    }
    else if (typeof(note["cue"]) !== "undefined")
    {
      return this.NoteType.CUE;
    }
    else
    {
      return this.NoteType.NORMAL;
    }
  }
  
  Fermata.Render.prototype.renderCueNote = function(cueNote)
  {
  //TODO: implement
  }
  
  Fermata.Render.prototype.renderNormalNote = function(normalNote)
  {
  //TODO: implement
  }
  
  Fermata.Render.prototype.renderGraceNote = function(graceNote)
  {
  //TODO: implement
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
  
  Fermata.Render.prototype.FuncTypes = 
  {
    STAR: "*",
    PLUS: "+",
    QUESTION: "?",
    DEFAULT: "default"
  };
  
  /**
   * object is the node of interest
   * processes is an array of objects:
   * {type, key, func}
   * type is the number of apparitions of the object
   * key is the key of the child element. 
   * func is the function to apply to the child elements
   */
  Fermata.Render.prototype.exploreSubNodes = function (object, processes)
  {
    for (var i = 0 ; i < processes.length ; i++)
    {
      var process = processes[i];
      
      if (process.type === this.FuncTypes.STAR)
      {
        this.call_0orN(object, process);
      }
      else if (process.type === this.FuncTypes.QUESTION)
      {
        this.call_0or1(object, process);
      }
      else if (process.type === this.FuncTypes.PLUS)
      {
        this.call_1orN(object, process);
      } 
      else if (process.type === this.FuncTypes.DEFAULT)
      {
        this.call_1(object, process);
      }
    }
  }
 
  Fermata.Render.prototype.call_1 = function (object, process)
  {
    var child = object[process.key];
      
    process.func(child);
  }
 
  Fermata.Render.prototype.call_1orN = function (object, process)
  {
    var child = object[process.key];
      
    for (var j = 0 ; j < child.length ; j++)
    {
      var elem = child[j];
        
      process.func(elem);
    }
  }


  Fermata.Render.prototype.call_0or1 = function (object, process)
  {
    if (typeof(object[process.key]) !== "undefined")
    {
      var child = object[process.key];
      
      process.func(child);
    }
  }
  
  Fermata.Render.prototype.call_0orN = function (object, process)
  {
    if (typeof(object[process.key]) !== "undefined")
    {
      var child = object[process.key];
      
      for (var j = 0 ; j < child.length ; j++)
      {
        var elem = child[j];
        
        process.func(elem);
      }
    }
  }

}).call(this);
