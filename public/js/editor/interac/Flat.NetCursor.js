var Flat = Flat || {};

(function() {
  "use strict";


  Flat.NetCursor = function(data, ctx, socket, mainUID) {
  	this.user = [];
  	this.data = data;
  	this.context = ctx;
  	this.socket = socket;
  	this.mainUID = mainUID;
  	this.user[mainUID] = new Flat.Cursor(data, ctx, socket, 'black');
  	this.user[mainUID].initKeyEvents();
  };

  Flat.NetCursor.prototype.addGuys = function(uid, color, position) {
  	this.user[uid] = new FLat.Cursor(this.data, this.context, this.socket, color);
  	this.user[uid].setFocus(position);
  };

  Flat.NetCursor.prototype.delGuys = function(uid) {
  	this.user[uid].undraw();
  	pos = this.user.indefOf(uid);
  	this.user.splice(pos, 1);
  };

  Flat.NetCursor.prototype.getMain = function() {
  	return this.user[this.mainUID];
  };

}).call(this);