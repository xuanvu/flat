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