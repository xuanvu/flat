/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

  Fermata.Render.prototype.NoteType = 
  {
    NORMAL: "normal",
    CUE: "cue",
    GRACE: "grace"
  };

 Fermata.Render.prototype.renderNote = function(note)
  {
    var noteType = this.getNoteType(note);
    
    var processes = [
    {
      val: this.NoteType.NORMAL,
      func: this.renderNormalNote
    },
    {
      val: this.NoteType.CUE,
      func: this.renderCueNote
    },
    {
      val: this.NoteType.GRACE,
      func: this.renderGraceNote
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