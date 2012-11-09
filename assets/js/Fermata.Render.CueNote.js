/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
  throw ("Fermata.Render.js MUST be included before Fermata.Render.CueNote.js");
}

(function () {
  "use strict";
  
  Fermata.Render.prototype.renderCueNote = function(cueNote)
  {
    var obj = this;  
    var processes = [  
    {
      key: "cue",
      type: this.FuncTypes.DEFAULT,
      func: null//TODO: implement the function
    }];
    this.exploreSubNodes(cueNote, processes);
      
    this.renderFullNote(cueNote);
    var duration = cueNote["duration"]["$t"];
  }
  
}).call(this);
