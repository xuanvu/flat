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

      console.log(data.getParts());
  };
}).call(this);