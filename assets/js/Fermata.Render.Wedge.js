var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
    throw ("Fermata.Render.js MUST be included before Fermata.Render.Wedge.js");
}

(function () {
    "use strict";

    Fermata.Render.prototype.WedgeType =
	{
	    CRESCENDO: "crescendo",
	    DIMINUENDO: "diminuendo",
	    STOP: "stop",
	    CONTINUE: "continue"
	};

    Fermata.Render.prototype.renderWedge = function (wedge)
    {
	var wedgeType = this.getWedgeType(wedge);

	var processes = [
	    {
		val: this.wedgeType.CRESCENDO,
		func: function(){
		    this.renderCrescendoWedge();
		}
	    },
	    {
		val: this.wedgeType.DIMINUENDO,
		func: function(){
		    this.renderDiminuendoWedge();
		}
	    },
	    {
		val: this.wedgeType.STOP,
		func: function(){
		    this.renderStopWedge();
		}
	    },
	    {
		val: this.wedgeType.CONTINUE,
		func: function(){
		    this.renderContinueWedge();
		}
	    }];

	//TODO All.
    }

    Fermata.Render.prototype.getWedgeType = function (wedge)
    {
    }

    Fermata.Render.prototype.renderCrescendoWedge = function(crescendoWedge)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderDiminuendoWedge = function(diminuendoWedge)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderStopWedge = function(stopWedge)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderContinueWedge = function(continueWedge)
    {
	//TODO: implement
    }

}).call(this);
