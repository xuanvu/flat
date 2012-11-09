/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var Fermata =          Fermata || {};
Fermata.Mapping =      Fermata.Mapping || {};
Fermata.Mapping.Clef = {};

(function () {
  "use strict";

  var musicXMLToVexflow = {
    "G": "treble",
    "F": "bass",
    "C": "alto",
    "TAB": "TAB"
  };

  var vexFlowToMusicXml = {};

  for (key in this.musicXMLToVexflow) {
    var value = musicXMLToVexflow[key];

    this.vexFlowToMusicXml[value] = key;
  }


  Fermata.Mapping.Clef.getVexflow = function(musicXml) {
    return musicXMLToVexflow[musicXml];
  }

  Fermata.Mapping.Clef.getMusicXml = function(vexflow) {
    return vexFlowToMusicXml[vexflow];
  }
}).call(this);
