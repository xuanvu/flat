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
  
}).call(this);