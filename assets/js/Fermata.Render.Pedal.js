var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
    throw ("Fermata.Render.js MUST be included before Fermata.Render.Pedal.js");
}

(function () {
    "use strict";

    Fermata.Render.prototype.PedalType =
	{
	    START: "start",
	    STOP: "stop",
	    CONTINUE: "continue",
	    CHANGE: "change"
	};

    Fermata.Render.prototype.renderPedal = function (pedal)
    {
	var PedalType = this.getPedalType(pedal);

	var processes = [
	    {
		val: this.PedalType.START,
		func: function(){
		    this.renderStartPedal();
		}
	    },
	    {
		val: this.PedalType.STOP,
		func: function(){
		    this.renderStopPedal();
		}
	    },
	    {
		val: this.PedalType.CONTINUE,
		func: function(){
		    this.renderContinuePedal();
		}
	    }
	    {
		val: this.PedalType.CHANGE,
		func: function(){
		    this.renderChangePedal();
		}
	    }];

      //TODO All.
    }

    Fermata.Render.prototype.getPedalType = function (pedal)
    {
    }

    Fermata.Render.prototype.renderStartPedal = function(startPedal)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderStopPedal = function(stopPedal)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderContinuePedal = function(continuePedal)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderChangePedal = function(changePedal)
    {
	//TODO: implement
    }

}).call(this);
