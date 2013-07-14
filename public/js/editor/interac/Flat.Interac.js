var Flat = Flat || {};

(function() {
	"use strict";

	Flat.Interac = function(data, ctx, render, drawer) {
		this.data = data;
		this.render = render;
		this.drawer = drawer;
		this.Cursor = new Flat.Cursor(data, ctx);
		this.ActionFocus = null;
	};
}).call(this);