/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
  throw ("Fermata.Render.js MUST be included before Fermata.Render.NormalNote.js");
}

(function () {
  "use strict";
  
    
  Fermata.Render.prototype.renderNormalNote = function(normalNote)
  {
    this.renderFullNote(normalNote);
    var duration = normalNote["duration"]["$t"];
    this.renderNoteCommon(normalNote);
  }
  
}).call(this);
