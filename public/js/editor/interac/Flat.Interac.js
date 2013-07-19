var Flat = Flat || {};

(function() {
	"use strict";

	Flat.Interac = function(data, ctx) {
		this.data = data;
		this.Cursor = new Flat.Cursor(data, ctx);
		this.ActionFocus = null;
	};
}).call(this);