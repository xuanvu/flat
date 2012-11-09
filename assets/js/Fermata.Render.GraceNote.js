/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
  throw ("Fermata.Render.js MUST be included before Fermata.Render.GraceNote.js");
}

(function () {
  "use strict";
  
   Fermata.Render.prototype.renderGrace = function (grace)
  {
    this.renderGraceAttributes(grace);
  }
  
  Fermata.Render.prototype.renderGraceAttributes = function (grace)
  {
    var stealTimePrevious = 0;
    var stealTimeFollowing = 0;
    var makeTime = 0;
    var slash = false;
    
    if (typeof(grace["steal-time-previous"]) !== "undefined")
    {
      stealTimePrevious = grace["steal-time-previous"];
    }
    
    if (typeof(grace["steal-time-following"]) !== "undefined")
    {
      stealTimeFollowing = grace["steal-time-following"];
    }
    
    if (typeof(grace["make-time"]) !== "undefined")
    {
      makeTime = grace["make-time"];
    }
    
    if (typeof(grace["slash"]) !== "undefined")
    {
      if (grace["slash"] === "true")
      {
        slash = grace["slash"];
      }
    //TODO: what do we do if the value is not false neither true ?
    }
  }
  
}).call(this);
