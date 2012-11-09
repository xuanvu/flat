var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
    throw ("Fermata.Render.js MUST be included before Fermata.Render.Harmony.js");
}

(function () {
    "use strict";

    Fermata.Render.prototype.HarmonyType =
	{
	    EXPLICIT: "explicit",
	    IMPLIED: "implied",
	    ALTERNATE: "alternate"
	};

    Fermata.Render.prototype.renderHarmony = function (harmony)
    {
	var HarmonyType = this.getHarmonyType(harmony);

	var processes = [
	    {
		val: this.HarmonyType.EXPLICIT,
		func: function(){
		    this.renderExplicitHarmony();
		}
	    },
	    {
		val: this.HarmonyType.IMPLIED,
		func: function(){
		    this.renderImpliedHarmony();
		}
	    },
	    {
		val: this.HarmonyType.ALTERNATE,
		func: function(){
		    this.renderAlternateHarmony();
		}
	    }];

      //TODO All.
    }

    Fermata.Render.prototype.getHarmonyType = function (harmony)
    {
    }

    Fermata.Render.prototype.renderCueHarmony = function(explicitHarmony)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderNormalHarmony = function(impliedHarmony)
    {
	//TODO: implement
    }

    Fermata.Render.prototype.renderGraceHarmony = function(alternateHarmony)
    {
	//TODO: implement
    }

}).call(this);
