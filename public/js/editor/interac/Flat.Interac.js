var Flat = Flat || {};

(function() {
	"use strict";

	Flat.Interac = function(data, ctx, render, drawer, socket) {
		this.data = data;
		this.render = render;
		this.drawer = drawer;
		this.Cursor = new Flat.Cursor(data, ctx);
		this.Socket = socket;
		this.ActionFocus = null;
	};
}).call(this);