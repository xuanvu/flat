/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var Fermata = Fermata || {};

if (typeof(Fermata.Render) === "undefined")
{
  throw ("Fermata.Render.js MUST be included before Fermata.Render.Note.js");
}

(function () {
  "use strict";
  
  Fermata.Render.prototype.NoteType =
  {
    NORMAL: "normal",
    CUE: "cue",
    GRACE: "grace"
  };
  
  Fermata.Render.prototype.renderNote = function(note)
  {
    var noteType = this.getNoteType(note);
    
    var obj = this;
    var processes = [
    {
      val: this.NoteType.NORMAL,
      func: function(){
        obj.renderNormalNote(note);
      }
    },
    {
      val: this.NoteType.CUE,
      func: function(){
        obj.renderCueNote(note);
      }
    },
    {
      val: this.NoteType.GRACE,
      func: function(){
        obj.renderGraceNote(note);
      }
    }];
    
    for (var i = 0 ; i < processes.length ; i++)
    {
      var process = processes[i];
      
      if (process.val === noteType)
      {
        process.func(note);
      }
    }
  }
  
  Fermata.Render.prototype.getNoteType = function (note)
  {
    if (typeof(note["grace"]) !== "undefined")
    {
      return this.NoteType.GRACE;
    }
    else if (typeof(note["cue"]) !== "undefined")
    {
      return this.NoteType.CUE;
    }
    else
    {
      return this.NoteType.NORMAL;
    }
  }
  
  Fermata.Render.prototype.renderFullNote = function (fullNote)
  { 
    var obj = this;  
    var processes = [
    {
      key: "pitch",
      type: this.FuncTypes.QUESTION,
      func: function (arg){
        obj.renderPitch(arg);
      }
    },
    
    {
      key: "unpitched",
      type: this.FuncTypes.QUESTION,
      func: null//TODO: implement the function
    },
    
    {
      key: "rest",
      type: this.FuncTypes.QUESTION,
      func: null//TODO: implement the function
    }];
 
    this.exploreSubNodes(fullNote, processes);
    
    var chord = false;
    if (typeof(fullNote["chord"]) !== "undefined")
    {
      chord = true;
    }
  }
  
  Fermata.Render.prototype.renderNoteCommon = function (note)
  {
    var obj = this;  
    var processes = [
    {
      key: "type",
      type: this.FuncTypes.QUESTION,
      func: function (arg){
        obj.renderType(arg);
      }//TODO: add the others elements
    }];
  
    this.exploreSubNodes(note, processes);
  }
  
  Fermata.Render.prototype.renderPitch = function (pitch)
  {
    var alter = 0;
    var step = pitch["step"]["$t"];
    var octave = pitch["octave"]["$t"];
    
    if (typeof(pitch["alter"]) !== "undefined")
    {
      alter = pitch["alter"]["$t"];
    }
  };
  
  Fermata.Render.prototype.renderUnpitched = function (unpitched)
  {
    var displayStep = null;
    var displayOctave = null;
    
    if (typeof(unpitched["display-step"]) !== "undefined")
    {
      displayStep = unpitched["display-step"]["$t"];
    }
    if (typeof(unpitched["display-octave"]) !== "undefined")
    {
      displayOctave = unpitched["display-octave"]["$t"];
    }
  };
  
  Fermata.Render.prototype.renderRest = function (rest)
  {
    var displayStep = null;
    var displayOctave = null;
    var measure = false;
    
    if (typeof(rest["display-step"]) !== "undefined")
    {
      displayStep = rest["display-step"]["$t"];
    }
    if (typeof(rest["display-octave"]) !== "undefined")
    {
      displayOctave = rest["display-octave"]["$t"];
    }
    if (typeof(rest["measure"]) !== "undefined")
    {
      if (rest["measure"] === "yes")
      {
        measure = true;
      }
    }
  };
  
  Fermata.Render.prototype.renderTie = function (tie)
  {
  //TODO
  };
  
  Fermata.Render.prototype.SymbolSize = 
  {
    FULL: "full",
    CUE: "cue",
    LARGE: "large"
  };
  
  Fermata.Render.prototype.renderType = function (type)
  {
    var value = type["$t"];
    var size = this.SymbolSize.FULL;
    
    if (typeof(type["size"]) !== "undefined")
    {
      if (type["size"] === this.SymbolSize.CUE)
      {
        size = this.SymbolSize.CUE;
      }
      else if (type["size"] === this.SymbolSize.LARGE)
      {
        size = this.SymbolSize.LARGE;
      }
    }
    
  };
  
}).call(this);
