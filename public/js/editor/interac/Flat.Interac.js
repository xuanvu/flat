var Flat = Flat || {};

(function() {
	"use strict";

	Flat.Interac = function(data, ctx, render, drawer, socket, RealTime, Cursor) {
		this.data = data;
		this.render = render;
		this.drawer = drawer;
		this.Socket = socket;
		this.RealTime = RealTime;
		this.Cursor = Cursor;
		this.ActionFocus = null;
	};
}).call(this);