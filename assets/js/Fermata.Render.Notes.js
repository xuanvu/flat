/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function RenderNotes(notesData)
{
  this.notesData = notesData;
  this.notes = [];
  this.noteConverter = null;
}

RenderNotes.prototype.render = function ()
{
  for (var i = 0 ; i < this.notesData.length ; i++)
  {
    var noteData = this.notesData[i];
    
    var note = this.noteConverter.convert(noteData);
    this.notes.push(note);
  }
  
  return this.notes;
}

RenderNotes.prototype.setNoteConverter = function (noteConverter)
{
  this.noteConverter = noteConverter;
}
